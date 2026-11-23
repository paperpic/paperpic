import { describe, expect, it } from 'vitest'
import { painted } from '../../test/photos'
import { findEdges } from './edges'
import { shrink } from './planes'

const size = { width: 20, height: 16 }
const edgesOf = (color: Parameters<typeof painted>[1]) => findEdges(shrink(painted(size, color), 256))
const at = (x: number, y: number) => y * size.width + x

describe('findEdges', () => {
  it('points to where the image gets brighter', () => {
    const right = edgesOf(x => x < 10
      ? [40, 40, 40]
      : [200, 200, 200])
    expect(right.across[at(10, 8)]).toBeGreaterThan(1)
    expect(right.down[at(10, 8)]).toBeCloseTo(0)
    expect(right.strength[at(10, 8)]).toBeCloseTo(right.across[at(10, 8)]!)
    expect(right.strength[at(3, 8)]).toBe(0)

    const up = edgesOf((_, y) => y < 8
      ? [200, 200, 200]
      : [40, 40, 40])
    expect(up.down[at(10, 8)]).toBeLessThan(-1)
    expect(up.across[at(10, 8)]).toBeCloseTo(0)
  })

  it('sees an edge between two colors of the same brightness', () => {
    const { strength } = edgesOf(x => x < 10
      ? [200, 60, 60]
      : [60, 60, 200])
    expect(strength[at(10, 8)]).toBeGreaterThan(1)
  })

  it('measures the strength against the strongest edges of the image', () => {
    // The edge at 10 is four times stronger than the one at 5
    const { strength } = edgesOf(x => x < 5
      ? [40, 40, 40]
      : x < 10
        ? [80, 80, 80]
        : [240, 240, 240])
    expect(strength[at(10, 8)]! / strength[at(5, 8)]!).toBeCloseTo(4, 0)
    expect(strength[at(10, 8)]).toBeGreaterThan(1)
    expect(strength[at(5, 8)]).toBeLessThan(1)
  })

  it('takes no small change for a clear edge, even when the image has no stronger one', () => {
    const { strength } = edgesOf(x => x < 10
      ? [100, 100, 100]
      : [112, 112, 112])
    expect(Math.max(...strength)).toBeLessThan(0.5)
  })

  it('leaves the border without edges', () => {
    const { strength } = edgesOf((x, y) => (x + y) % 2 === 0
      ? [0, 0, 0]
      : [255, 255, 255])
    for (let x = 0; x < size.width; x++) {
      expect(strength[at(x, 0)]).toBe(0)
      expect(strength[at(x, size.height - 1)]).toBe(0)
    }
  })
})
