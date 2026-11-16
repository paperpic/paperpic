import { describe, expect, it } from 'vitest'
import { cropBox, cropPixels } from './crop'

/** A 4×3 image where each pixel holds its own index in every channel. */
function indexed() {
  const values = Array.from({ length: 12 }, (_, index) => index)
  return {
    data: new Uint8ClampedArray(values.flatMap(value => [value, value, value, 255])),
    width: 4,
    height: 3,
  }
}

function indexes({ data }: { data: Uint8ClampedArray }) {
  return [...data].filter((_, index) => index % 4 === 0)
}

describe('cropBox', () => {
  it('rounds to whole pixels', () => {
    expect(cropBox({
      x: 0.25,
      y: 0.5,
      width: 0.5,
      height: 0.25,
    }, 100, 100)).toEqual({ x: 25, y: 50, width: 50, height: 25 })
  })

  it('stays inside the image, with at least one pixel', () => {
    expect(cropBox({
      x: 0.99,
      y: 0.99,
      width: 0.5,
      height: 0.001,
    }, 10, 10)).toEqual({ x: 9, y: 9, width: 1, height: 1 })
    expect(cropBox({ x: 0, y: 0, width: 1, height: 1 }, 10, 10)).toEqual({ x: 0, y: 0, width: 10, height: 10 })
  })
})

describe('cropPixels', () => {
  it('copies the rectangle', () => {
    const result = cropPixels(indexed(), {
      x: 0.25,
      y: 1 / 3,
      width: 0.5,
      height: 2 / 3,
    })
    expect([result.width, result.height]).toEqual([2, 2])
    expect(indexes(result)).toEqual([5, 6, 9, 10])
  })
})
