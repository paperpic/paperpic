import { describe, expect, it } from 'vitest'
import { paperAspectRatio } from './paper'

describe('paperAspectRatio', () => {
  it.each([
    ['a4', 210 / 297],
    ['letter', 8.5 / 11],
    ['card', 53.98 / 85.6],
  ] as const)('gives %s in portrait or in landscape, as the estimate lies', (size, portrait) => {
    expect(paperAspectRatio(size, 0.6)).toBeCloseTo(portrait)
    expect(paperAspectRatio(size, 1.8)).toBeCloseTo(1 / portrait)
  })

  it('stands in portrait when the estimate is a square', () => {
    expect(paperAspectRatio('a4', 1)).toBeCloseTo(210 / 297)
  })
})
