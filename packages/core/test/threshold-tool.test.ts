import type { Operation, PipelineStep } from '../src/pipeline/operations'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveOutputType } from '../src/pipeline/export'
import { thresholdSetting, toPipelineSteps, toPreviewSteps, trailingRotation } from '../src/pipeline/operations'
import { photoFrame } from '../src/pipeline/photo-frame'
import { applySteps } from '../src/pipeline/pipeline'
import { renderPreview } from '../src/pipeline/preview'
import { planRead, resultSize } from '../src/pipeline/read-plan'
import { PipelineRunner } from '../src/pipeline/run'
import { adaptiveThreshold, prepareThreshold } from '../src/processing/threshold'

const right = { type: 'rotate', direction: 1 } as const
const left = { type: 'rotate', direction: -1 } as const
const crop = {
  type: 'crop',
  rect: { x: 0, y: 0, width: 0.5, height: 0.5 },
} as const
const on: Operation = {
  type: 'threshold',
  enabled: true,
  sensitivity: 0.7,
  softness: 0.25,
}
const off: Operation = {
  type: 'threshold',
  enabled: false,
  sensitivity: 0.7,
  softness: 0.25,
}
const step: PipelineStep = { type: 'threshold', sensitivity: 0.7, softness: 0.25 }

function pixels(size = 8) {
  return {
    data: new Uint8ClampedArray(size * size * 4).fill(200),
    width: size,
    height: size,
  }
}

describe('threshold in the operations', () => {
  it('always runs last, wherever the user turned it on', () => {
    expect(toPipelineSteps([on, crop, right])).toEqual([
      crop,
      { type: 'rotate', rotation: 90 },
      step,
    ])
    expect(toPipelineSteps([crop, on, right])).toEqual([
      crop,
      { type: 'rotate', rotation: 90 },
      step,
    ])
  })

  it('takes the setting of its last edit', () => {
    expect(thresholdSetting([])).toEqual({ enabled: false, sensitivity: 0.5, softness: 0.25 })
    expect(thresholdSetting([on, crop])).toEqual({ enabled: true, sensitivity: 0.7, softness: 0.25 })
    expect(thresholdSetting([on, off])).toMatchObject({ enabled: false })
    expect(toPipelineSteps([on, off])).toEqual([])
  })

  it('does not break rotations that cancel out', () => {
    expect(toPipelineSteps([right, on, left])).toEqual([step])
  })

  it('leaves a rotation after it to the view matrix', () => {
    expect(trailingRotation([on, right])).toBe(90)
    expect(trailingRotation([right, on])).toBe(90)
    expect(trailingRotation([crop, on, right])).toBe(90)
    expect(toPreviewSteps([on, right])).toEqual([])
  })

  it('stays out of the shape that a preview computes', () => {
    expect(toPreviewSteps([right, crop, on])).toEqual([
      { type: 'rotate', rotation: 90 },
      crop,
    ])
    expect(toPreviewSteps([crop, on, crop])).toEqual([crop, crop])
  })
})

describe('threshold in the pipeline', () => {
  it('cleans the image', () => {
    const source = pixels()
    expect(applySteps(source, [step]).data).toEqual(adaptiveThreshold(pixels(), { sensitivity: 0.7, softness: 0.25 }).data)
  })

  it('stays a step after reading, and keeps the size', () => {
    const plan = planRead({ width: 100, height: 50 }, [crop, step])
    expect(plan.region).toEqual({ x: 0, y: 0, width: 50, height: 25 })
    expect(plan.steps).toEqual([step])
    expect(resultSize({ width: 100, height: 50 }, [crop, step])).toEqual({ width: 50, height: 25 })
  })

  it('reads the region of the crops before it, and keeps rotation before it', () => {
    const plan = planRead({ width: 100, height: 50 }, [
      { type: 'rotate', rotation: 90 },
      step,
    ])
    expect(plan.steps).toEqual([
      { type: 'rotate', rotation: 90 },
      step,
    ])
  })

  it('does not move the photo', () => {
    expect(photoFrame({ width: 100, height: 50 }, [step])).toEqual({
      photo: { width: 100, height: 50 },
      origin: { x: 0, y: 0 },
    })
  })
})

describe('resolveOutputType for a cleaned document', () => {
  it('uses PNG, whatever the source', () => {
    expect(resolveOutputType('/a.jpg', {}, true)).toBe('image/png')
    expect(resolveOutputType(new Blob([], { type: 'image/webp' }), {}, true)).toBe('image/png')
  })

  it('lets the consumer choose', () => {
    expect(resolveOutputType('/a.jpg', { type: 'image/jpeg' }, true)).toBe('image/jpeg')
  })
})

describe('pipelineRunner.prepare', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to the main thread', async () => {
    vi.stubGlobal('Worker', class {
      constructor() {
        throw new Error('not allowed')
      }
    })
    const prepared = await new PipelineRunner().prepare(pixels(), [])
    expect(prepared.ratios).toEqual(prepareThreshold(pixels()).ratios)
  })

  it('sends the job to the worker and takes the result', async () => {
    const instances: { onmessage: (event: { data: unknown }) => void, postMessage: ReturnType<typeof vi.fn> }[] = []
    vi.stubGlobal('Worker', class {
      onmessage = () => {}
      onerror = () => {}
      postMessage = vi.fn()
      terminate = vi.fn()
      constructor() {
        instances.push(this as never)
      }
    })
    const job = new PipelineRunner().prepare(pixels(), [])
    await vi.waitFor(() => expect(instances).toHaveLength(1))
    const worker = instances[0]!
    worker.onmessage({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    const [request] = worker.postMessage.mock.calls[0]!
    expect(request.operation).toBe('prepare')

    const prepared = prepareThreshold(pixels())
    worker.onmessage({
      data: { id: request.id, prepared, milliseconds: 1 },
    })
    await expect(job).resolves.toBe(prepared)
  })
})

describe('renderPreview', () => {
  const putImageData = vi.fn()

  const stubCanvas = () => {
    vi.stubGlobal('ImageData', class {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
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

  it('without a threshold, has nothing for a slider to change', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [], null, runner)
    expect(preview.tint).toBeUndefined()
    expect(runner.prepare).not.toHaveBeenCalled()
  })

  it('with a threshold, prepares it once and repaints without the worker', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(async () => prepareThreshold(pixels())),
    }
    const preview = await renderPreview(image, [], step, runner)
    expect(runner.prepare).toHaveBeenCalledOnce()
    expect(putImageData).toHaveBeenCalledTimes(1)

    preview.tint!({ type: 'threshold', sensitivity: 0.9, softness: 0.25 })

    expect(runner.prepare).toHaveBeenCalledOnce()
    expect(putImageData).toHaveBeenCalledTimes(2)
  })

  it('with a threshold, ignores brightness and contrast', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(async () => prepareThreshold(pixels())),
    }
    const preview = await renderPreview(image, [], step, runner)
    preview.tint!({ type: 'adjust', brightness: 0.5, contrast: 0 })
    expect(putImageData).toHaveBeenCalledTimes(1)
  })
})
