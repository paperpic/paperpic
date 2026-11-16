import { describe, expect, it } from 'vitest'
import { applySteps } from '../src/pipeline/steps'

describe('applySteps', () => {
  it('returns the same pixels without steps', () => {
    const source = {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }
    expect(applySteps(source, [])).toBe(source)
  })

  it('runs the steps', () => {
    const source = {
      data: new Uint8ClampedArray(8),
      width: 2,
      height: 1,
    }
    expect(applySteps(source, [
      { type: 'rotate', rotation: 90 },
    ])).toMatchObject({ width: 1, height: 2 })
  })
})
