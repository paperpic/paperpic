import type { LoadedImage } from '../src/pipeline/load-image'
import { describe, expect, it, vi } from 'vitest'
import { paintMagnifier } from '../src/render/magnifier'
import { computeTransform } from '../src/render/transform'
import { createView } from '../src/state/view'
import { placeMagnifier } from '../src/tools/magnifier'

function recordingContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    clip: vi.fn(),
    fill: vi.fn(),
    transform: vi.fn(),
    drawImage: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
  }
}

describe('paintMagnifier', () => {
  const image: LoadedImage = {
    element: {} as CanvasImageSource,
    width: 600,
    height: 250,
    release: () => {},
  }
  const view = {
    ...createView(),
    zoom: 0.5,
  }
  const viewport = { width: 300, height: 150 }

  it('puts the point under the finger at the center of the circle, three times larger than the view', () => {
    const context = recordingContext()
    const point = { x: 120, y: 80 }
    const center = { x: 200, y: 40 }
    paintMagnifier(context as unknown as CanvasRenderingContext2D, { point, center, radius: 30 }, { view, image, viewport })

    expect(context.arc).toHaveBeenCalledWith(200, 40, 30, 0, Math.PI * 2)
    expect(context.clip).toHaveBeenCalledOnce()
    expect(context.drawImage).toHaveBeenCalledWith(image.element, 0, 0, 600, 250)

    // The magnifier transform applies after the one of the view, which the context does not hold here
    const [a, b, c, d, e, f] = context.transform.mock.calls[0]!
    const [viewA] = computeTransform(view, image, viewport)
    expect(a).toBeCloseTo(viewA * 3)
    expect(a * point.x + c * point.y + e).toBeCloseTo(center.x)
    expect(b * point.x + d * point.y + f).toBeCloseTo(center.y)
  })

  it('draws a cross at the center, outside the clip', () => {
    const context = recordingContext()
    paintMagnifier(context as unknown as CanvasRenderingContext2D, {
      point: { x: 0, y: 0 },
      center: { x: 50, y: 50 },
      radius: 20,
    }, { view, image, viewport })
    expect(context.restore.mock.invocationCallOrder[0]).toBeLessThan(context.stroke.mock.invocationCallOrder[0]!)
    expect(context.moveTo).toHaveBeenCalledWith(42, 50)
    expect(context.lineTo).toHaveBeenCalledWith(58, 50)
  })
})

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
