import type { Line } from './lines'
import { describe, expect, it } from 'vitest'
import { painted, sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { findEdges } from './edges'
import { angleBetween, crossing, findLines, meanBetween, positionOn } from './lines'
import { shrink } from './planes'

const size = { width: 120, height: 90 }
const linesOf = (image: ReturnType<typeof painted>) => findLines(findEdges(shrink(image, 256)))
const found = (lines: readonly Line[]) => lines.filter(({ border }) => !border)

/** A line with nothing measured along it. */
function line(angle: number, distance: number): Line {
  return {
    angle,
    border: false,
    covered: new Float32Array(),
    distance,
    normal: {
      x: Math.cos(angle * Math.PI / 180),
      y: Math.sin(angle * Math.PI / 180),
    },
    signed: new Float32Array(),
  }
}

describe('angleBetween', () => {
  it('is the smallest turn between two directions, whatever side of 0 they are', () => {
    expect(angleBetween(line(10, 0), line(40, 0))).toBe(30)
    expect(angleBetween(line(2, 0), line(178, 0))).toBe(4)
    expect(angleBetween(line(0, 0), line(90, 0))).toBe(90)
  })
})

describe('crossing', () => {
  it('finds where two lines cross', () => {
    const point = crossing(line(0, 30), line(90, 20))!
    expect(point.x).toBeCloseTo(30)
    expect(point.y).toBeCloseTo(20)
  })

  it('gives nothing for lines that are close to parallel', () => {
    expect(crossing(line(10, 30), line(20, 50))).toBeNull()
  })
})

describe('meanBetween', () => {
  it('is the mean of a stretch, in either direction, and 0 for none', () => {
    // The positions from -2 to 3, with a value of 1 in the first one and 3 in the one at 2
    const totals = Float32Array.from([0, 1, 1, 1, 1, 4, 4])
    expect(meanBetween(totals, -2, 2)).toBe(0.25)
    expect(meanBetween(totals, 2, -2)).toBe(0.25)
    expect(meanBetween(totals, 2, 3)).toBe(3)
    expect(meanBetween(totals, 0, 0)).toBe(0)
  })

  it('leaves out what is past the ends', () => {
    expect(meanBetween(Float32Array.from([0, 1, 1, 1, 1, 4, 4]), -50, 50)).toBeCloseTo(4 / 6)
  })
})

describe('findLines', () => {
  const sheet = sheetPhoto(size, rectangleCorners(30, 20, 90, 70), { text: false })

  it('finds the sides of a sheet', () => {
    const sides = found(linesOf(sheet))
    const near = (angle: number, distance: number) => sides.some(side => angleBetween(side, line(angle, 0)) <= 1 && Math.abs(side.distance - distance) <= 2)
    expect(near(0, 30)).toBe(true)
    expect(near(0, 90)).toBe(true)
    expect(near(90, 20)).toBe(true)
    expect(near(90, 70)).toBe(true)
  })

  it('finds a tilted line at its angle', () => {
    const normal = {
      x: Math.cos(25 * Math.PI / 180),
      y: Math.sin(25 * Math.PI / 180),
    }
    const [strongest] = found(linesOf(painted(size, (x, y) => x * normal.x + y * normal.y < 60
      ? [40, 40, 40]
      : [220, 220, 220])))
    expect(Math.abs(strongest!.angle - 25)).toBeLessThanOrEqual(1)
    expect(Math.abs(strongest!.distance - 60)).toBeLessThanOrEqual(2)
  })

  it('measures the edges along a line, only where they are', () => {
    const top = found(linesOf(sheet)).find(side => angleBetween(side, line(90, 0)) <= 1 && Math.abs(side.distance - 20) <= 2)!
    const from = (x: number) => positionOn(top, { x, y: 20 })
    expect(meanBetween(top.covered, from(34), from(86))).toBeGreaterThan(0.9)
    // Going down, the table gives way to brighter paper
    expect(meanBetween(top.signed, from(34), from(86))).toBeGreaterThan(0.9)
    expect(meanBetween(top.covered, from(2), from(24))).toBeLessThan(0.1)
  })

  it('finds each edge once', () => {
    const sides = found(linesOf(sheet))
    const tops = sides.filter(side => angleBetween(side, line(90, 0)) <= 5 && Math.abs(side.distance - 20) <= 2)
    expect(tops).toHaveLength(1)
  })

  it('adds the borders, which look brighter inwards', () => {
    const borders = linesOf(painted(size, () => [90, 90, 90]))
    expect(borders.map(({ angle, distance, border }) => ({ angle, distance, border }))).toEqual([
      { angle: 0, distance: 0, border: true },
      { angle: 0, distance: 119, border: true },
      { angle: 90, distance: 0, border: true },
      { angle: 90, distance: 89, border: true },
    ])
    const signs = borders.map(({ signed }) => Math.sign(meanBetween(signed, 10, 60)))
    expect(signs).toEqual([1, -1, 1, -1])
  })
})
