import { describe, expect, it } from 'vitest'
import { DEFAULT_SENSITIVITY, DEFAULT_SOFTNESS } from '../processing/threshold'
import { adjustSetting, finishSetting, toneStep, toPipelineSteps, toPreviewSteps, trailingRotation } from './operations'

const half = { x: 0, y: 0, width: 0.5, height: 0.5 }
const right = { type: 'rotate', direction: 1 } as const
const left = { type: 'rotate', direction: -1 } as const
const crop = { type: 'crop', rect: half } as const

describe('operations with pixels', () => {
  it('merges only the rotations next to each other', () => {
    expect(toPipelineSteps([right, right, crop, left])).toEqual([
      { type: 'rotate', rotation: 180 },
      crop,
      { type: 'rotate', rotation: 270 },
    ])
  })

  it('drops rotations that cancel out around a crop', () => {
    expect(toPipelineSteps([right, left, crop])).toEqual([crop])
  })

  it('leaves to the view matrix only the rotation after the last crop', () => {
    expect(trailingRotation([right, crop])).toBe(0)
    expect(trailingRotation([right, crop, left])).toBe(270)
    expect(trailingRotation([right, right])).toBe(180)
  })

  it('previews the pixels up to the last crop', () => {
    expect(toPreviewSteps([right, crop, left])).toEqual([
      { type: 'rotate', rotation: 90 },
      crop,
    ])
    expect(toPreviewSteps([right, right])).toEqual([])
  })
})

describe('settings of the tones', () => {
  const mono = {
    type: 'finish',
    mode: 'mono',
    sensitivity: 0.3,
    softness: 0.1,
  } as const
  const gray = { ...mono, mode: 'gray' } as const
  const original = { ...mono, mode: 'original' } as const
  const adjust = { type: 'adjust', brightness: 0.2, contrast: -0.1 } as const

  it('start with nothing in effect', () => {
    expect(finishSetting([])).toEqual({ mode: 'original', sensitivity: DEFAULT_SENSITIVITY, softness: DEFAULT_SOFTNESS })
    expect(adjustSetting([])).toEqual({ brightness: 0, contrast: 0 })
    expect(toneStep([right, crop])).toBeNull()
  })

  it('take their last edit, wherever it is in the list', () => {
    const later = { ...adjust, brightness: 0.5 }
    expect(adjustSetting([adjust, right, later, crop])).toEqual({ brightness: 0.5, contrast: -0.1 })
    expect(finishSetting([mono, crop, original]).mode).toBe('original')
  })

  it('leave out brightness and contrast in black and white', () => {
    expect(toneStep([adjust, mono])).toEqual({ type: 'threshold', sensitivity: 0.3, softness: 0.1 })
    expect(toneStep([adjust, mono, original])).toEqual(adjust)
  })

  it('turn the image gray after brightness and contrast', () => {
    expect(toneStep([adjust, gray])).toEqual({ ...adjust, gray: true })
    expect(toneStep([gray])).toEqual({
      type: 'adjust',
      brightness: 0,
      contrast: 0,
      gray: true,
    })
    expect(toPipelineSteps([gray, crop])).toEqual([
      crop,
      {
        type: 'adjust',
        brightness: 0,
        contrast: 0,
        gray: true,
      },
    ])
    expect(toneStep([gray, original])).toBeNull()
  })

  it('count a ruler moved back to 0 as no change', () => {
    expect(toneStep([
      adjust,
      { ...adjust, brightness: 0, contrast: 0 },
    ])).toBeNull()
  })

  it('go last in the steps, after the shape', () => {
    expect(toPipelineSteps([adjust, crop]).map(({ type }) => type)).toEqual(['crop', 'adjust'])
  })
})
