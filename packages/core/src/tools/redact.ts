import type { RedactColor } from '../processing/redact'
import type { Quad, Size } from '../processing/types'
import type { ViewPoint } from '../state/view'
import type { DrawSelection, Grip } from './corners'
import type { Tool } from './types'
import { rectangleCorners, scaleQuad } from '../processing/homography'
import { boxCorners, boxOf, clamp, constrainToTurnedRectangle, CornerEditor, cornerSession, outlineSelection, tracePath } from './corners'

/** How much of what an area covers still shows while the user places it, so it can go over the right words. */
const DRAFT_OPACITY = 0.6
/** How far the handle that turns the area sits outside its top side, in CSS pixels. */
const TURN_DISTANCE = 32
/** How close to a quarter turn the area snaps to it, in radians: 3 degrees. */
const SNAP = Math.PI / 60
const DEGREE = Math.PI / 180

/** Where the area starts: a band across the middle, the shape of a line of text or a number. */
function initialArea({ width, height }: Size): Quad {
  return rectangleCorners(width * 0.25, height * 0.4, width * 0.75, height * 0.6)
}

/**
 * The middle of the top side of the area, and the handle that turns it, outside that side at the same distance at any
 * zoom. Both are points of the viewport.
 */
function turnHandle([topLeft, topRight, , bottomLeft]: readonly ViewPoint[]): { handle: ViewPoint, middle: ViewPoint } {
  const middle = { x: (topLeft!.x + topRight!.x) / 2, y: (topLeft!.y + topRight!.y) / 2 }
  const up = { x: topLeft!.x - bottomLeft!.x, y: topLeft!.y - bottomLeft!.y }
  const length = Math.hypot(up.x, up.y) || 1
  return {
    middle,
    handle: {
      x: middle.x + up.x / length * TURN_DISTANCE,
      y: middle.y + up.y / length * TURN_DISTANCE,
    },
  }
}

/** An angle from -180 to 180 degrees, so a small turn to the left reads as negative. */
function signedDegrees(angle: number): number {
  const degrees = Math.round(angle / DEGREE) % 360
  return degrees > 180
    ? degrees - 360
    : degrees <= -180
      ? degrees + 360
      : degrees
}

/** Paints the area in its color, still see-through, outlines it, and joins it to the handle that turns it. */
function coverSelection(color: () => RedactColor): DrawSelection {
  return (context, _frame, selection) => {
    context.beginPath()
    tracePath(context, selection)
    context.globalAlpha = DRAFT_OPACITY
    context.fillStyle = color() === 'black'
      ? '#000'
      : '#fff'
    context.fill()
    context.globalAlpha = 1
    outlineSelection(context, selection)
    const { middle, handle } = turnHandle(selection)
    outlineSelection(context, [middle, handle])
  }
}

/** The whole area, which moves without changing its shape. Its center stays inside the frame. */
export const areaGrip: Grip = {
  label: 'redactArea',
  position: corners => boxOf(corners).center,
  move: (corners, point, frame) => boxCorners({
    ...boxOf(corners),
    center: {
      x: clamp(point.x, 0, frame.width),
      y: clamp(point.y, 0, frame.height),
    },
  }),
  cover: (element, corners) => {
    // Points of the viewport have the same fields as points of the frame
    const { center, width, height, angle } = boxOf(corners as unknown as Quad)
    element.style.left = `${center.x}px`
    element.style.top = `${center.y}px`
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.style.rotate = `${angle}rad`
  },
}

/**
 * The handle that turns the area around its center, as it points from the center. It snaps to a quarter turn, so the
 * area comes back level, and the arrow keys turn it 1 degree, or 10 with Shift.
 */
export const turnGrip: Grip = {
  label: 'redactTurn',
  keys: 'redactTurnKeys',
  position: (corners, host) => host.viewportToFrame(turnHandle(corners.map(point => host.frameToViewport(point))).handle),
  move: (corners, point) => {
    const box = boxOf(corners)
    // The handle sits above the top side, a quarter turn back from the direction of the top side
    const angle = Math.atan2(point.y - box.center.y, point.x - box.center.x) + Math.PI / 2
    const quarter = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2)
    return boxCorners({
      ...box,
      angle: Math.abs(angle - quarter) < SNAP
        ? quarter
        : angle,
    })
  },
  nudge: (corners, direction, far) => {
    const box = boxOf(corners)
    const step = (far ? 10 : 1) * (direction.x + direction.y)
    return boxCorners({
      ...box,
      angle: (signedDegrees(box.angle) + step) * DEGREE,
    })
  },
  describe: (corners, labels) => labels.redactAngle(signedDegrees(boxOf(corners).angle)),
}

/**
 * Covers an area of the image with black or white. The area is a rectangle, which the user moves by dragging it, turns
 * by its handle, so it can lean with a line of text, and resizes by its corners. Until then, a drag on the image
 * draws it somewhere else. Each Done leaves one area, and the
 * covers run after every other edit, so nothing shows through them.
 */
export const redactTool: Tool = {
  id: 'redact',
  hint: 'redactHint',
  actions: [
    {
      id: 'redact',
      run: context => context.openTool('redact'),
    },
  ],
  activate(host) {
    const frame = host.frameSize()
    const editor = new CornerEditor(host, initialArea(frame), constrainToTurnedRectangle, {
      draw: coverSelection(host.redactColor),
      under: [areaGrip],
      over: [turnGrip],
    })
    return {
      ...cornerSession(editor, () => ({
        type: 'redact',
        color: host.redactColor(),
        quad: scaleQuad(editor.points, 1 / frame.width, 1 / frame.height),
      })),
      canDrag: () => !editor.touched,
      drag: point => editor.draw(point),
      tap: point => editor.place(point) || editor.selectArea(point),
    }
  },
}
