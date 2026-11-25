import type { ViewPoint } from '../state/view'

/** A drag with one pointer that does something else than pan. */
export interface Drag {
  /** Leaves everything as it was, because a second pointer turned the drag into a pinch, or the browser took it over. */
  cancel: () => void
  /** The pointer was let go after a move. */
  end: () => void
  /** The pointer is at a point, once it has moved too far to be a tap. */
  move: (point: ViewPoint) => void
}

/** What the gestures on an element ask for. */
export interface GestureHandlers {
  onDoubleTap: (point: ViewPoint) => void
  /** Runs when one pointer goes down. Returns what a drag from there does, or `null` to pan. A tap is still a tap. */
  onDrag?: (point: ViewPoint) => Drag | null
  onPan: (deltaX: number, deltaY: number) => void
  /** Runs on every tap. Returns whether it used it, so that it does not count towards a double tap. */
  onTap: (point: ViewPoint) => boolean
  /** `factor` multiplies the current zoom, around `point`. */
  onZoom: (factor: number, point: ViewPoint) => void
}

/** The gestures attached to an element. */
export interface Gestures {
  /** Removes every listener. */
  detach: () => void
  /** Chooses whether the wheel zooms. If it does not, the page scrolls as usual. It starts off. */
  setWheelZoom: (enabled: boolean) => void
}

const DOUBLE_TAP_TIME = 300
const DOUBLE_TAP_DISTANCE = 30
/** How far a pointer can move, in CSS pixels, and still make a tap rather than a drag. */
export const TAP_MOVEMENT = 10
/** Zoom per wheel unit. Trackpad pinches arrive as a wheel with Ctrl, in much smaller steps. */
const WHEEL_SPEED = 0.002
const PINCH_WHEEL_SPEED = 0.01
const LINE_HEIGHT = 16

/**
 * Turns Pointer Events and the wheel into pan, zoom, tap and double tap.
 */
export function attachGestures(element: HTMLElement, handlers: GestureHandlers): Gestures {
  const pointers = new Map<number, ViewPoint>()
  let lastTap: { point: ViewPoint, time: number } | null = null
  let travelled = 0
  let drag: Drag | null = null

  const cancelDrag = () => {
    drag?.cancel()
    drag = null
  }

  const localPoint = (event: MouseEvent): ViewPoint => {
    const { left, top } = element.getBoundingClientRect()
    return { x: event.clientX - left, y: event.clientY - top }
  }

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }
    pointers.set(event.pointerId, localPoint(event))
    element.setPointerCapture(event.pointerId)
    cancelDrag()
    if (pointers.size === 1) {
      travelled = 0
      drag = handlers.onDrag?.(localPoint(event)) ?? null
    }
    else {
      travelled = TAP_MOVEMENT
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId)
    if (!previous) {
      return
    }
    const point = localPoint(event)

    if (pointers.size === 1) {
      pointers.set(event.pointerId, point)
      travelled += Math.hypot(point.x - previous.x, point.y - previous.y)
      if (!drag) {
        handlers.onPan(point.x - previous.x, point.y - previous.y)
      }
      else if (travelled >= TAP_MOVEMENT) {
        drag.move(point)
      }
      return
    }

    const other = [...pointers].find(([id]) => id !== event.pointerId)![1]
    const before = Math.hypot(previous.x - other.x, previous.y - other.y)
    const after = Math.hypot(point.x - other.x, point.y - other.y)
    pointers.set(event.pointerId, point)
    const center = { x: (point.x + other.x) / 2, y: (point.y + other.y) / 2 }
    if (before > 0 && after > 0) {
      handlers.onZoom(after / before, center)
    }
    handlers.onPan((point.x - previous.x) / 2, (point.y - previous.y) / 2)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) {
      return
    }
    const ended = drag
    drag = null
    if (pointers.size > 0) {
      return
    }
    if (travelled >= TAP_MOVEMENT) {
      ended?.end()
      return
    }
    const point = localPoint(event)
    if (handlers.onTap(point)) {
      lastTap = null
      return
    }
    const isDouble = lastTap
      && event.timeStamp - lastTap.time < DOUBLE_TAP_TIME
      && Math.hypot(point.x - lastTap.point.x, point.y - lastTap.point.y) < DOUBLE_TAP_DISTANCE
    if (isDouble) {
      lastTap = null
      handlers.onDoubleTap(point)
    }
    else {
      lastTap = { time: event.timeStamp, point }
    }
  }

  // The browser takes over a touch to scroll the page, so the tap never completes
  const onPointerCancel = (event: PointerEvent) => {
    if (pointers.delete(event.pointerId)) {
      cancelDrag()
    }
    lastTap = null
  }

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? LINE_HEIGHT
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? element.clientHeight
        : 1
    const speed = event.ctrlKey ? PINCH_WHEEL_SPEED : WHEEL_SPEED
    handlers.onZoom(Math.exp(-event.deltaY * unit * speed), localPoint(event))
  }

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerup', onPointerUp)
  element.addEventListener('pointercancel', onPointerCancel)

  let wheelZoom = false

  // A wheel listener that can stop the scroll makes the browser wait for it before it scrolls the page, so the
  // element has one only while the wheel zooms
  const setWheelZoom = (enabled: boolean) => {
    if (enabled === wheelZoom) {
      return
    }
    wheelZoom = enabled
    if (enabled) {
      element.addEventListener('wheel', onWheel, { passive: false })
    }
    else {
      element.removeEventListener('wheel', onWheel)
    }
  }

  return {
    setWheelZoom,
    detach: () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('pointercancel', onPointerCancel)
      setWheelZoom(false)
    },
  }
}
