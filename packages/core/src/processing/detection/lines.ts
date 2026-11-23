import type { Point, Size } from '../types'
import type { Edges } from './edges'

/** A straight line over an image: the points at `distance` from its top left corner, measured along `normal`. */
export interface Line {
  /** The direction of the normal, in whole degrees from 0 to 179. */
  angle: number
  /** Whether it is a border of the photo. A document that the photo cuts off has it as a side. */
  border: boolean
  /** How much of the line lies on an edge, as a running total along it. */
  covered: Float32Array
  distance: number
  normal: Point
  /** The same, where an edge counts as positive if it gets brighter along the normal, and as negative if it gets darker. */
  signed: Float32Array
}

/** A line before anything is measured along it. */
type Candidate = Pick<Line, 'angle' | 'distance' | 'normal'> & { votes: number }

const ANGLES = 180
/** An edge votes for the lines whose direction is at most this far from its own, in degrees. */
const VOTE_SPREAD = 5
/** How fast the vote fades with that difference, in degrees until it would be none. */
const VOTE_FADE = 8
/** The edges weaker than this cannot vote. */
const MIN_VOTER = 0.4
/** The fewest votes of a line, as a fraction of the shorter side of the image. */
const MIN_VOTES = 0.06
const MAX_LINES = 36
/** How close two lines can be in the middle of the image, as a fraction of its longer side. */
const MIN_GAP = 1 / 45
/** The lines closer than this in direction are the same one if they are close, in degrees. */
const SAME_DIRECTION = 6
/** And up to this far in direction, if they are much closer. */
const SIMILAR_DIRECTION = 10
const SIMILAR_GAP_SHARE = 0.6
/** How far from a line its edge can be, in pixels, because a direction in whole degrees does not follow it exactly. */
const REACH = 2.5
/** The cosine of the widest angle between an edge and the line it belongs to. */
const ALIGNED = 0.86
/** How much of a border counts as an edge. It is never one, and a document that the photo cuts off still needs it as a side. */
const BORDER_COVERED = 0.45
/** The sine of the smallest angle at which two lines still have a corner. */
const MIN_CROSSING = 0.3

/** How far along a line any point of the image can be, from the middle of its running totals. */
function reachOf({ width, height }: Size): number {
  return Math.ceil(Math.hypot(width, height))
}

/** The difference between the directions of two lines, in degrees from 0 to 90. */
export function angleBetween(first: Pick<Line, 'angle'>, second: Pick<Line, 'angle'>): number {
  const difference = Math.abs(first.angle - second.angle)
  return Math.min(difference, ANGLES - difference)
}

/** Where two lines cross, or `null` if they are close to parallel. */
export function crossing(first: Line, second: Line): Point | null {
  const sine = first.normal.x * second.normal.y - first.normal.y * second.normal.x
  return Math.abs(sine) < MIN_CROSSING
    ? null
    : {
        x: (first.distance * second.normal.y - second.distance * first.normal.y) / sine,
        y: (first.normal.x * second.distance - second.normal.x * first.distance) / sine,
      }
}

/** How far along a line a point is. */
export function positionOn({ normal }: Line, { x, y }: Point): number {
  return y * normal.x - x * normal.y
}

/** The mean of a running total of a line, between two positions along it. */
export function meanBetween(totals: Float32Array, start: number, end: number): number {
  const last = totals.length - 1
  const middle = last / 2 - 1
  const from = Math.max(0, Math.min(last, Math.round(Math.min(start, end) + middle)))
  const to = Math.max(0, Math.min(last, Math.round(Math.max(start, end) + middle)))
  return to > from
    ? (totals[to]! - totals[from]!) / (to - from)
    : 0
}

/**
 * Finds the straight lines that most edges lie on, as Hough proposes: each edge votes for the lines through it, and the
 * lines with the most votes of their surroundings win.
 */
function vote({ across, down, strength, width, height }: Edges): Candidate[] {
  const reach = reachOf({ width, height })
  const distances = 2 * reach + 1
  const votes = new Float32Array(ANGLES * distances)
  const cosines = Float32Array.from({ length: ANGLES }, (_, angle) => Math.cos(angle * Math.PI / ANGLES))
  const sines = Float32Array.from({ length: ANGLES }, (_, angle) => Math.sin(angle * Math.PI / ANGLES))

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1, pixel = y * width + 1; x < width - 1; x++, pixel++) {
      const edge = strength[pixel]!
      if (edge < MIN_VOTER) {
        continue
      }
      const normalX = across[pixel]! / edge
      const normalY = down[pixel]! / edge
      // Only the middle of a thick edge votes
      const step = Math.round(normalY) * width + Math.round(normalX)
      if (edge < strength[pixel + step]! || edge < strength[pixel - step]!) {
        continue
      }
      const direction = Math.round(Math.atan2(normalY, normalX) * ANGLES / Math.PI)
      const weight = Math.min(1, edge)
      for (let turn = -VOTE_SPREAD; turn <= VOTE_SPREAD; turn++) {
        const angle = (direction + turn + 2 * ANGLES) % ANGLES
        const distance = Math.round(x * cosines[angle]! + y * sines[angle]!) + reach
        votes[angle * distances + distance]! += weight * (1 - Math.abs(turn) / VOTE_FADE)
      }
    }
  }

  const candidates: Candidate[] = []
  const minVotes = Math.min(width, height) * MIN_VOTES
  for (let angle = 0; angle < ANGLES; angle++) {
    for (let distance = 2; distance < distances - 2; distance++) {
      const cell = angle * distances + distance
      const count = votes[cell]!
      if (count >= minVotes && count >= votes[cell - 1]! && count >= votes[cell + 1]!) {
        candidates.push({
          angle,
          distance: distance - reach,
          normal: { x: cosines[angle]!, y: sines[angle]! },
          votes: count,
        })
      }
    }
  }
  return candidates.sort((first, second) => second.votes - first.votes)
}

/** Whether two lines follow the same edge: they point almost the same way, and pass close in the middle of the image. */
function isSameLine(first: Candidate, second: Candidate, { width, height }: Size): boolean {
  const difference = angleBetween(first, second)
  if (difference > SIMILAR_DIRECTION) {
    return false
  }
  const fromMiddle = ({ normal, distance }: Candidate) => distance - (normal.x * width / 2 + normal.y * height / 2)
  // Normals at both sides of 0 degrees point opposite ways, such as at 1 and at 179
  const facing = Math.abs(first.angle - second.angle) > ANGLES / 2
    ? -1
    : 1
  const gap = Math.abs(fromMiddle(first) - facing * fromMiddle(second))
  const minGap = Math.max(width, height) * MIN_GAP
  return gap < minGap * SIMILAR_GAP_SHARE || (gap < minGap && difference < SAME_DIRECTION)
}

/** Measures the edges along a line. */
function trace({ angle, distance, normal }: Candidate, { across, down, strength, width, height }: Edges): Line {
  const reach = reachOf({ width, height })
  const points = 2 * reach + 2
  const covered = new Float32Array(points + 1)
  const signed = new Float32Array(points + 1)

  for (let point = 0; point < points; point++) {
    const position = point - reach
    let best = 0
    let sign = 0
    for (let offset = -REACH; offset <= REACH; offset += 0.5) {
      const x = Math.round((distance + offset) * normal.x - position * normal.y)
      const y = Math.round((distance + offset) * normal.y + position * normal.x)
      if (x < 1 || y < 1 || x >= width - 1 || y >= height - 1) {
        continue
      }
      const pixel = y * width + x
      const change = across[pixel]! * normal.x + down[pixel]! * normal.y
      const size = Math.min(1, Math.abs(change))
      if (size > best && Math.abs(change) >= ALIGNED * strength[pixel]!) {
        best = size
        sign = change > 0
          ? 1
          : -1
      }
    }
    covered[point + 1] = covered[point]! + best
    signed[point + 1] = signed[point]! + sign * best
  }

  return {
    angle,
    border: false,
    covered,
    distance,
    normal,
    signed,
  }
}

/** The four borders of the image, as lines. */
function borderLines(size: Size): Line[] {
  const length = 2 * reachOf(size) + 3
  const border = (angle: number, distance: number, brighter: 1 | -1): Line => {
    const covered = Float32Array.from({ length }, (_, point) => point * BORDER_COVERED)
    return {
      angle,
      border: true,
      covered,
      distance,
      normal: angle === 0
        ? { x: 1, y: 0 }
        : { x: 0, y: 1 },
      // A document that goes on past the photo counts as brighter than what is there
      signed: covered.map(total => total * brighter),
    }
  }
  return [
    border(0, 0, 1),
    border(0, size.width - 1, -1),
    border(90, 0, 1),
    border(90, size.height - 1, -1),
  ]
}

/** The straight lines of an image that could be a side of a document, its borders included. */
export function findLines(edges: Edges): Line[] {
  const chosen: Candidate[] = []
  for (const candidate of vote(edges)) {
    if (chosen.length === MAX_LINES) {
      break
    }
    if (!chosen.some(line => isSameLine(candidate, line, edges))) {
      chosen.push(candidate)
    }
  }
  return [
    ...chosen.map(line => trace(line, edges)),
    ...borderLines(edges),
  ]
}
