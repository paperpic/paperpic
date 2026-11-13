import type { PixelBuffer } from '../src/processing/types'
import { describe, expect, it } from 'vitest'
import { adaptiveThreshold, applyThreshold, prepareThreshold } from '../src/processing/threshold'

function grayImage(width: number, height: number, value: (x: number, y: number) => number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4
      data.fill(value(x, y), offset, offset + 3)
      data[offset + 3] = 255
    }
  }
  return { data, width, height }
}

function isBlack({ data, width }: PixelBuffer, x: number, y: number): boolean {
  return data[(y * width + x) * 4] === 0
}

const WIDTH = 200
const HEIGHT = 100

/** Text is 80 levels darker than the paper, and the paper goes from 90 to 230 from left to right. */
function isText(x: number, y: number): boolean {
  return x % 20 < 3 && y % 20 < 3
}

const unevenPage = grayImage(WIDTH, HEIGHT, (x, y) => {
  const paper = 90 + 140 * x / WIDTH
  return isText(x, y)
    ? paper - 80
    : paper
})

describe('adaptiveThreshold', () => {
  it('returns an opaque image of the same size', () => {
    const result = adaptiveThreshold(unevenPage)
    expect(result.width).toBe(WIDTH)
    expect(result.height).toBe(HEIGHT)
    for (let offset = 3; offset < result.data.length; offset += 4) {
      expect(result.data[offset]).toBe(255)
    }
  })

  it('returns only black and white with a softness of 0', () => {
    const { data } = adaptiveThreshold(unevenPage, { softness: 0 })
    for (let offset = 0; offset < data.length; offset += 4) {
      expect([0, 255]).toContain(data[offset])
    }
  })

  it('keeps gray around the limit by default, so soft edges stay readable', () => {
    // A ramp from paper to ink, as the blurred edge of a letter in a photo
    const edge = grayImage(60, 60, x => 220 - Math.min(160, Math.max(0, x - 20) * 8))
    const { data } = adaptiveThreshold(edge, { windowRatio: 1 })
    const values = new Set<number>()
    for (let offset = 0; offset < data.length; offset += 4) {
      values.add(data[offset]!)
    }
    expect(values.has(0)).toBe(true)
    expect(values.has(255)).toBe(true)
    expect(values.size).toBeGreaterThan(2)
  })

  it('gives the same result from one preparation as from a full run, for every slider position', () => {
    const prepared = prepareThreshold(unevenPage)
    for (const sensitivity of [0, 0.25, 0.5, 0.75, 1]) {
      for (const softness of [0, 0.25]) {
        const options = { sensitivity, softness }
        expect(applyThreshold(prepared, options).data).toEqual(adaptiveThreshold(unevenPage, options).data)
      }
    }
  })

  it('stores the color channels in the right order, with an opaque alpha', () => {
    const page = grayImage(10, 10, () => 200)
    expect([
      ...applyThreshold(prepareThreshold(page)).data.slice(0, 4),
    ]).toEqual([255, 255, 255, 255])
    const dark = grayImage(10, 10, (x, y) => x === 5 && y === 5
      ? 10
      : 200)
    const { data, width } = applyThreshold(prepareThreshold(dark, { windowRatio: 1 }))
    expect([
      ...data.slice((5 * width + 5) * 4, (5 * width + 5) * 4 + 4),
    ]).toEqual([0, 0, 0, 255])
  })

  it('keeps paper white at the highest sensitivity', () => {
    const page = grayImage(40, 40, () => 200)
    expect(adaptiveThreshold(page, { sensitivity: 1 }).data[0]).toBe(255)
  })

  it('keeps a fully black image black', () => {
    const page = grayImage(10, 10, () => 0)
    expect(isBlack(adaptiveThreshold(page), 5, 5)).toBe(true)
  })

  it('finds dark text under uneven light, which no single global value can do', () => {
    // The text on the bright side (about 137) is lighter than the paper on the dark side (about 90)
    const result = adaptiveThreshold(unevenPage, { windowRatio: 0.3 })
    expect(isBlack(result, 1, 1)).toBe(true)
    expect(isBlack(result, 181, 1)).toBe(true)
    expect(isBlack(result, 10, 10)).toBe(false)
    expect(isBlack(result, 190, 10)).toBe(false)
  })

  it('handles the image borders and corners', () => {
    const page = grayImage(50, 50, (x, y) => (x < 2 && y < 2) || (x > 47 && y > 47)
      ? 20
      : 220)
    const result = adaptiveThreshold(page, { windowRatio: 0.2 })
    expect(isBlack(result, 0, 0)).toBe(true)
    expect(isBlack(result, 49, 49)).toBe(true)
    expect(isBlack(result, 25, 0)).toBe(false)
    expect(isBlack(result, 49, 25)).toBe(false)
  })

  it('accepts a window larger than the image', () => {
    const page = grayImage(10, 6, x => x < 2
      ? 20
      : 220)
    const result = adaptiveThreshold(page, { windowRatio: 10 })
    expect(isBlack(result, 0, 0)).toBe(true)
    expect(isBlack(result, 9, 5)).toBe(false)
  })

  it('keeps a flat area white', () => {
    const page = grayImage(40, 40, () => 200)
    expect(isBlack(adaptiveThreshold(page), 20, 20)).toBe(false)
  })

  it.each([0, 0.25])('darkens more pixels at a higher sensitivity, with a softness of %d', (softness) => {
    const brightness = ({ data }: PixelBuffer) => data.reduce((total, value, index) => index % 4 === 0
      ? total + value
      : total, 0)
    const page = grayImage(100, 100, (x, y) => 150 + (x * 7 + y * 13) % 60)
    const low = adaptiveThreshold(page, { sensitivity: 0.1, softness })
    const high = adaptiveThreshold(page, { sensitivity: 0.9, softness })
    expect(brightness(high)).toBeLessThan(brightness(low))
  })

  it.each([
    [
      { windowRatio: 0 },
    ],
    [
      { windowRatio: Number.NaN },
    ],
    [
      { sensitivity: -0.1 },
    ],
    [
      { sensitivity: 1.1 },
    ],
    [
      { softness: -0.1 },
    ],
    [
      { softness: 1.1 },
    ],
  ])('throws RangeError for %o', (options) => {
    expect(() => adaptiveThreshold(unevenPage, options)).toThrow(RangeError)
  })
})
