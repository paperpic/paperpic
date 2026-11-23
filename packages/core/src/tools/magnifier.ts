import type { Point, Size } from '../processing/types'
import type { Magnifier } from '../render/magnifier'
import type { ViewPoint } from '../state/view'

const MAGNIFIER_RADIUS = 56
/** Keeps the magnifier clear of a finger, which covers more than the point it touches. */
const FINGER_GAP = 48

/**
 * Places the magnifier above the finger, or below it at the top of the viewport. Where neither has room, as in a short
 * viewer, it goes to the side with more of it, at the top, because the hand comes from below. It is always on screen, as
 * long as the viewport is larger than it.
 */
export function placeMagnifier(point: Point, finger: ViewPoint, viewport: Size): Magnifier {
  const distance = MAGNIFIER_RADIUS + FINGER_GAP
  const above = finger.y - distance
  const below = finger.y + distance
  let { x } = finger
  let y = MAGNIFIER_RADIUS
  if (above >= MAGNIFIER_RADIUS) {
    y = above
  }
  else if (below <= viewport.height - MAGNIFIER_RADIUS) {
    y = below
  }
  else {
    x += x > viewport.width / 2
      ? -distance
      : distance
  }
  const limit = Math.max(MAGNIFIER_RADIUS, viewport.width - MAGNIFIER_RADIUS)
  return {
    point,
    center: {
      x: Math.min(limit, Math.max(MAGNIFIER_RADIUS, x)),
      y,
    },
    radius: MAGNIFIER_RADIUS,
  }
}
