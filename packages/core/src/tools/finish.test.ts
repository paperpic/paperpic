import type { Operation } from '../pipeline/operations'
import type { PipelineStep } from '../pipeline/steps'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveOutputType } from '../pipeline/export'
import { finishSetting, toPipelineSteps, toPreviewSteps, trailingRotation } from '../pipeline/operations'
import { photoFrame } from '../pipeline/photo-frame'
import { renderPreview } from '../pipeline/preview'
import { planRead, resultSize } from '../pipeline/read-plan'
import { PipelineRunner } from '../pipeline/runner'
import { applySteps } from '../pipeline/steps'
import { grayPixels } from '../processing/grayscale'
import { adaptiveThreshold, prepareThreshold } from '../processing/threshold'
import { confirmFinish, finishEdit, finishOperation, openFinish } from './finish'

const right = { type: 'rotate', direction: 1 } as const
const left = { type: 'rotate', direction: -1 } as const
const crop = {
  type: 'crop',
  rect: { x: 0, y: 0, width: 0.5, height: 0.5 },
} as const
const mono = {
  type: 'finish',
  mode: 'mono',
  sensitivity: 0.7,
  softness: 0.25,
} as const satisfies Operation
const gray = { ...mono, mode: 'gray' } as const satisfies Operation
const original = { ...mono, mode: 'original' } as const satisfies Operation
const step: PipelineStep = { type: 'threshold', sensitivity: 0.7, softness: 0.25 }
const grayStep: PipelineStep = {
  type: 'adjust',
  brightness: 0,
  contrast: 0,
  gray: true,
}

function pixels(size = 8) {
  return {
    data: new Uint8ClampedArray(size * size * 4).fill(200),
    width: size,
    height: size,
  }
}

/** Red, green and blue pixels, which a gray finish changes. */
function colors() {
  return {
    data: new Uint8ClampedArray([
      255,
      0,
      0,
      255,
      0,
      255,
      0,
      255,
      0,
      0,
      255,
      255,
    ]),
    width: 3,
    height: 1,
  }
}

describe('the finish in the operations', () => {
  it('always runs last, wherever the user chose it', () => {
    expect(toPipelineSteps([mono, crop, right])).toEqual([
      crop,
      { type: 'rotate', rotation: 90 },
      step,
    ])
    expect(toPipelineSteps([crop, gray, right])).toEqual([
      crop,
      { type: 'rotate', rotation: 90 },
      grayStep,
    ])
  })

  it('takes the setting of its last edit', () => {
    expect(finishSetting([])).toEqual({ mode: 'original', sensitivity: 0.5, softness: 0.25 })
    expect(finishSetting([mono, crop])).toEqual({ mode: 'mono', sensitivity: 0.7, softness: 0.25 })
    expect(finishSetting([mono, gray])).toMatchObject({ mode: 'gray' })
    expect(toPipelineSteps([mono, original])).toEqual([])
  })

  it('does not break rotations that cancel out', () => {
    expect(toPipelineSteps([right, mono, left])).toEqual([step])
  })

  it('leaves a rotation after it to the view matrix', () => {
    expect(trailingRotation([mono, right])).toBe(90)
    expect(trailingRotation([right, gray])).toBe(90)
    expect(trailingRotation([crop, mono, right])).toBe(90)
    expect(toPreviewSteps([mono, right])).toEqual([])
  })

  it('stays out of the shape that a preview computes', () => {
    expect(toPreviewSteps([right, crop, mono])).toEqual([
      { type: 'rotate', rotation: 90 },
      crop,
    ])
    expect(toPreviewSteps([crop, gray, crop])).toEqual([crop, crop])
  })
})

describe('the finish in the pipeline', () => {
  it('cleans the image in black and white', () => {
    const source = pixels()
    expect(applySteps(source, [step]).data).toEqual(adaptiveThreshold(pixels(), { sensitivity: 0.7, softness: 0.25 }).data)
  })

  it('turns the image gray', () => {
    expect(applySteps(colors(), [grayStep])).toEqual(grayPixels(colors()))
  })

  it('stays a step after reading, and keeps the size', () => {
    const plan = planRead({ width: 100, height: 50 }, [crop, step])
    expect(plan.region).toEqual({ x: 0, y: 0, width: 50, height: 25 })
    expect(plan.steps).toEqual([step])
    expect(resultSize({ width: 100, height: 50 }, [crop, step])).toEqual({ width: 50, height: 25 })
    expect(resultSize({ width: 100, height: 50 }, [crop, grayStep])).toEqual({ width: 50, height: 25 })
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
    vi.stubGlobal('ImageData', class {
      data: Uint8ClampedArray
      constructor(data: Uint8ClampedArray) {
        this.data = data
      }
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4).fill(255).map((value, index) => index % 4 === 0
          ? value
          : 0),
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

  it('with black and white, prepares it once and repaints without the worker', async () => {
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

  it('with black and white, ignores brightness and contrast', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(async () => prepareThreshold(pixels())),
    }
    const preview = await renderPreview(image, [], step, runner)
    preview.tint!({ type: 'adjust', brightness: 0.5, contrast: 0 })
    expect(putImageData).toHaveBeenCalledTimes(1)
  })

  it('switches between the original and gray without the worker', async () => {
    stubCanvas()
    const runner = {
      run: vi.fn(),
      prepare: vi.fn(),
    }
    const preview = await renderPreview(image, [], { type: 'adjust', brightness: 0, contrast: 0 }, runner)
    // Red stays red in the original
    expect([
      ...putImageData.mock.calls[0]![0].data.slice(0, 4),
    ]).toEqual([255, 0, 0, 0])

    preview.tint!(grayStep)

    expect(runner.run).not.toHaveBeenCalled()
    expect(putImageData).toHaveBeenCalledTimes(2)
    expect([
      ...putImageData.mock.calls[1]![0].data.slice(0, 4),
    ]).toEqual([53, 53, 53, 0])
  })
})

describe('the panel of Clean up', () => {
  it('opens in black and white from the original, and with the finish of the edits otherwise', () => {
    expect(openFinish([])).toEqual({ mode: 'mono', sensitivity: 0.5 })
    expect(openFinish([mono])).toEqual({ mode: 'mono', sensitivity: 0.7 })
    expect(openFinish([gray])).toEqual({ mode: 'gray', sensitivity: 0.7 })
    expect(openFinish([mono, original])).toEqual({ mode: 'mono', sensitivity: 0.7 })
  })

  it('leaves no edit on Done when nothing on display changes, even if the sensitivity moved out of black and white', () => {
    expect(confirmFinish({ mode: 'original', sensitivity: 0.9 }, [], undefined)).toBeNull()
    expect(confirmFinish({ mode: 'gray', sensitivity: 0.9 }, [gray], undefined)).toBeNull()
    expect(confirmFinish({ mode: 'mono', sensitivity: 0.7 }, [mono], undefined)).toBeNull()
    expect(confirmFinish({ mode: 'original', sensitivity: 0.7 }, [mono], undefined)).toEqual(original)
    expect(confirmFinish({ mode: 'gray', sensitivity: 0.7 }, [mono], undefined)).toEqual(gray)
  })

  it('keeps a sensitivity set from code out of black and white, for when it comes', () => {
    expect(finishEdit({ mode: 'original', sensitivity: 0.9 }, [], undefined)).toEqual({
      type: 'finish',
      mode: 'original',
      sensitivity: 0.9,
      softness: 0.25,
    })
  })

  it('takes the softness of the option over the one of the edits', () => {
    expect(finishOperation({ mode: 'mono', sensitivity: 0.5 }, [mono], 0)).toMatchObject({ softness: 0 })
    expect(finishOperation({ mode: 'mono', sensitivity: 0.5 }, [
      { ...mono, softness: 0.4 },
    ], undefined)).toMatchObject({ softness: 0.4 })
  })
})
