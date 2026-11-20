import type { Operation } from '../pipeline/operations'
import type { PipelineStep } from '../pipeline/steps'
import type { PixelBuffer } from '../processing/types'
import type { CanvasMocks } from '../test/canvas'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveOutputType } from '../pipeline/export'
import { adjustSetting, toneStep, toPipelineSteps, toPreviewSteps } from '../pipeline/operations'
import { photoFrame } from '../pipeline/photo-frame'
import { renderPreview } from '../pipeline/preview'
import { planRead, resultSize } from '../pipeline/read-plan'
import { applySteps } from '../pipeline/steps'
import { adjustPixels } from '../processing/adjust'
import { stubCanvas } from '../test/canvas'
import { loadedImage } from '../test/images'
import { adjustEdit, canAdjust } from './adjust'

const crop = {
  type: 'crop',
  rect: { x: 0, y: 0, width: 0.5, height: 0.5 },
} as const
const brighter: Operation = { type: 'adjust', brightness: 0.2, contrast: 0 }
const sharper: Operation = { type: 'adjust', brightness: 0.2, contrast: 0.5 }
const neutral: Operation = { type: 'adjust', brightness: 0, contrast: 0 }
const mono = {
  type: 'finish',
  mode: 'mono',
  sensitivity: 0.5,
  softness: 0.25,
} as const satisfies Operation
const step: PipelineStep = { type: 'adjust', brightness: 0.2, contrast: 0.5 }

/** One pixel per value, with the same value in red, green and blue. */
function grays(...values: number[]) {
  return {
    data: new Uint8ClampedArray(values.flatMap(value => [value, value, value, 128])),
    width: values.length,
    height: 1,
  }
}

describe('adjustments in the operations', () => {
  it('take the setting of their last edit', () => {
    expect(adjustSetting([])).toEqual({ brightness: 0, contrast: 0 })
    expect(adjustSetting([brighter, crop, sharper])).toEqual({ brightness: 0.2, contrast: 0.5 })
  })

  it('always run last, wherever the user changed them', () => {
    expect(toPipelineSteps([sharper, crop])).toEqual([crop, step])
    expect(toPipelineSteps([crop, sharper])).toEqual([crop, step])
  })

  it('are no change when they go back to 0', () => {
    expect(toneStep([brighter, neutral])).toBeNull()
    expect(toPipelineSteps([brighter, neutral])).toEqual([])
  })

  it('are left out in black and white, and come back after', () => {
    expect(toPipelineSteps([sharper, mono])).toEqual([
      { type: 'threshold', sensitivity: 0.5, softness: 0.25 },
    ])
    expect(toPipelineSteps([
      sharper,
      mono,
      { ...mono, mode: 'original' },
    ])).toEqual([step])
  })

  it('stay in gray', () => {
    expect(toPipelineSteps([
      sharper,
      { ...mono, mode: 'gray' },
    ])).toEqual([
      { ...step, gray: true },
    ])
  })

  it('stay out of the shape that a preview computes', () => {
    expect(toPreviewSteps([crop, sharper])).toEqual([crop])
    expect(toPreviewSteps([sharper])).toEqual([])
  })
})

describe('adjustments in the pipeline', () => {
  it('change the tones', () => {
    expect(applySteps(grays(100), [step]).data).toEqual(adjustPixels(grays(100), { brightness: 0.2, contrast: 0.5 }).data)
  })

  it('stay a step after reading, and keep the size', () => {
    const plan = planRead({ width: 100, height: 50 }, [crop, step])
    expect(plan.region).toEqual({ x: 0, y: 0, width: 50, height: 25 })
    expect(plan.steps).toEqual([step])
    expect(resultSize({ width: 100, height: 50 }, [crop, step])).toEqual({ width: 50, height: 25 })
  })

  it('do not move the photo', () => {
    expect(photoFrame({ width: 100, height: 50 }, [step])).toEqual({
      photo: { width: 100, height: 50 },
      origin: { x: 0, y: 0 },
    })
  })

  it('keep the format of the source', () => {
    expect(resolveOutputType('/a.jpg', {}, false)).toBe('image/jpeg')
  })
})

describe('renderPreview with adjustments', () => {
  let putImageData: CanvasMocks['putImageData']

  beforeEach(() => {
    putImageData = stubCanvas((width, height) => new Uint8ClampedArray(width * height * 4).fill(100)).putImageData
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const image = loadedImage(8, 8)

  it('shapes the image once and repaints its tones without the worker', async () => {
    const runner = {
      run: vi.fn(async (source: PixelBuffer) => source),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [
      { type: 'rotate', rotation: 90 },
    ], step, null, runner)
    expect(runner.run).toHaveBeenCalledOnce()
    expect(runner.prepare).not.toHaveBeenCalled()
    expect(putImageData.mock.calls[0]![0].data[0]).toBe(adjustPixels(grays(100), step).data[0])

    preview.tint!({ type: 'adjust', brightness: -0.3, contrast: 0 })

    expect(runner.run).toHaveBeenCalledOnce()
    expect(putImageData).toHaveBeenCalledTimes(2)
    expect(putImageData.mock.calls[1]![0].data[0]).toBe(62)
  })

  it('ignores a threshold, which needs a preview of its own', async () => {
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [], step, null, runner)
    expect(runner.run).not.toHaveBeenCalled()
    preview.tint!({ type: 'threshold', sensitivity: 0.5, softness: 0.25 })
    expect(putImageData).toHaveBeenCalledTimes(1)
  })
})

describe('the panel of Adjust', () => {
  it('cannot change the tones in black and white, and can in gray', () => {
    expect(canAdjust([])).toBe(true)
    expect(canAdjust([mono])).toBe(false)
    expect(canAdjust([
      { ...mono, mode: 'gray' },
    ])).toBe(true)
  })

  it('leaves an edit only when the brightness or the contrast changes', () => {
    const adjusted: Operation = { type: 'adjust', brightness: 0.2, contrast: 0 }
    expect(adjustEdit({ brightness: 0.2, contrast: 0 }, [adjusted])).toBeNull()
    expect(adjustEdit({ brightness: 0.2, contrast: 0.1 }, [adjusted])).toEqual({ type: 'adjust', brightness: 0.2, contrast: 0.1 })
  })
})
