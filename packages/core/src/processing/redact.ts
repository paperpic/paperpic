import type { PixelBuffer, Point } from './types'

/**
 * The color that covers an area in Redact.
 *
 * @see https://paperpic.dev/reference/types#redactcolor
 */
export type RedactColor = 'black' | 'white'

/** An area to cover: a convex shape, with its corners as fractions of the image, in order around it. */
export interface RedactArea {
  color: RedactColor
  points: readonly Point[]
}

/** Each color as one 32-bit pixel, opaque, built from its bytes so it does not depend on the byte order of the device. */
const FILL: Record<RedactColor, number> = {
  black: new Uint32Array(new Uint8Array([0, 0, 0, 255]).buffer)[0]!,
  white: new Uint32Array(new Uint8Array([255, 255, 255, 255]).buffer)[0]!,
}

/** How far a coordinate can stray from a pixel edge and still count as on it, so a rounding error covers no extra row. */
const EPSILON = 1e-6

function cross(origin: Point, a: Point, b: Point): number {
  return (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x)
}

/** Twice the area of a shape, positive when its corners go clockwise on screen, where y grows downwards. */
function signedArea(points: readonly Point[]): number {
  let total = 0
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length]!
    total += point.x * next.y - next.x * point.y
  })
  return total
}

/**
 * Keeps the part of a convex shape that lies inside another convex shape. Their corners can go either way around.
 * Returns fewer than 3 points when nothing is left.
 */
export function clipPolygon(subject: readonly Point[], clip: readonly Point[]): Point[] {
  const orientation = Math.sign(signedArea(clip))
  if (orientation === 0) {
    return []
  }
  let output = [...subject]
  for (let index = 0; index < clip.length && output.length > 0; index++) {
    const start = clip[index]!
    const end = clip[(index + 1) % clip.length]!
    const inside = (point: Point) => cross(start, end, point) * orientation >= 0
    const input = output
    output = []
    input.forEach((current, position) => {
      const previous = input[(position + input.length - 1) % input.length]!
      if (inside(current) !== inside(previous)) {
        // Where the side from the previous point to this one crosses the line of the clip
        const along = cross(start, end, previous) / (cross(start, end, previous) - cross(start, end, current))
        output.push({
          x: previous.x + along * (current.x - previous.x),
          y: previous.y + along * (current.y - previous.y),
        })
      }
      if (inside(current)) {
        output.push(current)
      }
    })
  }
  return Math.abs(signedArea(output)) > EPSILON * EPSILON
    ? output
    : []
}

/**
 * The left and right ends of a convex shape within a band of rows. Each side of the shape is cut to the band, and its
 * ends are the farthest points the shape reaches there.
 */
function spanInBand(points: readonly Point[], top: number, bottom: number): [number, number] | null {
  let left = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  points.forEach((start, index) => {
    const end = points[(index + 1) % points.length]!
    const low = Math.max(top, Math.min(start.y, end.y))
    const high = Math.min(bottom, Math.max(start.y, end.y))
    if (low > high) {
      return
    }
    const xAt = (y: number) => start.y === end.y
      ? [start.x, end.x]
      : [start.x + (end.x - start.x) * (y - start.y) / (end.y - start.y)]
    for (const x of [
      ...xAt(low),
      ...xAt(high),
    ]) {
      left = Math.min(left, x)
      right = Math.max(right, x)
    }
  })
  return left <= right
    ? [left, right]
    : null
}

/**
 * Fills every pixel that a convex shape touches, even in part, so no trace of what it covers is left at its edges.
 * The corners are in pixels, and `pixels` holds one 32-bit value per pixel.
 */
function fillPolygon(pixels: Uint32Array, width: number, height: number, points: readonly Point[], value: number): void {
  const ys = points.map(({ y }) => y)
  const firstRow = Math.max(0, Math.floor(Math.min(...ys) + EPSILON))
  const endRow = Math.min(height, Math.ceil(Math.max(...ys) - EPSILON))
  for (let row = firstRow; row < endRow; row++) {
    const span = spanInBand(points, row, row + 1)
    if (!span) {
      continue
    }
    const first = Math.max(0, Math.floor(span[0] + EPSILON))
    const end = Math.min(width, Math.ceil(span[1] - EPSILON))
    pixels.fill(value, row * width + first, row * width + end)
  }
}

/**
 * Covers areas of an image with solid black or white, opaque even where the image was transparent. It changes the
 * image it receives, which the pipeline owns, because a copy would double the memory of a large photo.
 */
export function redactPixels(image: PixelBuffer, areas: readonly RedactArea[]): PixelBuffer {
  const { data, width, height } = image
  const pixels = new Uint32Array(data.buffer, data.byteOffset, width * height)
  for (const { color, points } of areas) {
    if (points.length >= 3) {
      fillPolygon(pixels, width, height, points.map(({ x, y }) => ({ x: x * width, y: y * height })), FILL[color])
    }
  }
  return image
}
