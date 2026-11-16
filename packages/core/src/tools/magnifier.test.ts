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
})
