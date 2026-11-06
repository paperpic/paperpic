import type { Point, Quad } from '../processing/types'
import type { Size, ViewPoint } from '../state/view'
import type { Lens } from './magnifier'
import type { ToolHost } from './types'
import { placeLens } from './magnifier'

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** The corners of a rectangle. */
export function rectangleCorners(left: number, top: number, right: number, bottom: number): Quad {
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ]
}

/** Where the corners start: inside the image, and clear of the toolbar, which would cover the top right one. */
export function initialCorners(frame: Size, toolbarCorner: Point | null): Quad {
  const left = frame.width * INITIAL_INSET
  const top = frame.height * INITIAL_INSET
  const right = frame.width - left
  const bottom = frame.height - top
  const underToolbar = toolbarCorner !== null && top < toolbarCorner.y && right > toolbarCorner.x && toolbarCorner.x > left
  return rectangleCorners(left, top, underToolbar ? toolbarCorner.x : right, bottom)
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

/** Dims what stays out of a selection, and outlines it so it shows on any image. */
function drawSelection(context: CanvasRenderingContext2D, frame: readonly ViewPoint[], selection: readonly ViewPoint[]): void {
  const trace = (points: readonly ViewPoint[]) => {
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

  context.beginPath()
  trace(frame)
  trace(selection)
  context.fillStyle = 'rgb(0 0 0 / 50%)'
  context.fill('evenodd')

  context.beginPath()
  trace(selection)
  context.lineWidth = 3
  context.strokeStyle = 'rgb(0 0 0 / 60%)'
  context.stroke()
  context.lineWidth = 1.5
  context.strokeStyle = '#fff'
  context.stroke()
}

/** The corner handles of a selection: elements that take the focus and work with a pointer and with the keyboard. */
export class CornerEditor {
  private readonly host: ToolHost
  private readonly constrain: ConstrainCorner
  private readonly handles: HTMLButtonElement[]
  private corners: Quad
  private lens: Lens | null = null

  constructor(host: ToolHost, corners: Quad, constrain: ConstrainCorner) {
    this.host = host
    this.corners = corners
    this.constrain = constrain
    this.handles = CORNER_LABELS.map((label, index) => this.createHandle(label, index))
    host.layer.append(...this.handles)
    this.update()
  }

  /** The corners, in pixels of the frame. */
  get points(): Quad {
    return this.corners
  }

  /** Takes the keyboard focus, without scrolling the page or the viewer. */
  focus(): void {
    this.handles[0]!.focus({ preventScroll: true })
  }

  update(): void {
    this.handles.forEach((handle, index) => {
      const { x, y } = this.host.frameToViewport(this.corners[index]!)
      handle.style.left = `${x}px`
      handle.style.top = `${y}px`
    })
  }

  drawOverlay(context: CanvasRenderingContext2D): void {
    const { width, height } = this.host.frameSize()
    const frame = rectangleCorners(0, 0, width, height).map(point => this.host.frameToViewport(point))
    drawSelection(context, frame, this.corners.map(point => this.host.frameToViewport(point)))
    if (this.lens) {
      this.host.paintLens(context, this.lens)
    }
  }

  deactivate(): void {
    for (const handle of this.handles) {
      handle.remove()
    }
  }

  private move(index: number, point: Point): void {
    this.corners = this.constrain(this.corners, index, point, this.host.frameSize())
    this.update()
    this.host.requestPaint()
  }

  private announce(index: number): void {
    const { x, y } = this.corners[index]!
    const labels = this.host.labels()
    this.host.announce(labels.cornerMoved(labels[CORNER_LABELS[index]!], Math.round(x), Math.round(y)))
  }

  private createHandle(label: typeof CORNER_LABELS[number], index: number): HTMLButtonElement {
    const handle = document.createElement('button')
    handle.type = 'button'
    handle.className = 'paperpic-handle'
    handle.setAttribute('aria-label', this.host.labels()[label])

    let grab: ViewPoint | null = null

    const localPoint = (event: PointerEvent): ViewPoint => {
      const { left, top } = this.host.layer.getBoundingClientRect()
      return { x: event.clientX - left, y: event.clientY - top }
    }

    handle.addEventListener('pointerdown', (event) => {
      // A handle keeps its own drag: the gestures on the viewer would pan the image
      event.stopPropagation()
      handle.setPointerCapture(event.pointerId)
      const { x, y } = this.host.frameToViewport(this.corners[index]!)
      const point = localPoint(event)
      grab = { x: point.x - x, y: point.y - y }
      if (event.pointerType !== 'mouse') {
        // The other handles would cover the lens
        this.setOthersHidden(handle, true)
        this.showLens(index, point)
      }
    })

    handle.addEventListener('pointermove', (event) => {
      if (!grab) {
        return
      }
      const point = localPoint(event)
      this.move(index, this.host.viewportToFrame({ x: point.x - grab.x, y: point.y - grab.y }))
      if (event.pointerType !== 'mouse') {
        this.showLens(index, point)
      }
    })

    const release = () => {
      if (grab) {
        grab = null
        this.lens = null
        this.setOthersHidden(handle, false)
        this.host.requestPaint()
        this.announce(index)
      }
    }
    handle.addEventListener('pointerup', release)
    handle.addEventListener('pointercancel', release)

    handle.addEventListener('focus', () => this.host.reveal(this.corners[index]!))

    handle.addEventListener('keydown', (event) => {
      const direction = REVEAL_DIRECTIONS[event.key]
      if (!direction) {
        return
      }
      // The arrow keys move the corner here, instead of panning the image
      event.preventDefault()
      event.stopPropagation()
      const distance = event.shiftKey ? SHIFT_STEP : 1
      const position = this.host.frameToViewport(this.corners[index]!)
      this.move(index, this.host.viewportToFrame({
        x: position.x + direction.x * distance,
        y: position.y + direction.y * distance,
      }))
      this.host.reveal(this.corners[index]!)
      this.announce(index)
    })

    return handle
  }

  private setOthersHidden(handle: HTMLButtonElement, hidden: boolean): void {
    for (const other of this.handles) {
      other.hidden = hidden && other !== handle
    }
  }

  private showLens(index: number, finger: ViewPoint): void {
    const { width, height } = this.host.layer.getBoundingClientRect()
    // The toolbar sits above the lens, so the lens stays out of its column
    const available = this.host.toolbarCorner()?.x ?? width
    this.lens = placeLens(this.corners[index]!, finger, { width: available, height })
    this.host.requestPaint()
  }
}
