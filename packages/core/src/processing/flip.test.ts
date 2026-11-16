import type { PixelBuffer } from './types'
import { describe, expect, it } from 'vitest'
import { flipPixels } from './flip'

/** An image of 8 by 4 pixels, each with its own green, so any move shows. */
function image(): PixelBuffer {
  return {
    data: new Uint8ClampedArray(Array.from({ length: 32 }, (_, pixel) => [200, pixel, 0, 255]).flat()),
    width: 8,
    height: 4,
  }
}

function greens({ data }: PixelBuffer): number[] {
  return [...data].filter((_, index) => index % 4 === 1)
}

describe('flipPixels', () => {
  it('mirrors each row and keeps the size', () => {
    const flipped = flipPixels(image())
    expect(flipped).toMatchObject({ width: 8, height: 4 })
    expect(greens(flipped).slice(0, 8)).toEqual([7, 6, 5, 4, 3, 2, 1, 0])
    expect(greens(flipped).slice(24)).toEqual([31, 30, 29, 28, 27, 26, 25, 24])
  })

  it('gives the image back when it runs twice', () => {
    expect(flipPixels(flipPixels(image())).data).toEqual(image().data)
  })
})
