import type { Features } from './features'
import { describe, expect, it } from 'vitest'
import { confidence } from './confidence'

/** A white sheet that takes about a half of the photo, on a dark table. */
const sheet: Features = {
  borders: 0,
  brighter: 1,
  contrast: 1.2,
  evenness: 0.9,
  outline: 0.85,
  outlineWithoutText: 0.85,
  pastCorner: 0.1,
  pastSide: 0.05,
  size: 0.7,
  spread: 0.1,
  worstContrast: 0.5,
  worstSide: 0.7,
}

describe('confidence', () => {
  it('is above 0 for a clear document', () => {
    expect(confidence(sheet)).toBeGreaterThan(0)
  })

  it.each([
    [
      'whose outline does not lie on edges',
      { outline: 0.3, outlineWithoutText: 0.3 },
    ],
    [
      'that is small',
      { size: 0.25 },
    ],
    [
      'with the light of several things inside',
      { spread: 1.2 },
    ],
    [
      'that is a part of a page, up to a fold',
      {
        pastCorner: 1,
        pastSide: 1,
        size: 0.5,
        worstContrast: 0,
      },
    ],
  ])('is below 0 for a shape %s', (_, features) => {
    expect(confidence({
      ...sheet,
      ...features,
    })).toBeLessThan(0)
  })

  it('grows with each thing that documents have', () => {
    for (const better of [
      { outline: 0.95 },
      { size: 0.8 },
      { evenness: 1 },
      { pastCorner: 0 },
      { pastSide: 0 },
      { spread: 0 },
    ] as Partial<Features>[]) {
      expect(confidence({
        ...sheet,
        ...better,
      })).toBeGreaterThan(confidence(sheet))
    }
  })
})
