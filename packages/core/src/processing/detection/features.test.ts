import type { PixelBuffer, Quad } from '../types'
import { describe, expect, it } from 'vitest'
import { painted, shaded, sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { findEdges } from './edges'
import { countBorders, measureFeatures } from './features'
import { closing, mapChannels, shrink } from './planes'

const size = { width: 160, height: 120 }
const sheet = rectangleCorners(40, 30, 120, 90)

function measure(quad: Quad, options: Parameters<typeof sheetPhoto>[2] = {}, corners: Quad = sheet) {
  return measureIn(sheetPhoto(size, corners, options), quad)
}

function measureIn(image: PixelBuffer, quad: Quad) {
  const planes = shrink(image, 256)
  const planesWithoutText = mapChannels(planes, (channel, plane) => closing(channel, plane, 4))
  return measureFeatures(quad, {
    edges: findEdges(planes),
    edgesWithoutText: findEdges(planesWithoutText),
    planesWithoutText,
  })
}

describe('measureFeatures', () => {
  it('describes a white sheet on a dark table', () => {
    const features = measure(sheet)
    expect(features).toMatchObject({ borders: 0, brighter: 1, evenness: 1 })
    expect(features.size).toBeCloseTo(0.5)
    expect(features.roughness).toBeLessThan(0.05)
    expect(features.contrast).toBeGreaterThan(1)
    expect(features.worstContrast).toBe(0.5)
    expect(features.outlineWithoutText).toBeGreaterThan(0.8)
    expect(features.worstSide).toBeGreaterThan(0.7)
    expect(features.pastCorner).toBeLessThan(0.2)
    expect(features.pastSide).toBeLessThan(0.2)
  })

  it('tells a sheet darker than the table', () => {
    const dark = measure(sheet, {
      paper: [40, 40, 40],
      table: [210, 210, 210],
      text: false,
    })
    expect(dark.brighter).toBe(0)
    expect(dark.contrast).toBeGreaterThan(1)
  })

  it('tells a part of a sheet, whose edges go on past it', () => {
    const half = measure(rectangleCorners(40, 30, 80, 90))
    expect(half.pastCorner).toBeGreaterThan(0.8)
    expect(half.pastSide).toBeGreaterThan(0.8)
    // The side in the middle of the paper has paper at both sides
    expect(half.worstContrast).toBeLessThan(0.1)
  })

  it('tells the inside with several things from the one with a shadow or a smooth change of light', () => {
    const { roughness, contrast } = measureIn(shaded(sheetPhoto(size, sheet), 0.3, x => x >= 80), sheet)
    expect(roughness).toBeLessThan(0.05)
    // The contrast with the table, which is in the same shadow, stays
    expect(contrast).toBeGreaterThan(1)

    expect(measureIn(painted(size, x => [60 + x, 60 + x, 60 + x]), sheet).roughness).toBeLessThan(0.05)

    const things = painted(size, (x, y) => (Math.floor(x / 12) + Math.floor(y / 12)) % 2 === 0
      ? [220, 220, 220]
      : [40, 40, 40])
    expect(measureIn(things, sheet).roughness).toBeGreaterThan(1)
  })

  it('compares the light of a dark photo as that of a bright one', () => {
    const photo = (light: number) => sheetPhoto(size, sheet, {
      paper: [240 * light, 240 * light, 240 * light],
      table: [80 * light, 80 * light, 80 * light],
      text: false,
    })
    const bright = measureIn(photo(1), sheet)
    const dark = measureIn(photo(0.5), sheet)
    expect(dark.contrast / bright.contrast).toBeGreaterThan(0.8)
  })

  it('takes a less colorful inside for a brighter one, because paper is white under any light', () => {
    const { brighter } = measure(sheet, {
      paper: [150, 150, 150],
      table: [220, 150, 90],
      text: false,
    })
    expect(brighter).toBe(1)
  })

  it('tells a shape that takes in some of the table', () => {
    const wide = measure(rectangleCorners(20, 10, 140, 110))
    expect(wide.worstContrast).toBeLessThan(0.1)
    expect(wide.outline).toBeLessThan(0.2)
  })

  it('compares the facing sides that differ most', () => {
    const { evenness } = measure([
      { x: 60, y: 30 },
      { x: 100, y: 30 },
      { x: 120, y: 90 },
      { x: 40, y: 90 },
    ])
    expect(evenness).toBeCloseTo(0.5)
  })

  it('measures a shape with nothing outside to compare with', () => {
    const features = measure(rectangleCorners(0, 0, 159, 119), {}, rectangleCorners(0, 0, 160, 120))
    expect(features).toMatchObject({
      borders: 4,
      brighter: 0,
      contrast: 0,
      worstContrast: 0,
    })
  })
})

describe('countBorders', () => {
  it('counts the sides on the border of the photo', () => {
    expect(countBorders(sheet, size)).toBe(0)
    expect(countBorders(rectangleCorners(40, 30, 120, 119), size)).toBe(1)
    expect(countBorders(rectangleCorners(40, 0, 120, 119), size)).toBe(2)
  })
})
