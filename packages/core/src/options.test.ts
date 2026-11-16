import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS, mergeOptions, sameOption, validateOptions } from './options'

describe('mergeOptions', () => {
  it('keeps the options that are missing', () => {
    const current = mergeOptions(DEFAULT_OPTIONS, { alt: 'Receipt', editable: false })
    expect(mergeOptions(current, { download: true })).toEqual({
      ...DEFAULT_OPTIONS,
      alt: 'Receipt',
      editable: false,
      download: true,
    })
  })

  it('brings back the default of an option set to undefined, as wrappers pass it', () => {
    const current = mergeOptions(DEFAULT_OPTIONS, { editable: false, softness: 0.5 })
    expect(mergeOptions(current, { editable: undefined, softness: undefined })).toEqual(DEFAULT_OPTIONS)
  })

  it('ignores src and anything that is not an option', () => {
    expect(mergeOptions(DEFAULT_OPTIONS, { src: '/a.png', other: 1 } as never)).toEqual(DEFAULT_OPTIONS)
  })
})

describe('sameOption', () => {
  it('compares plain values', () => {
    expect(sameOption(1, 1)).toBe(true)
    expect(sameOption(1, 2)).toBe(false)
    expect(sameOption(undefined, null)).toBe(false)
  })

  it('takes a new array or object with the same contents for the same value', () => {
    expect(sameOption(['crop', 'flip'], ['crop', 'flip'])).toBe(true)
    expect(sameOption({ type: 'image/png' }, { type: 'image/png' })).toBe(true)
  })

  it('sees a change one level in', () => {
    expect(sameOption(['crop', 'flip'], ['flip', 'crop'])).toBe(false)
    expect(sameOption(['crop'], ['crop', 'flip'])).toBe(false)
    expect(sameOption({ quality: 0.5 }, { quality: 0.6 })).toBe(false)
    expect(sameOption({ 0: 'crop' }, ['crop'])).toBe(false)
    expect(sameOption({}, null)).toBe(false)
  })
})

describe('validateOptions', () => {
  it('accepts values in range, and undefined or null for a default', () => {
    expect(() => validateOptions({
      softness: 0,
      aspectRatio: 210 / 297,
      maxOutputSize: 2000,
      output: { quality: 1, type: 'image/webp' },
    })).not.toThrow()
    expect(() => validateOptions({
      softness: undefined,
      output: { type: null as never },
    })).not.toThrow()
  })

  it.each([
    [
      { softness: 1.5 },
      'softness must be between 0 and 1, got 1.5',
    ],
    [
      { aspectRatio: 0 },
      'aspectRatio must be width divided by height',
    ],
    [
      { aspectRatio: Number.POSITIVE_INFINITY },
      'aspectRatio',
    ],
    [
      { maxOutputSize: -1 },
      'maxOutputSize must be a positive number of pixels',
    ],
    [
      {
        output: { quality: 2 },
      },
      'output.quality must be between 0 and 1',
    ],
    [
      {
        output: { type: 'image/gif' },
      },
      'output.type must be \'image/jpeg\', \'image/png\', \'image/webp\', got \'image/gif\'',
    ],
  ])('names the option that is out of range in %j', (options, message) => {
    expect(() => validateOptions(options)).toThrow(RangeError)
    expect(() => validateOptions(options)).toThrow(message)
  })
})
