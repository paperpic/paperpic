import type { Operation } from '../pipeline/operations'
import type { Point, Quad, Size } from '../processing/types'
import type { Magnifier } from '../render/magnifier'
import type { ViewPoint } from '../state/view'
import type { PaperPicLabels } from '../ui/labels'
import type { ToolHost, ToolSession } from './types'
import { TAP_MOVEMENT } from '../input/gestures'
import { rectangleCorners } from '../processing/homography'
import { overlayColors } from '../render/colors'
import { placeMagnifier } from './magnifier'

/** Paints a selection over the image, given the corners of the frame and of the selection in the viewport. */
export type DrawSelection = (context: CanvasRenderingContext2D, frame: readonly ViewPoint[], selection: readonly ViewPoint[]) => void

/** Decides where the corners end up when the user moves one of them towards a point. */
export type ConstrainCorner = (corners: Quad, index: number, point: Point, frame: Size) => Quad

const INITIAL_INSET = 0.1
/** The smallest selection, in image pixels. */
const MIN_SIDE = 16
const SHIFT_STEP = 10
const REVEAL_DIRECTIONS: Record<string, ViewPoint> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
}
const CORNER_LABELS = [
  'cornerTopLeft',
  'cornerTopRight',
  'cornerBottomRight',
  'cornerBottomLeft',
] as const

/** Numbers the description of the handles, so each viewer of a page has its own id. */
let descriptions = 0

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Where the corners start: inside the image, a little in from its edges. Nothing covers them, because the toolbar hides while editing. */
export function initialCorners(frame: Size): Quad {
  const left = frame.width * INITIAL_INSET
  const top = frame.height * INITIAL_INSET
  return rectangleCorners(left, top, frame.width - left, frame.height - top)
}

/** Keeps the corners a rectangle inside the frame, which never turns inside out. */
export const constrainToRectangle: ConstrainCorner = (corners, index, point, frame) => {
  const opposite = corners[(index + 2) % 4]!
  const isLeft = index === 0 || index === 3
  const isTop = index === 0 || index === 1
  const minWidth = Math.min(MIN_SIDE, frame.width)
  const minHeight = Math.min(MIN_SIDE, frame.height)
  const x = isLeft
    ? clamp(point.x, 0, opposite.x - minWidth)
    : clamp(point.x, opposite.x + minWidth, frame.width)
  const y = isTop
    ? clamp(point.y, 0, opposite.y - minHeight)
    : clamp(point.y, opposite.y + minHeight, frame.height)
  return rectangleCorners(
    isLeft ? x : opposite.x,
    isTop ? y : opposite.y,
    isLeft ? opposite.x : x,
    isTop ? opposite.y : y,
  )
}

function isConvex(corners: Quad, minTurn: number): boolean {
  return corners.every((corner, index) => {
    const next = corners[(index + 1) % 4]!
    const last = corners[(index + 2) % 4]!
    return (next.x - corner.x) * (last.y - next.y) - (next.y - corner.y) * (last.x - next.x) >= minTurn
  })
}

/**
 * Keeps the corners a convex shape inside the frame, so they can always be straightened.
 * A move that would break it slides along the side that still allows it, or stays where it was.
 */
export const constrainToConvex: ConstrainCorner = (corners, index, point, frame) => {
  const previous = corners[index]!
  const x = clamp(point.x, 0, frame.width)
  const y = clamp(point.y, 0, frame.height)
  const minSide = Math.min(MIN_SIDE, frame.width, frame.height)
  const candidates = [
    { x, y },
    { x, y: previous.y },
    { x: previous.x, y },
  ]
  for (const candidate of candidates) {
    const moved = corners.map((corner, position) => position === index
      ? candidate
      : corner) as unknown as Quad
    if (isConvex(moved, minSide * minSide)) {
      return moved
    }
  }
  return corners
}

/** A rectangle that may be turned: its center, its sides and the angle of its top side, in radians clockwise. */
export interface Box {
  angle: number
  center: Point
  height: number
  width: number
}

/** The box whose corners these are, in order from the top left one, as the turned rectangle sees them. */
export function boxOf(corners: Quad): Box {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners
  return {
    center: { x: (topLeft.x + bottomRight.x) / 2, y: (topLeft.y + bottomRight.y) / 2 },
    width: Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y),
    height: Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y),
    angle: Math.atan2(topRight.y - topLeft.y, topRight.x - topLeft.x),
  }
}

/** The directions of the sides of a box turned by an angle: along its top side, and down its left side. */
function axes(angle: number): { across: Point, down: Point } {
  return {
    across: {
      x: Math.cos(angle),
      y: Math.sin(angle),
    },
    down: {
      x: -Math.sin(angle),
      y: Math.cos(angle),
    },
  }
}

/** The corners of a box, from its top left one, clockwise. */
export function boxCorners({ center, width, height, angle }: Box): Quad {
  const { across, down } = axes(angle)
  const corner = (alongWidth: number, alongHeight: number): Point => ({
    x: center.x + across.x * alongWidth * width / 2 + down.x * alongHeight * height / 2,
    y: center.y + across.y * alongWidth * width / 2 + down.y * alongHeight * height / 2,
  })
  return [
    corner(-1, -1),
    corner(1, -1),
    corner(1, 1),
    corner(-1, 1),
  ]
}

/**
 * Keeps the corners a rectangle that may be turned. A corner resizes it along its own sides, while the opposite
 * corner stays, and the corner itself stays inside the frame.
 */
export const constrainToTurnedRectangle: ConstrainCorner = (corners, index, point, frame) => {
  const { angle } = boxOf(corners)
  const { across, down } = axes(angle)
  const opposite = corners[(index + 2) % 4]!
  const target = {
    x: clamp(point.x, 0, frame.width),
    y: clamp(point.y, 0, frame.height),
  }
  const offset = { x: target.x - opposite.x, y: target.y - opposite.y }
  // Which way this corner lies from the opposite one, along each side
  const sideX = index === 1 || index === 2
    ? 1
    : -1
  const sideY = index >= 2
    ? 1
    : -1
  const minSide = Math.min(MIN_SIDE, frame.width, frame.height)
  const width = Math.max(minSide, sideX * (offset.x * across.x + offset.y * across.y))
  const height = Math.max(minSide, sideY * (offset.x * down.x + offset.y * down.y))
  return boxCorners({
    angle,
    width,
    height,
    center: {
      x: opposite.x + (across.x * sideX * width + down.x * sideY * height) / 2,
      y: opposite.y + (across.y * sideX * width + down.y * sideY * height) / 2,
    },
  })
}

/** Adds a closed shape to the path of a context. */
export function tracePath(context: CanvasRenderingContext2D, points: readonly ViewPoint[]): void {
  points.forEach(({ x, y }, index) => {
    if (index === 0) {
      context.moveTo(x, y)
    }
    else {
      context.lineTo(x, y)
    }
  })
  context.closePath()
}

/** Outlines a selection, with a shadow so it shows on any image. */
export function outlineSelection(context: CanvasRenderingContext2D, selection: readonly ViewPoint[]): void {
  const { line, lineShadow } = overlayColors(context)
  context.beginPath()
  tracePath(context, selection)
  context.lineWidth = 3
  context.strokeStyle = lineShadow
  context.stroke()
  context.lineWidth = 1.5
  context.strokeStyle = line
  context.stroke()
}

/** Dims what stays out of a selection, and outlines it. */
const dimOutside: DrawSelection = (context, frame, selection) => {
  context.beginPath()
  tracePath(context, frame)
  tracePath(context, selection)
  context.fillStyle = overlayColors(context).dim
  context.fill('evenodd')
  outlineSelection(context, selection)
}

/** The keys of `PaperPicLabels` whose label is a text, such as the name of a grip. */
type TextLabel = { [Key in keyof PaperPicLabels]: PaperPicLabels[Key] extends string ? Key : never }[keyof PaperPicLabels]

/**
 * Something the user moves to change the corners: a corner itself, or another part of the selection, such as the
 * whole area or the handle that turns it.
 */
export interface Grip {
  /** Lays out an element that covers the area, from its corners in the viewport. A grip with it shows no dot. */
  cover?: (element: HTMLElement, corners: readonly ViewPoint[]) => void
  /** What screen readers hear after it moves. By default, its name and its position in image pixels. */
  describe?: (corners: Quad, labels: PaperPicLabels) => string
  /** The label that describes its keys to screen readers. By default, the one of the corners. */
  keys?: TextLabel
  /** Its name, whose key its `data-paperpic-control` holds. */
  label: TextLabel
  /** Whether a finger that drags it shows the magnifier, which only a precise point needs. */
  magnifies?: boolean
  /** The corners once the grip goes to a point of the frame. */
  move: (corners: Quad, point: Point, frame: Size) => Quad
  /** The corners after an arrow key. Without it, the grip moves 1 screen pixel, or 10 with Shift. */
  nudge?: (corners: Quad, direction: ViewPoint, far: boolean) => Quad
  /** Where it is, in the frame. */
  position: (corners: Quad, host: ToolHost) => Point
}

/** The grip of each corner, which moves as the constraint allows. */
function cornerGrips(constrain: ConstrainCorner): Grip[] {
  return CORNER_LABELS.map((label, index) => ({
    label,
    magnifies: true,
    position: corners => corners[index]!,
    move: (corners, point, frame) => constrain(corners, index, point, frame),
  }))
}

/**
 * The handles of a selection: elements that take the focus and work with a pointer and with the keyboard. Each one is
 * a corner, or another grip that a tool adds, such as the whole area. A handle moves by dragging it, or by pressing it
 * and then tapping the new place, which needs no drag.
 */
export class CornerEditor {
  private readonly host: ToolHost
  private readonly draw: DrawSelection
  private readonly grips: readonly Grip[]
  private readonly handles: HTMLButtonElement[]
  /** What the keys do, by the label that says it, which screen readers hear on each handle. The hint on screen speaks to a pointer. */
  private readonly descriptions = new Map<TextLabel, HTMLElement>()
  private corners: Quad
  private magnifier: Magnifier | null = null
  /** The handle that the next tap on the image moves. */
  private selected: number | null = null

  constructor(host: ToolHost, corners: Quad, constrain: ConstrainCorner, { draw = dimOutside, under = [], over = [] }: {
    /** Paints the selection. By default, it dims what stays out of it. */
    draw?: DrawSelection
    /** Grips above the corners, such as a handle outside the area. */
    over?: readonly Grip[]
    /** Grips below the corners, such as an area that the corners must stay on top of. */
    under?: readonly Grip[]
  } = {}) {
    this.host = host
    this.corners = corners
    this.draw = draw
    this.grips = [
      ...under,
      ...cornerGrips(constrain),
      ...over,
    ]
    for (const { keys = 'cornerKeys' } of this.grips) {
      if (!this.descriptions.has(keys)) {
        const description = document.createElement('span')
        description.id = `paperpic-handle-keys-${++descriptions}`
        description.hidden = true
        description.textContent = host.labels()[keys]
        this.descriptions.set(keys, description)
      }
    }
    this.handles = this.grips.map((grip, index) => this.createHandle(grip, index))
    host.layer.append(...this.descriptions.values(), ...this.handles)
    this.update()
  }

  /** The corners, in pixels of the frame. */
  get points(): Quad {
    return this.corners
  }

  /** Takes the keyboard focus on the first corner, without scrolling the page or the viewer. */
  focus(): void {
    this.handles[this.grips.findIndex(grip => grip.label === CORNER_LABELS[0])]!.focus({ preventScroll: true })
  }

  update(): void {
    const corners = this.corners.map(point => this.host.frameToViewport(point))
    this.handles.forEach((handle, index) => {
      const grip = this.grips[index]!
      if (grip.cover) {
        grip.cover(handle, corners)
        return
      }
      const { x, y } = this.host.frameToViewport(grip.position(this.corners, this.host))
      handle.style.left = `${x}px`
      handle.style.top = `${y}px`
    })
  }

  drawOverlay(context: CanvasRenderingContext2D): void {
    const { width, height } = this.host.frameSize()
    const frame = rectangleCorners(0, 0, width, height).map(point => this.host.frameToViewport(point))
    this.draw(context, frame, this.corners.map(point => this.host.frameToViewport(point)))
    if (this.magnifier) {
      this.host.paintMagnifier(context, this.magnifier)
    }
  }

  /** Moves the selected handle to a point of the viewport. Returns whether a handle was selected. */
  place(point: ViewPoint): boolean {
    const index = this.selected
    if (index === null) {
      return false
    }
    this.select(null)
    this.move(index, this.host.viewportToFrame(point))
    this.announce(index)
    return true
  }

  /** Where zoom keeps its place: the selected handle, or else the focused one, in the viewport. `null` for neither. */
  anchor(): ViewPoint | null {
    const focused = this.handles.findIndex(handle => handle === document.activeElement)
    const index = this.selected ?? (focused >= 0
      ? focused
      : null)
    return index === null
      ? null
      : this.host.frameToViewport(this.position(index))
  }

  /** Lets go of the selected handle. Returns whether a handle was selected. */
  deselect(): boolean {
    const wasSelected = this.selected !== null
    this.select(null)
    return wasSelected
  }

  deactivate(): void {
    this.select(null)
    for (const handle of this.handles) {
      handle.remove()
    }
    for (const description of this.descriptions.values()) {
      description.remove()
    }
  }

  private position(index: number): Point {
    return this.grips[index]!.position(this.corners, this.host)
  }

  /** Selects a handle, or none with `null`, and tells the user what to do next. */
  private select(index: number | null): void {
    if (index === this.selected) {
      return
    }
    this.selected = index
    this.handles.forEach((handle, position) => handle.setAttribute('aria-pressed', String(position === index)))
    if (index === null) {
      this.host.setHint(null)
      return
    }
    const labels = this.host.labels()
    const text = labels.cornerSelected(labels[this.grips[index]!.label])
    this.host.setHint(text)
    this.host.announce(text)
  }

  private move(index: number, point: Point): void {
    this.setCorners(this.grips[index]!.move(this.corners, point, this.host.frameSize()))
  }

  private setCorners(corners: Quad): void {
    this.corners = corners
    this.update()
    this.host.requestPaint()
  }

  private announce(index: number): void {
    const grip = this.grips[index]!
    const labels = this.host.labels()
    const { x, y } = this.position(index)
    this.host.announce(grip.describe
      ? grip.describe(this.corners, labels)
      : labels.cornerMoved(labels[grip.label], Math.round(x), Math.round(y)))
  }

  private createHandle(grip: Grip, index: number): HTMLButtonElement {
    const handle = document.createElement('button')
    handle.type = 'button'
    handle.className = grip.cover
      ? 'paperpic-area'
      : 'paperpic-handle'
    handle.dataset.paperpicControl = grip.label
    handle.setAttribute('aria-label', this.host.labels()[grip.label])
    handle.setAttribute('aria-pressed', 'false')
    handle.setAttribute('aria-describedby', this.descriptions.get(grip.keys ?? 'cornerKeys')!.id)

    let grab: ViewPoint | null = null
    let last: ViewPoint = { x: 0, y: 0 }
    let before: Quad = this.corners
    let travelled = 0
    // Whether a pointer tapped this handle. The click that ends a drag must not select the handle, and neither must
    // the click of a tap on the image, which lands on this handle once the tap has moved it there
    let tapped = false

    const localPoint = (event: PointerEvent): ViewPoint => {
      const { left, top } = this.host.layer.getBoundingClientRect()
      return { x: event.clientX - left, y: event.clientY - top }
    }

    handle.addEventListener('pointerdown', (event) => {
      // A handle keeps its own drag: the gestures on the viewer would pan the image
      event.stopPropagation()
      handle.setPointerCapture(event.pointerId)
      const { x, y } = this.host.frameToViewport(this.position(index))
      const point = localPoint(event)
      grab = { x: point.x - x, y: point.y - y }
      last = point
      before = this.corners
      travelled = 0
      tapped = false
      if (event.pointerType !== 'mouse') {
        // The other handles would cover the magnifier
        this.setOthersHidden(handle, true)
        this.showMagnifier(index, point)
      }
    })

    handle.addEventListener('pointermove', (event) => {
      if (!grab) {
        return
      }
      const point = localPoint(event)
      travelled += Math.hypot(point.x - last.x, point.y - last.y)
      last = point
      this.move(index, this.host.viewportToFrame({ x: point.x - grab.x, y: point.y - grab.y }))
      if (event.pointerType !== 'mouse') {
        this.showMagnifier(index, point)
      }
    })

    const release = (event: PointerEvent) => {
      if (!grab) {
        return
      }
      grab = null
      this.magnifier = null
      this.setOthersHidden(handle, false)
      if (travelled < TAP_MOVEMENT) {
        // A tap selects the handle, so the small shake of a finger must not move it
        tapped = event.type === 'pointerup'
        this.corners = before
        this.update()
      }
      else {
        this.select(null)
        this.announce(index)
      }
      this.host.requestPaint()
    }
    handle.addEventListener('pointerup', release)
    handle.addEventListener('pointercancel', release)

    // The keyboard and screen readers click with a `detail` of 0, and pointers with the number of clicks
    handle.addEventListener('click', (event) => {
      const fromPointer = event.detail > 0
      if (fromPointer && !tapped) {
        return
      }
      tapped = false
      this.select(this.selected === index
        ? null
        : index)
    })

    handle.addEventListener('focus', () => this.host.reveal(this.position(index)))

    handle.addEventListener('keydown', (event) => {
      const direction = REVEAL_DIRECTIONS[event.key]
      if (!direction) {
        return
      }
      // The arrow keys move the handle here, instead of panning the image
      event.preventDefault()
      event.stopPropagation()
      if (grip.nudge) {
        this.setCorners(grip.nudge(this.corners, direction, event.shiftKey))
      }
      else {
        const distance = event.shiftKey ? SHIFT_STEP : 1
        const position = this.host.frameToViewport(this.position(index))
        this.move(index, this.host.viewportToFrame({
          x: position.x + direction.x * distance,
          y: position.y + direction.y * distance,
        }))
      }
      this.host.reveal(this.position(index))
      this.announce(index)
    })

    return handle
  }

  private setOthersHidden(handle: HTMLButtonElement, hidden: boolean): void {
    for (const other of this.handles) {
      other.hidden = hidden && other !== handle
    }
  }

  private showMagnifier(index: number, finger: ViewPoint): void {
    if (!this.grips[index]!.magnifies) {
      return
    }
    const { width, height } = this.host.layer.getBoundingClientRect()
    this.magnifier = placeMagnifier(this.position(index), finger, { width, height })
    this.host.requestPaint()
  }
}

/**
 * The session of a tool that edits corners. Crop, Straighten and Redact differ only in how they constrain and paint the
 * corners, which goes to the editor, and in the edit that their corners mean, which `confirm` returns.
 */
export function cornerSession(editor: CornerEditor, confirm: () => Operation | null): ToolSession {
  return {
    anchor: () => editor.anchor(),
    focus: () => editor.focus(),
    update: () => editor.update(),
    drawOverlay: context => editor.drawOverlay(context),
    deactivate: () => editor.deactivate(),
    tap: point => editor.place(point),
    escape: () => editor.deselect(),
    confirm,
  }
}
