import type { Quad } from '../src/processing/types'
import { describe, expect, it } from 'vitest'
import { applyHomography, estimateOutputSize, solveHomography } from '../src/processing/homography'

const square: Quad = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
]

const skewed: Quad = [
  { x: 12, y: 30 },
  { x: 90, y: 22 },
  { x: 120, y: 140 },
  { x: 4, y: 128 },
]

describe('solveHomography', () => {
  it('returns the identity for equal corners', () => {
    const matrix = solveHomography(square, square)
    const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1]
    matrix.forEach((value, index) => expect(value).toBeCloseTo(identity[index]!, 10))
  })

  it('sends every corner to its target', () => {
    const matrix = solveHomography(square, skewed)
    square.forEach((corner, index) => {
      const mapped = applyHomography(matrix, corner)
      expect(mapped.x).toBeCloseTo(skewed[index]!.x, 8)
      expect(mapped.y).toBeCloseTo(skewed[index]!.y, 8)
    })
  })

  it('returns to the start through the inverse transform', () => {
    const forward = solveHomography(square, skewed)
    const backward = solveHomography(skewed, square)
    const point = { x: 37, y: 81 }
    const result = applyHomography(backward, applyHomography(forward, point))
    expect(result.x).toBeCloseTo(point.x, 8)
    expect(result.y).toBeCloseTo(point.y, 8)
  })

  it('throws RangeError when the corners are in a line', () => {
    const line: Quad = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ]
    expect(() => solveHomography(square, line)).toThrow(RangeError)
  })
})

describe('estimateOutputSize', () => {
  const photo = { width: 3000, height: 4000 }

  /** Photographs an 80 × 204 document with a known camera, tilted by these angles in radians. */
  function photographDocument(tiltX: number, tiltY: number, focal: number): Quad {
    const corners = [
      [-40, -102],
      [40, -102],
      [40, 102],
      [-40, 102],
    ] as const
    const [topLeft, topRight, bottomRight, bottomLeft] = corners.map(([x, y]) => {
      const tiltedY = y * Math.cos(tiltX)
      const depth = y * Math.sin(tiltX)
      const tiltedX = x * Math.cos(tiltY) + depth * Math.sin(tiltY)
      const z = -x * Math.sin(tiltY) + depth * Math.cos(tiltY) + 400
      return {
        x: focal * tiltedX / z + photo.width / 2,
        y: focal * tiltedY / z + photo.height / 2,
      }
    })
    return [
      topLeft!,
      topRight!,
      bottomRight!,
      bottomLeft!,
    ]
  }

  const ratio = ({ width, height }: { height: number, width: number }) => height / width

  it('returns the sides of a rectangle seen from the front, wherever it is in the photo', () => {
    const rectangle: Quad = [
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      { x: 300, y: 300 },
      { x: 100, y: 300 },
    ]
    expect(estimateOutputSize(rectangle, photo)).toEqual({ width: 200, height: 100 })
  })

  it.each([
    [0.6, 0.3],
    [0.2, 0.5],
    [0.9, 0.2],
  ])('recovers the real proportions with a tilt of %d and %d, whatever the camera', (tiltX, tiltY) => {
    expect(ratio(estimateOutputSize(photographDocument(tiltX, tiltY, 3000), photo))).toBeCloseTo(2.55, 2)
    expect(ratio(estimateOutputSize(photographDocument(tiltX, tiltY, 5000), photo))).toBeCloseTo(2.55, 2)
  })

  it('recovers the real proportions with a tilt around one axis and a typical camera', () => {
    const typical = 0.7 * photo.height
    expect(ratio(estimateOutputSize(photographDocument(0.6, 0, typical), photo))).toBeCloseTo(2.55, 2)
  })

  it('gets closer than the sides of the quadrilateral with a tilt around one axis and another camera', () => {
    const quad = photographDocument(0.6, 0, 4000)
    const [topLeft, topRight, , bottomLeft] = quad
    const sides = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y) / (topRight.x - topLeft.x)
    expect(Math.abs(ratio(estimateOutputSize(quad, photo)) - 2.55)).toBeLessThan(Math.abs(sides - 2.55))
  })

  it('keeps about the same number of pixels as the selected area', () => {
    const quad = photographDocument(0.6, 0.3, 3000)
    const { width, height } = estimateOutputSize(quad, photo)
    const [a, b, c, d] = quad
    const area = Math.abs(a.x * b.y - b.x * a.y + b.x * c.y - c.x * b.y + c.x * d.y - d.x * c.y + d.x * a.y - a.x * d.y) / 2
    expect(width * height / area).toBeCloseTo(1, 1)
  })

  it('uses the known proportions when given, keeping about the same number of pixels', () => {
    const quad = photographDocument(0.6, 0.3, 3000)
    const estimated = estimateOutputSize(quad, photo)
    const known = estimateOutputSize(quad, photo, { aspectRatio: 210 / 297 })
    expect(known.width / known.height).toBeCloseTo(210 / 297, 2)
    expect(known.width * known.height / (estimated.width * estimated.height)).toBeCloseTo(1, 1)
  })

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('throws RangeError for an aspect ratio of %d', (aspectRatio) => {
    expect(() => estimateOutputSize(photographDocument(0.6, 0.3, 3000), photo, { aspectRatio })).toThrow(RangeError)
  })

  it('returns a valid size for corners in a line', () => {
    const line: Quad = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ]
    const { width, height } = estimateOutputSize(line, photo)
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })
})
