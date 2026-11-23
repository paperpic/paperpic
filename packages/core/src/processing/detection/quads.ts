import type { Point, Quad, Size } from '../types'
import type { Line } from './lines'
import { angleBetween, crossing, meanBetween, positionOn } from './lines'

/** A shape that four lines form, with its corners clockwise on screen. */
interface Candidate {
  quad: Quad
  score: number
}

/** The widest angle between two facing sides, in degrees, because perspective does not tilt them more. */
const MAX_TILT = 40
/** The sine of the sharpest corner. */
const MIN_CORNER = 0.64
/** The shortest side, in pixels. */
const MIN_SIDE = 24
/** The smallest area, as a fraction of the image. */
const MIN_AREA = 0.04
/** How far out of the image a corner can be, as a fraction of its longer side. */
const MAX_OUTSIDE = 0.02
/** A photo that cuts off more sides shows too little of the document. */
export const MAX_BORDERS = 2
/** The least part of each side that lies on an edge. */
const MIN_COVERED = 0.3
/** How far from a corner a side is measured, because corners are often round or folded. */
const CORNER_GAP = 2
/** Where a side that goes on past its corner is measured, from the corner, as a fraction of the side or in pixels. */
const PAST_START = 4
const PAST_END = 8
const PAST_SHARE = 0.12
/** What the score is made of. A side that goes on past its corners belongs to something else, such as a table. */
const SIGNED_WEIGHT = 0.6
const COVERED_WEIGHT = 0.4
const ONE_WAY_WEIGHT = 0.4
const PAST_WEIGHT = 0.35
const AREA_WEIGHT = 0.15
const DARKER_PENALTY = 0.1
/** The shapes to look at, best first. The rest only repeat them. */
const MAX_LOOKED_AT = 4000
/** Two shapes are the same one if each corner of one has a corner of the other this close, in pixels. */
const SAME_CORNER = 9

/** The area of a shape, positive if its corners go clockwise on screen. */
export function signedArea(points: readonly Point[]): number {
  let doubled = 0
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]!
    doubled += point.x * next.y - next.x * point.y
  })
  return doubled / 2
}

/**
 * Starts at the top left corner, and keeps the order. It is the one whose side to the next corner, with the side that
 * faces it, points most to the right, so straightening the shape turns it as little as possible.
 */
export function fromTopLeft(quad: Quad): Quad {
  const toTheRight = quad.map((corner, index) => {
    const next = quad[(index + 1) % 4]!
    const opposite = quad[(index + 2) % 4]!
    const last = quad[(index + 3) % 4]!
    const x = next.x - corner.x + opposite.x - last.x
    const y = next.y - corner.y + opposite.y - last.y
    return x / Math.hypot(x, y)
  })
  const first = toTheRight.indexOf(Math.max(...toTheRight))
  return [0, 1, 2, 3].map(index => quad[(first + index) % 4]!) as unknown as Quad
}

/**
 * Rates the shape of four corners whose sides are on four lines, the first one between the first two corners. `null` if
 * it cannot be a document.
 */
function rate(corners: Quad, sides: readonly Line[], size: Size): number | null {
  const area = signedArea(corners)
  const turn = Math.sign(area)
  const share = Math.abs(area) / (size.width * size.height)
  if (share < MIN_AREA) {
    return null
  }
  const centerX = (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4
  const centerY = (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4

  let perimeter = 0
  let total = 0
  let worst = 1
  let brighter = 0
  let darker = 0
  let past = 0
  for (let index = 0; index < 4; index++) {
    const corner = corners[index]!
    const next = corners[(index + 1) % 4]!
    const last = corners[(index + 2) % 4]!
    const length = Math.hypot(next.x - corner.x, next.y - corner.y)
    const nextLength = Math.hypot(last.x - next.x, last.y - next.y)
    const sine = turn * ((next.x - corner.x) * (last.y - next.y) - (next.y - corner.y) * (last.x - next.x)) / (length * nextLength)
    if (!(sine >= MIN_CORNER) || length < MIN_SIDE) {
      return null
    }

    const line = sides[index]!
    const ends = [
      positionOn(line, corner),
      positionOn(line, next),
    ] as const
    const start = Math.min(...ends)
    const end = Math.max(...ends)
    const covered = meanBetween(line.covered, start + CORNER_GAP, end - CORNER_GAP)
    if (covered < MIN_COVERED) {
      return null
    }
    const inward = centerX * line.normal.x + centerY * line.normal.y > line.distance
      ? 1
      : -1
    const signed = inward * meanBetween(line.signed, start + CORNER_GAP, end - CORNER_GAP)
    if (signed > 0) {
      brighter += signed * length
    }
    else {
      darker -= signed * length
    }
    const reach = Math.max(PAST_END, length * PAST_SHARE)
    past += (meanBetween(line.covered, start - reach, start - PAST_START) + meanBetween(line.covered, end + PAST_START, end + reach)) / 2 * length
    const quality = Math.abs(signed) * SIGNED_WEIGHT + covered * COVERED_WEIGHT
    total += quality * length
    worst = Math.min(worst, quality)
    perimeter += length
  }

  // A document is brighter than what is around it, or darker, but seldom both
  const oneWay = Math.abs(brighter - darker) / (brighter + darker + 1e-6)
  return (total / perimeter + worst) / 2 * (1 - ONE_WAY_WEIGHT + ONE_WAY_WEIGHT * oneWay)
    - PAST_WEIGHT * past / perimeter
    + AREA_WEIGHT * Math.sqrt(share)
    - (darker > brighter
      ? DARKER_PENALTY
      : 0)
}

/** Where each pair of lines cross, or `null` if they are close to parallel or cross out of the image. */
function crossings(lines: readonly Line[], { width, height }: Size): (Point | null)[][] {
  const outside = Math.max(width, height) * MAX_OUTSIDE
  return lines.map(first => lines.map((second) => {
    const point = crossing(first, second)
    return point && point.x > -outside && point.y > -outside && point.x < width + outside && point.y < height + outside
      ? point
      : null
  }))
}

/** Every shape that two pairs of facing lines form and that could be a document. */
function formQuads(lines: readonly Line[], size: Size): Candidate[] {
  const corners = crossings(lines, size)
  const faces = (first: number, second: number) => angleBetween(lines[first]!, lines[second]!) <= MAX_TILT
  const candidates: Candidate[] = []

  for (let left = 0; left < lines.length; left++) {
    for (let right = left + 1; right < lines.length; right++) {
      if (!faces(left, right)) {
        continue
      }
      // The lines that cross both, which can be the other two sides
      const others: number[] = []
      for (let other = left + 1; other < lines.length; other++) {
        const first = corners[left]![other]
        const second = corners[right]![other]
        if (other !== right && first && second && Math.hypot(first.x - second.x, first.y - second.y) >= MIN_SIDE) {
          others.push(other)
        }
      }
      for (const [index, top] of others.entries()) {
        for (const bottom of others.slice(index + 1)) {
          const sides = [
            lines[top]!,
            lines[right]!,
            lines[bottom]!,
            lines[left]!,
          ]
          if (!faces(top, bottom) || sides.filter(({ border }) => border).length > MAX_BORDERS) {
            continue
          }
          const quad: Quad = [
            corners[left]![top]!,
            corners[right]![top]!,
            corners[right]![bottom]!,
            corners[left]![bottom]!,
          ]
          const score = rate(quad, sides, size)
          if (score !== null) {
            candidates.push({
              score,
              quad: signedArea(quad) > 0
                ? quad
                : [quad[3], quad[2], quad[1], quad[0]],
            })
          }
        }
      }
    }
  }
  return candidates
}

/** Whether two shapes have their corners in almost the same places. */
export function isSameQuad(first: Quad, second: Quad): boolean {
  return first.every(corner => second.some(other => Math.hypot(corner.x - other.x, corner.y - other.y) < SAME_CORNER))
}

/** The shapes that four lines of an image form, best first, without the ones that repeat another. */
export function findQuads(lines: readonly Line[], size: Size, limit: number): Quad[] {
  const candidates = formQuads(lines, size).sort((first, second) => second.score - first.score)
  const chosen: Quad[] = []
  for (const { quad } of candidates.slice(0, MAX_LOOKED_AT)) {
    if (chosen.length === limit) {
      break
    }
    if (!chosen.some(other => isSameQuad(other, quad))) {
      chosen.push(quad)
    }
  }
  return chosen.map(fromTopLeft)
}
