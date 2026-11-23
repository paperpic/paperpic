import type { Point, Quad } from '../types'
import type { Edges } from './edges'
import { fitSide, inwardFrom } from './fit'

/** How much the sides of a shape go on past its corners, from 0 to 1. */
export interface PastCorners {
  /** The most that one side goes on past a corner. */
  pastCorner: number
  /**
   * The most that both neighbours of a side go on past it. A part of a page has one such side, such as the fold where
   * it ends, because the edges of the page go on past it.
   */
  pastSide: number
}

/** Where a side is looked at past its corner, in pixels from it. */
const START = 4
const END = 14
/** The pixels that the side can go on at, next to its line, and how much each one counts. */
const SHIFTS = [
  [0, 1],
  [1, 0.9],
  [-1, 0.9],
  [2, 0.7],
  [-2, 0.7],
] as const
/** The cosine of the widest angle between an edge and the side that goes on along it. */
const ALIGNED = 0.8

/**
 * Measures the edges past a corner, along the unit vector `away`. Only the ones that get brighter the same way as the
 * side count: inwards with a `sign` of 1, and outwards with -1.
 */
function measurePast(corner: Point, away: Point, inward: Point, sign: number, { across, down, strength, width, height }: Edges): number {
  let total = 0
  for (let distance = START; distance <= END; distance++) {
    let best = 0
    for (const [shift, weight] of SHIFTS) {
      const x = Math.round(corner.x + away.x * distance + inward.x * shift)
      const y = Math.round(corner.y + away.y * distance + inward.y * shift)
      if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) {
        continue
      }
      const pixel = y * width + x
      const change = sign * (across[pixel]! * inward.x + down[pixel]! * inward.y)
      if (change >= ALIGNED * strength[pixel]!) {
        best = Math.max(best, Math.min(1, change) * weight)
      }
    }
    total += best
  }
  return total / (END - START + 1)
}

/** Measures how much the sides of a shape go on past its corners, which go clockwise on screen. */
export function measurePastCorners(quad: Quad, edges: Edges): PastCorners {
  const sides = quad.map((start, index) => {
    const end = quad[(index + 1) % 4]!
    const { length, signed } = fitSide(start, end, edges)
    const along = { x: (end.x - start.x) / length, y: (end.y - start.y) / length }
    const back = { x: -along.x, y: -along.y }
    const inward = inwardFrom(start, end)
    const sign = signed < 0
      ? -1
      : 1
    return {
      beforeStart: measurePast(start, back, inward, sign, edges),
      pastEnd: measurePast(end, along, inward, sign, edges),
    }
  })
  return {
    pastCorner: Math.max(...sides.flatMap(({ beforeStart, pastEnd }) => [beforeStart, pastEnd])),
    // The side before ends where this one starts, and the side after starts where this one ends
    pastSide: Math.max(...sides.map((_, index) => Math.min(sides[(index + 3) % 4]!.pastEnd, sides[(index + 1) % 4]!.beforeStart))),
  }
}
