import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_OVERLAY_COLORS, overlayColors } from './colors'

describe('overlayColors', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  // happy-dom does not inherit custom properties, so the test sets them on the canvas. A browser finds them on any ancestor
  it('reads the tokens of the canvas', () => {
    const canvas = document.createElement('canvas')
    canvas.style.setProperty('--paperpic-color-line', '#000')
    canvas.style.setProperty('--paperpic-color-line-shadow', 'rgb(255 255 255 / 60%)')
    document.body.append(canvas)

    expect(overlayColors({ canvas } as unknown as CanvasRenderingContext2D)).toEqual({
      dim: DEFAULT_OVERLAY_COLORS.dim,
      line: '#000',
      lineShadow: 'rgb(255 255 255 / 60%)',
    })
  })

  it('falls back to the defaults outside the page, or without a canvas', () => {
    expect(overlayColors({
      canvas: document.createElement('canvas'),
    } as unknown as CanvasRenderingContext2D)).toEqual(DEFAULT_OVERLAY_COLORS)
    expect(overlayColors({} as CanvasRenderingContext2D)).toEqual(DEFAULT_OVERLAY_COLORS)
  })
})
