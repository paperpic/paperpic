import { describe, expect, it } from 'vitest'
import { toPipelineSteps, trailingRotation } from '../pipeline/operations'

const left = { type: 'rotate', direction: -1 } as const
const right = { type: 'rotate', direction: 1 } as const

describe('rotations in the operations', () => {
  it('adds up the rotation', () => {
    expect(trailingRotation([])).toBe(0)
    expect(trailingRotation([right])).toBe(90)
    expect(trailingRotation([left])).toBe(270)
    expect(trailingRotation([right, right, left])).toBe(90)
  })

  it('leaves no steps when the rotations cancel out', () => {
    expect(toPipelineSteps([right, left])).toEqual([])
    expect(toPipelineSteps([right, right, right, right])).toEqual([])
  })

  it('merges rotations into one step', () => {
    expect(toPipelineSteps([right, right])).toEqual([
      { type: 'rotate', rotation: 180 },
    ])
  })
})
