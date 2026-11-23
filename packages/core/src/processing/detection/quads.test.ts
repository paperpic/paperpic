import type { Quad } from '../types'
import { describe, expect, it } from 'vitest'
import { sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { findEdges } from './edges'
import { findLines } from './lines'
import { shrink } from './planes'
import { findQuads, fromTopLeft, isSameQuad, signedArea } from './quads'

const size = { width: 160, height: 120 }
const square = rectangleCorners(40, 30, 100, 90)

function quadsOf(corners: Quad, limit = 10): Quad[] {
  return findQuads(findLines(findEdges(shrink(sheetPhoto(size, corners, { text: false }), 256))), size, limit)
}

describe('signedArea', () => {
  it('is positive when the corners go clockwise on screen', () => {
    expect(signedArea(square)).toBe(3600)
    expect(signedArea([...square].reverse())).toBe(-3600)
  })
})

describe('fromTopLeft', () => {
  it('starts at the top left corner, and keeps the order', () => {
    const [topLeft, topRight, bottomRight, bottomLeft] = square
    expect(fromTopLeft([
      bottomRight,
      bottomLeft,
      topLeft,
      topRight,
    ])).toEqual(square)
    expect(fromTopLeft(square)).toEqual(square)
    expect(fromTopLeft([
      topRight,
      bottomRight,
      bottomLeft,
      topLeft,
    ])).toEqual(square)
  })

  /** The angle of the top side with the bottom one, in degrees. */
  const turnOf = ([topLeft, topRight, bottomRight, bottomLeft]: Quad) => Math.atan2(
    topRight.y - topLeft.y + bottomRight.y - bottomLeft.y,
    topRight.x - topLeft.x + bottomRight.x - bottomLeft.x,
  ) * 180 / Math.PI

  it.each([-44, -20, 0, 20, 44])('keeps a rectangle turned %d degrees as it is', (degrees) => {
    const angle = degrees * Math.PI / 180
    const turned = square.map(({ x, y }) => ({
      x: (x - 70) * Math.cos(angle) - (y - 60) * Math.sin(angle),
      y: (x - 70) * Math.sin(angle) + (y - 60) * Math.cos(angle),
    })) as unknown as Quad
    expect(turnOf(fromTopLeft(turned))).toBeCloseTo(degrees)
  })

  it('turns a tilted shape the short way, where the corner nearest to the top left would turn it the long one', () => {
    const tilted: Quad = [
      { x: 228, y: 73 },
      { x: 330, y: 294 },
      { x: 55, y: 511 },
      { x: 10, y: 325 },
    ]
    const ordered = fromTopLeft(tilted)
    expect(ordered[0]).toEqual({ x: 10, y: 325 })
    expect(Math.abs(turnOf(ordered))).toBeLessThan(45)
  })
})

describe('isSameQuad', () => {
  it('compares the places of the corners, whatever corner they start at', () => {
    const near = square.map(({ x, y }) => ({ x: x + 3, y: y - 3 })) as unknown as Quad
    expect(isSameQuad(square, near)).toBe(true)
    expect(isSameQuad(square, [
      square[2],
      square[3],
      square[0],
      square[1],
    ])).toBe(true)
    expect(isSameQuad(square, rectangleCorners(40, 30, 100, 110))).toBe(false)
  })
})

describe('findQuads', () => {
  it.each([
    ['a rectangle', square],
    [
      'a sheet seen at an angle',
      [
        { x: 50, y: 25 },
        { x: 115, y: 30 },
        { x: 130, y: 100 },
        { x: 30, y: 95 },
      ] as const,
    ],
  ])('finds %s first, from its top left corner, clockwise', (_, corners) => {
    const [best] = quadsOf(corners)
    expect(isSameQuad(best!, corners)).toBe(true)
    expect(signedArea(best!)).toBeGreaterThan(0)
    best!.forEach(({ x, y }, index) => {
      expect(Math.hypot(x - corners[index]!.x, y - corners[index]!.y)).toBeLessThan(4)
    })
  })

  it('finds a sheet that the photo cuts off, with a side on the border', () => {
    const quads = quadsOf(rectangleCorners(40, 30, 100, 200))
    expect(quads.some(quad => isSameQuad(quad, rectangleCorners(40, 30, 100, 119)))).toBe(true)
  })

  it('gives no shape twice, and no more than the limit', () => {
    const quads = quadsOf(square)
    quads.forEach((quad, index) => {
      expect(quads.slice(index + 1).some(other => isSameQuad(quad, other))).toBe(false)
    })
    expect(quadsOf(square, 1)).toHaveLength(1)
  })

  it('finds nothing too small, too narrow or with a corner too sharp', () => {
    const borders = findLines(findEdges(shrink(sheetPhoto(size, rectangleCorners(70, 50, 90, 70), { text: false }), 256)))
    expect(findQuads(borders, size, 10).some(quad => isSameQuad(quad, rectangleCorners(70, 50, 90, 70)))).toBe(false)
    const sharp: Quad = [
      { x: 20, y: 20 },
      { x: 140, y: 20 },
      { x: 80, y: 100 },
      { x: 60, y: 100 },
    ]
    expect(quadsOf(sharp).some(quad => isSameQuad(quad, sharp))).toBe(false)
  })
})
