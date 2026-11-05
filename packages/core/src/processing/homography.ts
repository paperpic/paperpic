import type { Point, Quad } from './types'

/** A 3×3 matrix, row by row. */
export type Matrix3 = readonly [number, number, number, number, number, number, number, number, number]

const SIZE = 8
const SINGULAR_LIMIT = 1e-10

/**
 * Computes the projective transform that sends each corner of `from` to the same corner of `to`.
 *
 * @throws {RangeError} If the corners are degenerate, such as three of them in a line. Spread them out.
 */
export function solveHomography(from: Quad, to: Quad): Matrix3 {
  // Each point pair gives two rows of the system A·h = b, with the last matrix cell fixed to 1
  const system: number[][] = []
  for (let corner = 0; corner < 4; corner++) {
    const { x, y } = from[corner]!
    const { x: u, y: v } = to[corner]!
    system.push(
      [x, y, 1, 0, 0, 0, -x * u, -y * u, u],
      [0, 0, 0, x, y, 1, -x * v, -y * v, v],
    )
  }

  for (let column = 0; column < SIZE; column++) {
    let pivot = column
    for (let row = column + 1; row < SIZE; row++) {
      if (Math.abs(system[row]![column]!) > Math.abs(system[pivot]![column]!)) {
        pivot = row
      }
    }
    if (Math.abs(system[pivot]![column]!) < SINGULAR_LIMIT) {
      throw new RangeError('The corners do not form a valid quadrilateral. Spread them out so that no three are in a line.')
    }
    ;[system[column], system[pivot]] = [system[pivot]!, system[column]!]

    const lead = system[column]!
    for (let row = 0; row < SIZE; row++) {
      if (row === column) {
        continue
      }
      const target = system[row]!
      const factor = target[column]! / lead[column]!
      for (let cell = column; cell <= SIZE; cell++) {
        target[cell]! -= factor * lead[cell]!
      }
    }
  }

  const solved = system.map((row, index) => row[SIZE]! / row[index]!)
  return [
    solved[0]!,
    solved[1]!,
    solved[2]!,
    solved[3]!,
    solved[4]!,
    solved[5]!,
    solved[6]!,
    solved[7]!,
    1,
  ]
}

/** Applies a projective transform to a point. */
export function applyHomography(matrix: Matrix3, { x, y }: Point): Point {
  const [a, b, c, d, e, f, g, h, i] = matrix
  const w = g * x + h * y + i
  return { x: (a * x + b * y + c) / w, y: (d * x + e * y + f) / w }
}

/** A size in pixels. */
export interface Size {
  width: number
  height: number
}

export interface OutputSizeOptions {
  /** The real proportions of the document, as width divided by height. Without it, they are estimated. */
  aspectRatio?: number
}

type Vector = readonly [number, number, number]

/** A typical phone camera, as a fraction of the long image side. It only matters when the photo hides the real focal length. */
const TYPICAL_FOCAL = 0.7
/** A focal length outside this range, as a fraction of the long image side, comes from noise in the corners. */
const MIN_FOCAL = 0.4
const MAX_FOCAL = 2

/**
 * Estimates the output size of a straightened document, with the proportions of the real document and about the same number of pixels as the selected area.
 *
 * Uses the method of Zhang and He, which needs the size of the whole photo because it assumes the camera axis passes through its center.
 * The result is an estimate: curved paper or imprecise corners change it. Pass `aspectRatio` when the real proportions are known.
 *
 * @throws {RangeError} If `aspectRatio` is not a positive number. Pass width divided by height, such as `210 / 297` for A4.
 */
export function estimateOutputSize(quad: Quad, photo: Size, { aspectRatio }: OutputSizeOptions = {}): Size {
  if (aspectRatio !== undefined && !(aspectRatio > 0 && Number.isFinite(aspectRatio))) {
    throw new RangeError(`aspectRatio must be width divided by height, such as 210 / 297 for A4, got ${aspectRatio}`)
  }
  const ratio = aspectRatio === undefined
    ? estimateHeightOverWidth(quad, photo)
    : 1 / aspectRatio
  const width = Math.sqrt(quadArea(quad) / ratio)
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(width * ratio)),
  }
}

function estimateHeightOverWidth([topLeft, topRight, bottomRight, bottomLeft]: Quad, photo: Size): number {
  const longSide = Math.max(photo.width, photo.height)
  const fromCenter = ({ x, y }: Point): Vector => [x - photo.width / 2, y - photo.height / 2, 1]
  const tl = fromCenter(topLeft)
  const tr = fromCenter(topRight)
  const br = fromCenter(bottomRight)
  const bl = fromCenter(bottomLeft)

  const k2 = dot(cross(tl, br), bl) / dot(cross(tr, br), bl)
  const k3 = dot(cross(tl, br), tr) / dot(cross(bl, br), tr)
  const horizontal = subtract(scale(tr, k2), tl)
  const vertical = subtract(scale(bl, k3), tl)

  // The photo reveals the focal length only if it is tilted around both axes. Otherwise, the value is undefined or wild.
  const estimated = Math.sqrt(-(horizontal[0] * vertical[0] + horizontal[1] * vertical[1]) / (horizontal[2] * vertical[2]))
  const focal = estimated >= MIN_FOCAL * longSide && estimated <= MAX_FOCAL * longSide
    ? estimated
    : TYPICAL_FOCAL * longSide

  const length = ([x, y, z]: Vector) => Math.sqrt((x * x + y * y) / (focal * focal) + z * z)
  const ratio = length(vertical) / length(horizontal)
  return Number.isFinite(ratio) && ratio > 0
    ? ratio
    : sidesRatio([
        topLeft,
        topRight,
        bottomRight,
        bottomLeft,
      ])
}

function sidesRatio([topLeft, topRight, bottomRight, bottomLeft]: Quad): number {
  const width = Math.max(distance(topLeft, topRight), distance(bottomLeft, bottomRight), 1)
  const height = Math.max(distance(topLeft, bottomLeft), distance(topRight, bottomRight), 1)
  return height / width
}

function quadArea(quad: Quad): number {
  let doubled = 0
  for (let corner = 0; corner < 4; corner++) {
    const current = quad[corner]!
    const next = quad[(corner + 1) % 4]!
    doubled += current.x * next.y - next.x * current.y
  }
  return Math.max(Math.abs(doubled) / 2, 1)
}

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y)
}

function cross(a: Vector, b: Vector): Vector {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function dot(a: Vector, b: Vector): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function scale([x, y, z]: Vector, factor: number): Vector {
  return [x * factor, y * factor, z * factor]
}

function subtract(a: Vector, b: Vector): Vector {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
