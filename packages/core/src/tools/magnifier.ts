import type { Point } from '../processing/types'
import type { Size, ViewPoint } from '../state/view'

/** What a magnifier shows and where. */
export interface Lens {
  /** Where the lens goes in the viewport. */
  center: ViewPoint
  /** The point of the frame to magnify. */
  point: Point
  radius: number
}

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
