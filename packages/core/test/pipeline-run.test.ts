import type { PixelBuffer } from '../src/processing/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportImage, outputSize, resolveOutputType } from '../src/pipeline/export'
import { PipelineRunner } from '../src/pipeline/run'

const steps = [
  { type: 'rotate', rotation: 90 },
] as const

function pixels(): PixelBuffer {
  return {
    data: new Uint8ClampedArray(8),
    width: 2,
    height: 1,
  }
}

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: ((event: { message: string }) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()

  constructor() {
    FakeWorker.instances.push(this)
  }
}

describe('pipelineRunner', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const started = async () => {
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1))
    return FakeWorker.instances[0]!
  }

  it('sends the job only after the worker reports that it loaded, transferring the pixels', async () => {
    const runner = new PipelineRunner()
    const source = pixels()
    const job = runner.run(source, steps)
    const worker = await started()

    expect(worker.postMessage).not.toHaveBeenCalled()

    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    const [request, transfer] = worker.postMessage.mock.calls[0]!
    expect(request).toMatchObject({ operation: 'pipeline', steps })
    expect(transfer).toEqual([source.data.buffer])

    const result = pixels()
    worker.onmessage!({
      data: { id: request.id, result, milliseconds: 1 },
    })
    await expect(job).resolves.toBe(result)
  })

  it('reuses the worker for the next job', async () => {
    const runner = new PipelineRunner()
    const first = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    worker.onmessage!({
      data: {
        id: worker.postMessage.mock.calls[0]![0].id,
        result: pixels(),
        milliseconds: 1,
      },
    })
    await first

    const second = runner.run(pixels(), steps)
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(2))
    expect(FakeWorker.instances).toHaveLength(1)
    worker.onmessage!({
      data: {
        id: worker.postMessage.mock.calls[1]![0].id,
        result: pixels(),
        milliseconds: 1,
      },
    })
    await second
  })

  it('falls back to the main thread when the worker fails to start, such as under a CSP', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()

    worker.onerror!({ message: 'blocked' })

    await expect(job).resolves.toMatchObject({ width: 1, height: 2 })
    expect(worker.terminate).toHaveBeenCalled()
    expect(worker.postMessage).not.toHaveBeenCalled()
  })

  it('falls back to the main thread when the worker cannot be created', async () => {
    vi.stubGlobal('Worker', class {
      constructor() {
        throw new Error('not allowed')
      }
    })
    await expect(new PipelineRunner().run(pixels(), steps)).resolves.toMatchObject({ width: 1, height: 2 })
  })

  it('falls back to the main thread when the worker never answers', async () => {
    vi.useFakeTimers()
    const job = new PipelineRunner().run(pixels(), steps)
    await vi.advanceTimersByTimeAsync(5000)
    await expect(job).resolves.toMatchObject({ width: 1, height: 2 })
    expect(FakeWorker.instances[0]!.terminate).toHaveBeenCalled()
  })

  it('reports a failed job', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())

    worker.onmessage!({
      data: { id: worker.postMessage.mock.calls[0]![0].id, error: 'out of memory' },
    })

    await expect(job).rejects.toThrow('out of memory')
  })

  it('reports a worker that crashes during a job', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())

    worker.onerror!({ message: 'crashed' })

    await expect(job).rejects.toThrow('crashed')
    expect(worker.terminate).toHaveBeenCalled()
  })

  it('starts a new worker after a crash', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    worker.onerror!({ message: 'crashed' })
    await expect(job).rejects.toThrow('crashed')

    const next = runner.run(pixels(), steps)
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(2))
    const fresh = FakeWorker.instances[1]!
    fresh.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(fresh.postMessage).toHaveBeenCalledOnce())
    const result = pixels()
    fresh.onmessage!({
      data: { id: fresh.postMessage.mock.calls[0]![0].id, result, milliseconds: 1 },
    })
    await expect(next).resolves.toBe(result)
  })

  it('stops a worker that is still starting on destroy, without doing the work', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()

    runner.destroy()

    await expect(job).rejects.toThrow('destroyed')
    expect(worker.terminate).toHaveBeenCalled()
    expect(worker.postMessage).not.toHaveBeenCalled()
  })

  it('stops the worker and fails the job on destroy', async () => {
    const runner = new PipelineRunner()
    const job = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())

    runner.destroy()

    await expect(job).rejects.toThrow('destroyed')
    expect(worker.terminate).toHaveBeenCalled()
  })
})

describe('resolveOutputType', () => {
  it('uses the type requested', () => {
    expect(resolveOutputType('/a.jpg', { type: 'image/webp' })).toBe('image/webp')
  })

  it('uses the type of a Blob', () => {
    expect(resolveOutputType(new Blob([], { type: 'image/jpeg' }))).toBe('image/jpeg')
  })

  it.each([
    ['/receipt.jpg', 'image/jpeg'],
    ['/receipt.JPEG?v=2', 'image/jpeg'],
    ['/receipt.webp#top', 'image/webp'],
    ['/receipt.png', 'image/png'],
  ])('reads the extension of %s', (url, type) => {
    expect(resolveOutputType(url)).toBe(type)
  })

  it('falls back to PNG for anything else', () => {
    expect(resolveOutputType('/image')).toBe('image/png')
    expect(resolveOutputType('/image.gif')).toBe('image/png')
    expect(resolveOutputType(new Blob([], { type: 'image/svg+xml' }))).toBe('image/png')
    expect(resolveOutputType(undefined)).toBe('image/png')
    expect(resolveOutputType('/a.jpg', { type: 'image/tiff' })).toBe('image/png')
  })
})

describe('outputSize', () => {
  it('keeps the full size by default', () => {
    expect(outputSize(4590, 8160)).toEqual({ width: 4590, height: 8160 })
  })

  it('limits the longest side, keeping the proportions', () => {
    expect(outputSize(4000, 2000, 1000)).toEqual({ width: 1000, height: 500 })
    expect(outputSize(2000, 4000, 1000)).toEqual({ width: 500, height: 1000 })
  })

  it('never enlarges', () => {
    expect(outputSize(100, 50, 1000)).toEqual({ width: 100, height: 50 })
  })
})

describe('exportImage', () => {
  const drawImage = vi.fn()
  const getImageData = vi.fn()
  const putImageData = vi.fn()
  const toBlob = vi.fn()
  const image = {} as CanvasImageSource
  const run = vi.fn()

  beforeEach(() => {
    drawImage.mockReset()
    putImageData.mockReset()
    run.mockReset()
    getImageData.mockReset()
    getImageData.mockImplementation((_x: number, _y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }))
    toBlob.mockReset()
    toBlob.mockImplementation((done: (blob: Blob) => void, type: string) => done(new Blob(['x'], { type })))
    run.mockImplementation(async ({ width, height }: PixelBuffer) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width: height,
      height: width,
    }))
    vi.stubGlobal('ImageData', class {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      getImageData,
      putImageData,
    } as unknown as CanvasRenderingContext2D)
    HTMLCanvasElement.prototype.toBlob = toBlob
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const request = {
    image,
    width: 400,
    height: 200,
    steps,
    run,
    source: '/receipt.jpg',
  }

  it('runs the steps and reports the size of the result', async () => {
    const result = await exportImage(request)
    expect(run.mock.calls[0]![1]).toBe(steps)
    expect(result).toMatchObject({ width: 200, height: 400, type: 'image/jpeg' })
    expect(result.blob.type).toBe('image/jpeg')
  })

  it('reads the image at the limited size', async () => {
    await exportImage({ ...request, maxOutputSize: 100 })
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 100, 50)
    expect(run.mock.calls[0]![0]).toMatchObject({ width: 100, height: 50 })
  })

  it('uses the format and quality requested', async () => {
    await exportImage({
      ...request,
      output: { type: 'image/webp', quality: 0.5 },
    })
    expect(toBlob.mock.calls[0]!.slice(1)).toEqual(['image/webp', 0.5])
  })

  it('reports the format the browser really gave', async () => {
    toBlob.mockImplementation((done: (blob: Blob) => void) => done(new Blob(['x'], { type: 'image/png' })))
    await expect(exportImage({
      ...request,
      output: { type: 'image/webp' },
    })).resolves.toMatchObject({ type: 'image/png' })
  })

  it('explains what to do with an image from another origin', async () => {
    getImageData.mockImplementation(() => {
      throw new Error('tainted')
    })
    await expect(exportImage(request)).rejects.toThrow('same origin')
    expect(run).not.toHaveBeenCalled()
  })

  it('explains what to do when the image does not fit in a canvas', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    await expect(exportImage(request)).rejects.toThrow('maxOutputSize')
  })

  it('explains what to do when the browser cannot encode the image', async () => {
    toBlob.mockImplementation((done: (blob: Blob | null) => void) => done(null))
    await expect(exportImage(request)).rejects.toThrow('maxOutputSize')
  })
})
