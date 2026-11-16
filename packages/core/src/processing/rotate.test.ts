import { describe, expect, it } from 'vitest'
import { rotatePixels } from './rotate'

describe('rotatePixels', () => {
  // 3×2 image where each pixel holds its own index in every channel
  //   0 1 2
  //   3 4 5
  const image = () => ({
    data: new Uint8ClampedArray([0, 1, 2, 3, 4, 5].flatMap(value => [value, value, value, 255])),
    width: 3,
    height: 2,
  })
  const indexes = ({ data }: { data: Uint8ClampedArray }) => [...data].filter((_, index) => index % 4 === 0)

  it('turns 90 degrees clockwise', () => {
    const result = rotatePixels(image(), 90)
    expect([result.width, result.height]).toEqual([2, 3])
    expect(indexes(result)).toEqual([3, 0, 4, 1, 5, 2])
  })

  it('turns 180 degrees', () => {
    const result = rotatePixels(image(), 180)
    expect([result.width, result.height]).toEqual([3, 2])
    expect(indexes(result)).toEqual([5, 4, 3, 2, 1, 0])
  })

  it('turns 270 degrees clockwise', () => {
    const result = rotatePixels(image(), 270)
    expect([result.width, result.height]).toEqual([2, 3])
    expect(indexes(result)).toEqual([2, 5, 1, 4, 0, 3])
  })

  it('keeps the whole pixel, alpha included', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80])
    expect([
      ...rotatePixels({ data, width: 2, height: 1 }, 180).data,
    ]).toEqual([50, 60, 70, 80, 10, 20, 30, 40])
  })

  it('comes back to the start after four turns', () => {
    const start = image()
    const half = rotatePixels(rotatePixels(start, 90), 90)
    expect(rotatePixels(rotatePixels(half, 90), 90).data).toEqual(start.data)
  })
})
