import type { View } from '../src/state/view'
import { describe, expect, it } from 'vitest'
import { clampPan, createView, fitView, overflows, panBy, resizeView, rotateView, zoomLimits, zoomTo } from '../src/state/view'

const viewport = { width: 300, height: 150 }
const image = { width: 600, height: 250 }

function view(overrides: Partial<View> = {}): View {
  return {
    ...createView(),
    ...overrides,
  }
}

describe('fitView', () => {
  it('fits the whole image by its tighter side', () => {
    expect(fitView(view(), 'image', image, viewport)).toMatchObject({
      zoom: 0.5,
      panX: 0,
      panY: 0,
      fit: 'image',
    })
  })

  it('fits the width', () => {
    expect(fitView(view(), 'width', image, viewport).zoom).toBe(0.5)
  })

  it('fits the height and starts from the left', () => {
    const fitted = fitView(view(), 'height', image, viewport)
    expect(fitted.zoom).toBe(0.6)
    // Scaled to 360 wide in a 300 wide viewport: 30 pixels to each side
    expect(fitted.panX).toBeCloseTo(30)
  })

  it('starts a tall image from the top when fitting the width', () => {
    const tall = { width: 100, height: 1000 }
    const fitted = fitView(view(), 'width', tall, { width: 100, height: 200 })
    expect(fitted.zoom).toBe(1)
    expect(fitted.panY).toBe(400)
  })

  it('swaps the sides of a rotated image', () => {
    expect(fitView(view({ rotation: 90 }), 'image', image, viewport).zoom).toBeCloseTo(0.25)
  })
})

describe('zoomLimits', () => {
  it('stops at the fit of the whole image or at 100%, whichever is smaller', () => {
    expect(zoomLimits(image, viewport, 0)).toEqual({ min: 0.5, max: 8 })
    expect(zoomLimits({ width: 10, height: 10 }, viewport, 0).min).toBe(1)
  })

  it('lets a very small image reach its fit', () => {
    expect(zoomLimits({ width: 10, height: 10 }, viewport, 0).max).toBe(30)
  })
})

describe('zoomTo', () => {
  it('keeps the image point under the cursor in place', () => {
    const start = view({ zoom: 1 })
    const point = { x: 200, y: 100 }
    const zoomed = zoomTo(start, 2, point, image, viewport)
    // That point is 50 and 25 pixels from the center, and the image is large enough not to clamp
    expect(zoomed.panX).toBe(-50)
    expect(zoomed.panY).toBe(-25)
    expect(zoomed.fit).toBeNull()
  })

  it('clamps to the limits', () => {
    const center = { x: 150, y: 75 }
    expect(zoomTo(view({ zoom: 1 }), 100, center, image, viewport).zoom).toBe(8)
    expect(zoomTo(view({ zoom: 1 }), 0.01, center, image, viewport).zoom).toBe(0.5)
  })
})

describe('panBy and clampPan', () => {
  it('moves an image larger than the viewport', () => {
    expect(panBy(view({ zoom: 1 }), 10, -5, image, viewport)).toMatchObject({ panX: 10, panY: -5 })
  })

  it('stops at the edge of the image', () => {
    // 600 wide in a 300 wide viewport: 150 pixels to each side
    expect(panBy(view({ zoom: 1 }), 1000, 0, image, viewport).panX).toBe(150)
    expect(panBy(view({ zoom: 1 }), -1000, 0, image, viewport).panX).toBe(-150)
  })

  it('keeps an image that fits centered', () => {
    expect(clampPan(view({ zoom: 0.1, panX: 40, panY: 40 }), image, viewport)).toMatchObject({ panX: 0, panY: 0 })
  })
})

describe('the side margin', () => {
  const margin = 60

  it('lets an image that overflows go past its sides, so a toolbar over it hides nothing for good', () => {
    expect(panBy(view({ zoom: 1 }), -1000, 0, image, viewport, margin).panX).toBe(-210)
    expect(panBy(view({ zoom: 1 }), 1000, 0, image, viewport, margin).panX).toBe(210)
  })

  it('applies when only the other side overflows, such as a long document fitted to its width', () => {
    const tall = { width: 100, height: 1000 }
    const fitted = fitView(view(), 'width', tall, { width: 100, height: 200 })
    expect(panBy(fitted, -1000, 0, tall, { width: 100, height: 200 }, margin).panX).toBe(-60)
  })

  it('does not stretch the vertical limit', () => {
    expect(panBy(view({ zoom: 1 }), 0, -1000, image, viewport, margin).panY).toBe(-50)
  })

  it('leaves an image that fits centered', () => {
    const fitted = fitView(view(), 'image', image, viewport)
    expect(panBy(fitted, 100, 100, image, viewport, margin)).toMatchObject({ panX: 0, panY: 0 })
  })

  it('also holds while zooming', () => {
    const zoomed = zoomTo(view({ zoom: 1, panX: -210 }), 1, { x: 150, y: 75 }, image, viewport, margin)
    expect(zoomed.panX).toBe(-210)
  })

  it('is not used when a fit places the image', () => {
    const tall = { width: 100, height: 1000 }
    expect(fitView(view(), 'width', tall, { width: 100, height: 200 }).panX).toBe(0)
  })
})

describe('rotateView', () => {
  it('turns both ways and wraps around', () => {
    const fitted = fitView(view(), 'image', image, viewport)
    expect(rotateView(fitted, 1, image, viewport).rotation).toBe(90)
    expect(rotateView(fitted, -1, image, viewport).rotation).toBe(270)
    expect(rotateView(view({ rotation: 270 }), 1, image, viewport).rotation).toBe(0)
  })

  it('keeps the fit in effect', () => {
    const rotated = rotateView(fitView(view(), 'image', image, viewport), 1, image, viewport)
    expect(rotated.fit).toBe('image')
    expect(rotated.zoom).toBeCloseTo(0.25)
  })

  it('keeps a zoom chosen by hand', () => {
    const rotated = rotateView(view({ zoom: 2, fit: null }), 1, image, viewport)
    expect(rotated.zoom).toBe(2)
    expect(rotated.fit).toBeNull()
  })
})

describe('resizeView', () => {
  it('fits again when a fit is in effect', () => {
    const resized = resizeView(fitView(view(), 'image', image, viewport), image, { width: 600, height: 600 })
    expect(resized.zoom).toBe(1)
  })

  it('keeps a zoom chosen by hand, within the new limits', () => {
    const resized = resizeView(view({ zoom: 2, fit: null, panX: 400 }), image, { width: 600, height: 600 })
    expect(resized.zoom).toBe(2)
    expect(resized.panX).toBe(300)
  })
})

describe('overflows', () => {
  it('tells whether there is something to pan', () => {
    expect(overflows(fitView(view(), 'image', image, viewport), image, viewport)).toBe(false)
    expect(overflows(view({ zoom: 1 }), image, viewport)).toBe(true)
  })
})
