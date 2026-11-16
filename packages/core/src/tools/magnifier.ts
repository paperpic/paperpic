import type { Point, Size } from '../processing/types'
import type { Lens } from '../render/lens'
import type { ViewPoint } from '../state/view'

const LENS_RADIUS = 56
/** Keeps the lens clear of a finger, which covers more than the point it touches. */
const FINGER_GAP = 48

/** Places the lens above the finger, or below it at the top of the viewport, always on screen. */
export function placeLens(point: Point, finger: ViewPoint, viewport: Size): Lens {
  const distance = LENS_RADIUS + FINGER_GAP
  const above = finger.y - distance
  const y = above >= LENS_RADIUS
    ? above
    : finger.y + distance
  const limit = Math.max(LENS_RADIUS, viewport.width - LENS_RADIUS)
  return {
    point,
    center: {
      x: Math.min(limit, Math.max(LENS_RADIUS, finger.x)),
      y,
    },
    radius: LENS_RADIUS,
  }
}
