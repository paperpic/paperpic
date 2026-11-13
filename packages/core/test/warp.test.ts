import type { PixelBuffer, Quad } from '../src/processing/types'
import { describe, expect, it } from 'vitest'
import { warpPerspective } from '../src/processing/warp'

/** Stores x in the red channel and y in the green channel, so each pixel tells where it came from. */
function coordinateImage(width: number, height: number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4
      data[offset] = x
      data[offset + 1] = y
      data[offset + 3] = 255
    }
  }
  return { data, width, height }
}

function pixel({ data, width }: PixelBuffer, x: number, y: number) {
  const offset = (y * width + x) * 4
  return [
    data[offset],
    data[offset + 1],
    data[offset + 2],
    data[offset + 3],
  ]
}

describe('warpPerspective', () => {
  it('copies the image when the corners are the image corners', () => {
    const source = coordinateImage(20, 10)
    const quad: Quad = [
      { x: 0, y: 0 },
      { x: 19, y: 0 },
      { x: 19, y: 9 },
      { x: 0, y: 9 },
    ]
    const result = warpPerspective(source, quad, 20, 10)
    expect(result.data).toEqual(source.data)
  })

  it('crops an axis-aligned rectangle', () => {
    const source = coordinateImage(40, 40)
    const quad: Quad = [
      { x: 10, y: 20 },
      { x: 19, y: 20 },
      { x: 19, y: 29 },
      { x: 10, y: 29 },
    ]
    const result = warpPerspective(source, quad, 10, 10)
    expect(pixel(result, 0, 0)).toEqual([10, 20, 0, 255])
    expect(pixel(result, 9, 9)).toEqual([19, 29, 0, 255])
  })

  it('places each output corner on its source corner', () => {
    const source = coordinateImage(100, 100)
    const quad: Quad = [
      { x: 20, y: 10 },
      { x: 70, y: 15 },
      { x: 90, y: 80 },
      { x: 5, y: 95 },
    ]
    const result = warpPerspective(source, quad, 30, 40)
    expect(pixel(result, 0, 0).slice(0, 2)).toEqual([20, 10])
    expect(pixel(result, 29, 0).slice(0, 2)).toEqual([70, 15])
    expect(pixel(result, 29, 39).slice(0, 2)).toEqual([90, 80])
    expect(pixel(result, 0, 39).slice(0, 2)).toEqual([5, 95])
  })

  it('throws RangeError for an empty output', () => {
    const source = coordinateImage(4, 4)
    const quad: Quad = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 3 },
      { x: 0, y: 3 },
    ]
    expect(() => warpPerspective(source, quad, 0, 4)).toThrow(RangeError)
  })
})
