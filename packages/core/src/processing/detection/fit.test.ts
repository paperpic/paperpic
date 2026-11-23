import type { Quad } from '../types'
import { describe, expect, it } from 'vitest'
import { sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { findEdges } from './edges'
import { borderUnder, fitQuad, inwardFrom, settle } from './fit'
import { shrink } from './planes'

const size = { width: 160, height: 120 }
const sheet: Quad = [
  { x: 50, y: 25 },
  { x: 115, y: 30 },
  { x: 125, y: 100 },
  { x: 35, y: 95 },
]
const edgesOf = (corners: Quad, options = {}) => findEdges(shrink(sheetPhoto(size, corners, { text: false, ...options }), 256))
const moved = (corners: Quad, x: number, y: number) => corners.map(corner => ({ x: corner.x + x, y: corner.y + y })) as unknown as Quad

describe('inwardFrom', () => {
  it('points to the inside of a shape that goes clockwise', () => {
    expect(inwardFrom({ x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 0, y: 1 })
    expect(inwardFrom({ x: 10, y: 0 }, { x: 10, y: 10 })).toEqual({ x: -1, y: 0 })
  })
})

describe('borderUnder', () => {
  it.each([
    [
      'left',
      { x: 0, y: 10 },
      { x: 1, y: 90 },
      { x: 0 },
    ],
    [
      'top',
      { x: 10, y: 1 },
      { x: 90, y: 0 },
      { y: 0 },
    ],
    [
      'right',
      { x: 159, y: 10 },
      { x: 158, y: 90 },
      { x: 159 },
    ],
    [
      'bottom',
      { x: 10, y: 118 },
      { x: 90, y: 119 },
      { y: 119 },
    ],
  ])('tells a side on the %s border', (_, start, end, border) => {
    expect(borderUnder(start, end, size)).toEqual(border)
  })

  it('tells nothing of a side with only one end there', () => {
    expect(borderUnder({ x: 0, y: 10 }, { x: 20, y: 90 }, size)).toBeNull()
  })
})

describe('fitQuad', () => {
  it('is best on the outline, and worse away from it', () => {
    const edges = edgesOf(sheet)
    const { mean, signed, worst } = fitQuad(sheet, edges)
    expect(mean).toBeGreaterThan(0.85)
    expect(worst).toBeGreaterThan(0.8)
    // The sheet is brighter than the table
    expect(signed).toBeGreaterThan(0.85)
    expect(fitQuad(moved(sheet, 6, 6), edges).mean).toBeLessThan(0.3)
  })

  it('is negative in direction for a shape darker than what is around it', () => {
    expect(fitQuad(sheet, edgesOf(sheet, {
      paper: [30, 30, 30],
      table: [220, 220, 220],
    })).signed).toBeLessThan(-0.85)
  })

  it('gives a side on the border a fit of its own, because no edge can be there', () => {
    const cut = rectangleCorners(40, 30, 100, 200)
    const { mean, worst } = fitQuad(rectangleCorners(40, 30, 100, 119), edgesOf(cut))
    expect(worst).toBe(0.45)
    expect(mean).toBeGreaterThan(0.7)
  })

  it('looks at every side within the image only', () => {
    const outside = rectangleCorners(-20, -20, 200, 150)
    expect(fitQuad(outside, edgesOf(sheet)).mean).not.toBeNaN()
  })
})

describe('settle', () => {
  it.each([
    [5, 0],
    [-4, 3],
    [3, -6],
  ])('moves the corners back to the outline, from %d, %d away', (x, y) => {
    const settled = settle(moved(sheet, x, y), edgesOf(sheet))
    settled.forEach((corner, index) => {
      expect(Math.hypot(corner.x - sheet[index]!.x, corner.y - sheet[index]!.y)).toBeLessThan(2.5)
    })
  })

  it('keeps the corners inside the image', () => {
    for (const { x, y } of settle(rectangleCorners(-3, -2, 162, 121), edgesOf(sheet))) {
      expect(x >= 0 && x <= 159 && y >= 0 && y <= 119).toBe(true)
    }
  })

  it('leaves the corners where they are when no place is better', () => {
    const plain = edgesOf(sheet, {
      paper: [90, 90, 90],
      table: [90, 90, 90],
    })
    expect(settle(sheet, plain)).toEqual(sheet)
  })
})
