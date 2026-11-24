import type { Quad } from '../types'
import { describe, expect, it } from 'vitest'
import { noisePhoto, painted, shaded, sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { detectDocument, findCandidates } from './detect-document'

const photo = { width: 480, height: 360 }

const sheet: Quad = [
  { x: 130, y: 50 },
  { x: 350, y: 64 },
  { x: 390, y: 310 },
  { x: 90, y: 296 },
]

/** The largest distance between the corners found and the real ones, as a fraction of the photo. `null` if none was found. */
function error(found: Quad | null, corners: Quad, { width, height }: { height: number, width: number } = photo): number | null {
  return found && Math.max(...found.map(({ x, y }, index) => Math.max(
    Math.abs(x - corners[index]!.x / width),
    Math.abs(y - corners[index]!.y / height),
  )))
}

/** Turns corners around the middle of the photo, in degrees. */
function turned(corners: Quad, degrees: number): Quad {
  const cosine = Math.cos(degrees * Math.PI / 180)
  const sine = Math.sin(degrees * Math.PI / 180)
  return corners.map(({ x, y }) => {
    const fromX = x - photo.width / 2
    const fromY = y - photo.height / 2
    return {
      x: photo.width / 2 + fromX * cosine - fromY * sine,
      y: photo.height / 2 + fromX * sine + fromY * cosine,
    }
  }) as unknown as Quad
}

describe('detectDocument', () => {
  it('finds the corners of a sheet, from the top left one, clockwise', () => {
    expect(error(detectDocument(sheetPhoto(photo, sheet)), sheet)).toBeLessThan(0.01)
  })

  it.each([-25, -10, 10, 25])('finds a sheet turned %d degrees', (degrees) => {
    const corners = turned(sheet, degrees)
    expect(error(detectDocument(sheetPhoto(photo, corners)), corners)).toBeLessThan(0.015)
  })

  it('finds a blank sheet, and one on a lighter table', () => {
    expect(error(detectDocument(sheetPhoto(photo, sheet, { text: false })), sheet)).toBeLessThan(0.01)
    expect(error(detectDocument(sheetPhoto(photo, sheet, {
      table: [168, 140, 112],
    })), sheet)).toBeLessThan(0.01)
  })

  it.each([
    [
      'half of it',
      (x: number) => x >= 240,
    ],
    [
      'a corner of it',
      (x: number, y: number) => x + y > 420,
    ],
    [
      'the middle of it',
      (_: number, y: number) => y > 120 && y < 200,
    ],
  ])('finds a sheet with a hard shadow over %s', (_, inShadow) => {
    expect(error(detectDocument(shaded(sheetPhoto(photo, sheet), 0.25, inShadow)), sheet)).toBeLessThan(0.01)
  })

  it('finds the same corners in a copy of another size', () => {
    const scaled = (factor: number) => sheet.map(({ x, y }) => ({ x: x * factor, y: y * factor })) as unknown as Quad
    for (const factor of [0.5, 2]) {
      const size = { width: photo.width * factor, height: photo.height * factor }
      expect(error(detectDocument(sheetPhoto(size, scaled(factor))), scaled(factor), size)).toBeLessThan(0.02)
    }
  })

  it('finds a sheet that the photo cuts off, with its corners on the border of the photo', () => {
    const cut: Quad = [
      { x: 130, y: 50 },
      { x: 350, y: 50 },
      { x: 370, y: 520 },
      { x: 110, y: 520 },
    ]
    const found = detectDocument(sheetPhoto(photo, cut))!
    expect(found[0].y).toBeCloseTo(50 / 360, 1)
    expect(found[2].y).toBe(1)
    expect(found[3].y).toBe(1)
  })

  it.each([
    [
      'a plain photo',
      painted(photo, () => [120, 110, 100]),
    ],
    [
      'noise',
      noisePhoto(photo),
    ],
    [
      'a smooth change of light',
      painted(photo, (x, y) => [x / 2, y / 2, 90]),
    ],
    [
      'a sheet that fills the photo',
      sheetPhoto(photo, rectangleCorners(0, 0, 480, 360)),
    ],
    [
      'a sheet too small to be the document',
      sheetPhoto(photo, rectangleCorners(200, 150, 260, 200)),
    ],
    [
      'an image of one pixel',
      painted({ width: 1, height: 1 }, () => [255, 255, 255]),
    ],
    [
      'a very narrow image',
      painted({ width: 600, height: 3 }, x => [x % 256, 0, 0]),
    ],
  ])('finds nothing in %s', (_, image) => {
    expect(detectDocument(image)).toBeNull()
  })

  it('does not change the pixels it reads', () => {
    const image = sheetPhoto(photo, sheet)
    const before = image.data.slice()
    detectDocument(image)
    expect(image.data).toEqual(before)
  })
})

describe('findCandidates', () => {
  it('keeps every corner inside the image, and no shape that fills it', () => {
    const candidates = findCandidates(sheetPhoto(photo, sheet))
    expect(candidates.length).toBeGreaterThan(0)
    for (const { quad, features } of candidates) {
      expect(quad.every(({ x, y }) => x >= 0 && x <= 1 && y >= 0 && y <= 1)).toBe(true)
      expect(features.size).toBeLessThan(1)
      expect(features.borders).toBeLessThanOrEqual(2)
    }
  })
})
