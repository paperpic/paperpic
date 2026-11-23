import type { Point, Quad, Size } from '../types'
import type { Edges } from './edges'

/** How well a side of a shape lies on the edges of an image. */
export interface SideFit {
  /** How much of it lies on an edge, from 0 to 1. */
  covered: number
  length: number
  /** The same, where an edge counts as positive if it gets brighter inwards, and as negative if it gets darker. */
  signed: number
}

/** How well the four sides of a shape lie on the edges of an image, from 0 to 1. */
export interface QuadFit {
  mean: number
  /** How much of the outline gets brighter inwards, or darker with a negative value. */
  signed: number
  /** The fit of the worst side. */
  worst: number
}

/** The cosine of the widest angle between an edge and the side it belongs to. */
const ALIGNED = 0.8
/** The pixels that a side looks for an edge at: the one under it, and the ones next to it, which count less. */
const SHIFTS = [0, 1, -1] as const
const NEXT_TO_SIDE = 0.8
/** The pixels between two samples of a side. Looking at every pixel takes twice as long and finds the same documents. */
const SAMPLE_GAP = 2
const MIN_SAMPLES = 8
/** How close to the border of the photo both ends of a side are when the photo cuts the document off there, in pixels. */
const BORDER_GAP = 2
/** What a side on the border counts as, because no edge can be there. */
const BORDER_FIT = 0.45
/** The distances that a corner tries, in pixels, and how many times it tries each one. */
const STEPS = [4, 2, 1]
const ROUNDS = 4
const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
] as const
/** What the worst side and the direction of the edges add to a shape, when its corners look for a better place. */
const WORST_WEIGHT = 0.5
const SIGNED_WEIGHT = 0.3
/** The least that a move must gain. */
const MIN_GAIN = 1e-4

/** The unit vector from a side to the inside of its shape, whose corners go clockwise on screen. */
export function inwardFrom(start: Point, end: Point): Point {
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  return { x: (start.y - end.y) / length, y: (end.x - start.x) / length }
}

/** The border of the photo that a side lies on, as the coordinate that the side has there, or `null` if it lies on none. */
export function borderUnder(start: Point, end: Point, { width, height }: Size): Partial<Point> | null {
  if (Math.max(start.x, end.x) < BORDER_GAP) {
    return { x: 0 }
  }
  if (Math.max(start.y, end.y) < BORDER_GAP) {
    return { y: 0 }
  }
  if (Math.min(start.x, end.x) > width - 1 - BORDER_GAP) {
    return { x: width - 1 }
  }
  if (Math.min(start.y, end.y) > height - 1 - BORDER_GAP) {
    return { y: height - 1 }
  }
  return null
}

/** Measures the edges along a side. */
export function fitSide(start: Point, end: Point, edges: Edges): SideFit {
  const length = Math.hypot(end.x - start.x, end.y - start.y)
  if (borderUnder(start, end, edges)) {
    return { covered: BORDER_FIT, length, signed: BORDER_FIT }
  }

  const { across, down, strength, width, height } = edges
  const inward = inwardFrom(start, end)
  const samples = Math.max(MIN_SAMPLES, Math.round(length / SAMPLE_GAP))
  const stepX = (end.x - start.x) / samples
  const stepY = (end.y - start.y) / samples
  let covered = 0
  let signed = 0

  for (let sample = 1; sample < samples; sample++) {
    let best = 0
    let bestChange = 0
    // No pixel next to the side can beat a good one under it
    for (let index = 0; index < SHIFTS.length && best < NEXT_TO_SIDE; index++) {
      const shift = SHIFTS[index]!
      // The conversion to an integer rounds, and is faster than Math.round(). What is out of the image never counts
      const x = (start.x + stepX * sample + inward.x * shift + 0.5) | 0
      const y = (start.y + stepY * sample + inward.y * shift + 0.5) | 0
      if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) {
        continue
      }
      const pixel = y * width + x
      const change = across[pixel]! * inward.x + down[pixel]! * inward.y
      const size = Math.abs(change)
      const value = shift === 0
        ? Math.min(1, size)
        : Math.min(1, size) * NEXT_TO_SIDE
      if (value > best && size >= ALIGNED * strength[pixel]!) {
        best = value
        bestChange = change
      }
    }
    covered += best
    signed += Math.sign(bestChange) * best
  }

  return {
    covered: covered / (samples - 1),
    length,
    signed: signed / (samples - 1),
  }
}

function fitSides(quad: Quad, edges: Edges): SideFit[] {
  return quad.map((corner, index) => fitSide(corner, quad[(index + 1) % 4]!, edges))
}

function combine(sides: readonly SideFit[]): QuadFit {
  let total = 0
  let signed = 0
  let perimeter = 0
  let worst = 1
  for (const side of sides) {
    const quality = (side.covered + Math.abs(side.signed)) / 2
    total += quality * side.length
    signed += side.signed * side.length
    perimeter += side.length
    worst = Math.min(worst, quality)
  }
  return { mean: total / perimeter, signed: signed / perimeter, worst }
}

/** Measures how well the sides of a shape lie on the edges of an image. Its corners go clockwise on screen. */
export function fitQuad(quad: Quad, edges: Edges): QuadFit {
  return combine(fitSides(quad, edges))
}

function worth(sides: readonly SideFit[]): number {
  const { mean, signed, worst } = combine(sides)
  return mean + WORST_WEIGHT * worst + SIGNED_WEIGHT * Math.abs(signed)
}

/** Moves the corners of a shape, one at a time and less each time, to where its sides lie better on the edges. */
export function settle(quad: Quad, edges: Edges): Quad {
  const inside = (x: number, y: number): Point => ({
    x: Math.min(edges.width - 1, Math.max(0, x)),
    y: Math.min(edges.height - 1, Math.max(0, y)),
  })
  const corners = quad.map(({ x, y }) => inside(x, y))
  let sides = fitSides(corners as unknown as Quad, edges)
  let best = worth(sides)

  for (const step of STEPS) {
    let moved = true
    for (let round = 0; moved && round < ROUNDS; round++) {
      moved = false
      for (let index = 0; index < 4; index++) {
        const previous = (index + 3) % 4
        const next = (index + 1) % 4
        for (const [x, y] of DIRECTIONS) {
          const corner = inside(corners[index]!.x + x * step, corners[index]!.y + y * step)
          // Only the two sides that meet at the corner change
          const tried = sides.slice()
          tried[previous] = fitSide(corners[previous]!, corner, edges)
          tried[index] = fitSide(corner, corners[next]!, edges)
          const value = worth(tried)
          if (value > best + MIN_GAIN) {
            best = value
            corners[index] = corner
            sides = tried
            moved = true
          }
        }
      }
    }
  }
  return corners as unknown as Quad
}
