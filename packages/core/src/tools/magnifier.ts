import type { Point, Size } from '../processing/types'
import type { Magnifier } from '../render/magnifier'
import type { ViewPoint } from '../state/view'

const MAGNIFIER_RADIUS = 56
/** Keeps the magnifier clear of a finger, which covers more than the point it touches. */
const FINGER_GAP = 48

/** Places the magnifier above the finger, or below it at the top of the viewport, always on screen. */
export function placeMagnifier(point: Point, finger: ViewPoint, viewport: Size): Magnifier {
  const distance = MAGNIFIER_RADIUS + FINGER_GAP
  const above = finger.y - distance
  const y = above >= MAGNIFIER_RADIUS
    ? above
    : finger.y + distance
  const limit = Math.max(MAGNIFIER_RADIUS, viewport.width - MAGNIFIER_RADIUS)
  return {
    point,
    center: {
      x: Math.min(limit, Math.max(MAGNIFIER_RADIUS, finger.x)),
      y,
    },
    radius: MAGNIFIER_RADIUS,
  }
}
