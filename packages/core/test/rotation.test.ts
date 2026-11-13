import { describe, expect, it } from 'vitest'
import { normalizeRotation } from '../src'

describe('normalizeRotation', () => {
  it.each([
    [0, 0],
    [90, 90],
    [-90, 270],
    [450, 90],
    [44, 0],
    [46, 90],
    [359, 0],
  ])('normalizes %d to %d', (input, expected) => {
    expect(normalizeRotation(input)).toBe(expected)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'throws RangeError for %d',
    (input) => {
      expect(() => normalizeRotation(input)).toThrow(RangeError)
    },
  )
})
