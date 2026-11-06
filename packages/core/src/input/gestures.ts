import type { ViewPoint } from '../state/view'

/** What the gestures on an element ask for. */
export interface GestureHandlers {
  onPan: (deltaX: number, deltaY: number) => void
  /** `factor` multiplies the current zoom, around `point`. */
  onZoom: (factor: number, point: ViewPoint) => void
  onDoubleTap: (point: ViewPoint) => void
  /** Whether the wheel zooms. If it does not, the page scrolls as usual. */
  wheelZoom: () => boolean
}

const DOUBLE_TAP_TIME = 300
const DOUBLE_TAP_DISTANCE = 30
const TAP_MOVEMENT = 10
/** Zoom per wheel unit. Trackpad pinches arrive as a wheel with Ctrl, in much smaller steps. */
const WHEEL_SPEED = 0.002
const PINCH_WHEEL_SPEED = 0.01
const LINE_HEIGHT = 16

/**
 * Turns Pointer Events and the wheel into pan, zoom and double tap.
 *
 * @returns The function that removes every listener.
 */
export function attachGestures(element: HTMLElement, handlers: GestureHandlers): () => void {
  const pointers = new Map<number, ViewPoint>()
  let lastTap: { time: number, point: ViewPoint } | null = null
  let travelled = 0

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
    travelled = pointers.size === 1
      ? 0
      : TAP_MOVEMENT
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
      handlers.onPan(point.x - previous.x, point.y - previous.y)
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
    if (!pointers.delete(event.pointerId) || pointers.size > 0 || travelled >= TAP_MOVEMENT) {
      return
    }
    const point = localPoint(event)
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
    pointers.delete(event.pointerId)
    lastTap = null
  }

  const onWheel = (event: WheelEvent) => {
    if (!handlers.wheelZoom()) {
      return
    }
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
  element.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerup', onPointerUp)
    element.removeEventListener('pointercancel', onPointerCancel)
    element.removeEventListener('wheel', onWheel)
  }
}
