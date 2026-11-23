import { describe, expect, it } from 'vitest'
import { placeMagnifier } from './magnifier'

describe('placeMagnifier', () => {
  const viewport = { width: 400, height: 600 }

  it('goes above the finger', () => {
    const magnifier = placeMagnifier({ x: 1, y: 2 }, { x: 200, y: 300 }, viewport)
    expect(magnifier.center.x).toBe(200)
    expect(magnifier.center.y).toBeLessThan(300 - magnifier.radius)
    expect(magnifier.point).toEqual({ x: 1, y: 2 })
  })

  it('goes below the finger at the top of the viewport', () => {
    const magnifier = placeMagnifier({ x: 1, y: 2 }, { x: 200, y: 30 }, viewport)
    expect(magnifier.center.y).toBeGreaterThan(30 + magnifier.radius)
  })

  it('stays on screen at the sides', () => {
    const magnifier = placeMagnifier({ x: 1, y: 2 }, { x: 395, y: 300 }, viewport)
    expect(magnifier.center.x + magnifier.radius).toBeLessThanOrEqual(400)
    expect(placeMagnifier({ x: 1, y: 2 }, { x: 5, y: 300 }, viewport).center.x).toBe(magnifier.radius)
  })

  describe('in a viewport with no room above or below the finger', () => {
    const short = { width: 380, height: 138 }

    it.each([
      { x: 5, y: 5 },
      { x: 60, y: 70 },
      { x: 190, y: 133 },
      { x: 191, y: 70 },
      { x: 375, y: 133 },
    ])('stays whole on screen, without covering the finger, at %o', (finger) => {
      const { center, radius } = placeMagnifier({ x: 1, y: 2 }, finger, short)
      expect(center.x - radius).toBeGreaterThanOrEqual(0)
      expect(center.x + radius).toBeLessThanOrEqual(short.width)
      expect(center.y - radius).toBeGreaterThanOrEqual(0)
      expect(center.y + radius).toBeLessThanOrEqual(short.height)
      expect(Math.hypot(center.x - finger.x, center.y - finger.y)).toBeGreaterThan(radius)
    })

    it('goes to the side with more room', () => {
      expect(placeMagnifier({ x: 1, y: 2 }, { x: 60, y: 70 }, short).center.x).toBeGreaterThan(60)
      expect(placeMagnifier({ x: 1, y: 2 }, { x: 320, y: 70 }, short).center.x).toBeLessThan(320)
    })
  })

  it('goes below the finger as long as it fits there', () => {
    const finger = { x: 200, y: 100 }
    expect(placeMagnifier({ x: 1, y: 2 }, finger, { width: 400, height: 260 }).center).toEqual({ x: 200, y: 204 })
    expect(placeMagnifier({ x: 1, y: 2 }, finger, { width: 400, height: 259 }).center.y).toBeLessThan(100)
  })
})
