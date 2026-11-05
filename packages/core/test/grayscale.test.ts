import { describe, expect, it } from 'vitest'
import { toGrayscale } from '../src/processing/grayscale'

function onePixel(red: number, green: number, blue: number) {
  return {
    data: new Uint8ClampedArray([red, green, blue, 255]),
    width: 1,
    height: 1,
  }
}

describe('toGrayscale', () => {
  it.each([
    ['black', 0, 0, 0, 0],
    ['white', 255, 255, 255, 255],
    ['red', 255, 0, 0, 53],
    ['green', 0, 255, 0, 182],
    ['blue', 0, 0, 255, 18],
  ])('converts %s by its luminance', (_name, red, green, blue, expected) => {
    expect(toGrayscale(onePixel(red, green, blue))[0]).toBe(expected)
  })

  it('returns one value per pixel, in order', () => {
    const image = {
      data: new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]),
      width: 2,
      height: 1,
    }
    expect([
      ...toGrayscale(image),
    ]).toEqual([0, 255])
  })
})
