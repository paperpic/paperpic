import { describe, expect, it } from 'vitest'
import { adjustPixels } from '../../src/processing/adjust'

/** One pixel per value, with the same value in red, green and blue. */
function grays(...values: number[]) {
  return {
    data: new Uint8ClampedArray(values.flatMap(value => [value, value, value, 128])),
    width: values.length,
    height: 1,
  }
}

function reds(pixels: { data: Uint8ClampedArray }) {
  return [...pixels.data].filter((_, index) => index % 4 === 0)
}

describe('adjustPixels', () => {
  it('leaves the image as it is at 0', () => {
    const source = grays(0, 1, 64, 128, 200, 255)
    expect(adjustPixels(source).data).toEqual(source.data)
    expect(adjustPixels(source, { brightness: 0, contrast: 0 }).data).toEqual(source.data)
  })

  it('shifts every tone with the brightness, up to half the range', () => {
    expect(reds(adjustPixels(grays(0, 100, 200, 255), { brightness: 0.3 }))).toEqual([38, 138, 238, 255])
    expect(reds(adjustPixels(grays(0, 100, 255), { brightness: -0.5 }))).toEqual([0, 36, 191])
  })

  it('spreads the tones away from middle gray with the contrast', () => {
    expect(reds(adjustPixels(grays(0, 100, 128, 200, 255), { contrast: 0.25 }))).toEqual([0, 89, 128, 230, 255])
    expect(reds(adjustPixels(grays(0, 128, 255), { contrast: -1 }))).toEqual([96, 128, 159])
  })

  it('keeps the transparency and the size', () => {
    const result = adjustPixels(grays(10, 20), { brightness: 1, contrast: 1 })
    expect([...result.data].filter((_, index) => index % 4 === 3)).toEqual([128, 128])
    expect(result).toMatchObject({ width: 2, height: 1 })
  })

  it('explains a value out of range', () => {
    expect(() => adjustPixels(grays(0), { brightness: 1.5 })).toThrow('brightness must be between -1 and 1, got 1.5')
    expect(() => adjustPixels(grays(0), { contrast: Number.NaN })).toThrow('contrast must be between -1 and 1')
  })
})
