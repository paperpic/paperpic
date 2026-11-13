import type { Operation, PipelineStep } from '../src/pipeline/operations'
import type { PixelBuffer } from '../src/processing/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveOutputType } from '../src/pipeline/export'
import { adjustSetting, toneStep, toPipelineSteps, toPreviewSteps } from '../src/pipeline/operations'
import { photoFrame } from '../src/pipeline/photo-frame'
import { applySteps } from '../src/pipeline/pipeline'
import { renderPreview } from '../src/pipeline/preview'
import { planRead, resultSize } from '../src/pipeline/read-plan'
import { adjustPixels } from '../src/processing/adjust'

const crop = {
  type: 'crop',
  rect: { x: 0, y: 0, width: 0.5, height: 0.5 },
} as const
const brighter: Operation = { type: 'adjust', brightness: 0.2, contrast: 0 }
const sharper: Operation = { type: 'adjust', brightness: 0.2, contrast: 0.5 }
const neutral: Operation = { type: 'adjust', brightness: 0, contrast: 0 }
const cleanUp: Operation = {
  type: 'threshold',
  enabled: true,
  sensitivity: 0.5,
  softness: 0.25,
}
const step: PipelineStep = { type: 'adjust', brightness: 0.2, contrast: 0.5 }

/** One pixel per value, with the same value in red, green and blue. */
function grays(...values: number[]) {
  return {
    data: new Uint8ClampedArray(values.flatMap(value => [value, value, value, 128])),
    width: values.length,
    height: 1,
  }
}

function reds(pixels: { data: Uint8ClampedArray }) {
  return [...pixels.data].filter((_, index) => index % 4 === 0)
}

describe('adjustPixels', () => {
  it('leaves the image as it is at 0', () => {
    const source = grays(0, 1, 64, 128, 200, 255)
    expect(adjustPixels(source).data).toEqual(source.data)
    expect(adjustPixels(source, { brightness: 0, contrast: 0 }).data).toEqual(source.data)
  })

  it('shifts every tone with the brightness, up to half the range', () => {
    expect(reds(adjustPixels(grays(0, 100, 200, 255), { brightness: 0.3 }))).toEqual([38, 138, 238, 255])
    expect(reds(adjustPixels(grays(0, 100, 255), { brightness: -0.5 }))).toEqual([0, 36, 191])
  })

  it('spreads the tones away from middle gray with the contrast', () => {
    expect(reds(adjustPixels(grays(0, 100, 128, 200, 255), { contrast: 0.25 }))).toEqual([0, 89, 128, 230, 255])
    expect(reds(adjustPixels(grays(0, 128, 255), { contrast: -1 }))).toEqual([96, 128, 159])
  })

  it('keeps the transparency and the size', () => {
    const result = adjustPixels(grays(10, 20), { brightness: 1, contrast: 1 })
    expect([...result.data].filter((_, index) => index % 4 === 3)).toEqual([128, 128])
    expect(result).toMatchObject({ width: 2, height: 1 })
  })

  it('explains a value out of range', () => {
    expect(() => adjustPixels(grays(0), { brightness: 1.5 })).toThrow('brightness must be between -1 and 1, got 1.5')
    expect(() => adjustPixels(grays(0), { contrast: Number.NaN })).toThrow('contrast must be between -1 and 1')
  })
})

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

  it('are left out while the document is cleaned up, and come back after', () => {
    expect(toPipelineSteps([sharper, cleanUp])).toEqual([
      { type: 'threshold', sensitivity: 0.5, softness: 0.25 },
    ])
    expect(toPipelineSteps([
      sharper,
      cleanUp,
      { ...cleanUp, enabled: false },
    ])).toEqual([step])
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
  const putImageData = vi.fn()

  const stubCanvas = () => {
    vi.stubGlobal('ImageData', class {
      data: Uint8ClampedArray
      constructor(data: Uint8ClampedArray) {
        this.data = data
      }
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4).fill(100),
      }),
      putImageData,
    } as unknown as CanvasRenderingContext2D)
  }

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    putImageData.mockClear()
  })

  const image = {
    element: {} as CanvasImageSource,
    width: 8,
    height: 8,
    release: () => {},
  }

  it('shapes the image once and repaints its tones without the worker', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(async (source: PixelBuffer) => source),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [
      { type: 'rotate', rotation: 90 },
    ], step, runner)
    expect(runner.run).toHaveBeenCalledOnce()
    expect(runner.prepare).not.toHaveBeenCalled()
    expect(putImageData.mock.calls[0]![0].data[0]).toBe(adjustPixels(grays(100), step).data[0])

    preview.tint!({ type: 'adjust', brightness: -0.3, contrast: 0 })

    expect(runner.run).toHaveBeenCalledOnce()
    expect(putImageData).toHaveBeenCalledTimes(2)
    expect(putImageData.mock.calls[1]![0].data[0]).toBe(62)
  })

  it('ignores a threshold, which needs a preview of its own', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [], step, runner)
    expect(runner.run).not.toHaveBeenCalled()
    preview.tint!({ type: 'threshold', sensitivity: 0.5, softness: 0.25 })
    expect(putImageData).toHaveBeenCalledTimes(1)
  })
})
