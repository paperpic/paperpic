import type { PixelBuffer } from '../processing/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rectangleCorners } from '../processing/homography'
import { sheetPhoto } from '../test/photos'
import { PipelineRunner } from './runner'

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

  it('runs several jobs at once, and gives each its own result', async () => {
    const runner = new PipelineRunner()
    const first = runner.run(pixels(), steps)
    const second = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(2))
    const [firstId, secondId] = worker.postMessage.mock.calls.map(([request]) => request.id)

    const firstResult = pixels()
    const secondResult = pixels()
    worker.onmessage!({
      data: { id: secondId, result: secondResult, milliseconds: 1 },
    })
    worker.onmessage!({
      data: { id: firstId, result: firstResult, milliseconds: 1 },
    })

    await expect(first).resolves.toBe(firstResult)
    await expect(second).resolves.toBe(secondResult)
  })

  it.each([
    [
      rectangleCorners(0.1, 0.1, 0.9, 0.9),
    ],
    [null],
  ])('looks for a document in the worker, and gives its corners, such as %o', async (corners) => {
    const runner = new PipelineRunner()
    const source = pixels()
    const job = runner.detect(source, steps, () => true)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce())
    const [request, transfer] = worker.postMessage.mock.calls[0]!
    expect(request).toMatchObject({ operation: 'detect', steps })
    expect(transfer).toEqual([source.data.buffer])

    worker.onmessage!({
      data: { id: request.id, corners, milliseconds: 1 },
    })
    await expect(job).resolves.toEqual(corners)
  })

  it('looks for a document on the main thread when the worker cannot be created', async () => {
    vi.stubGlobal('Worker', class {
      constructor() {
        throw new Error('not allowed')
      }
    })
    const photo = sheetPhoto({ width: 240, height: 180 }, rectangleCorners(60, 30, 180, 150))
    const corners = await new PipelineRunner().detect(photo, [], () => true)
    expect(corners![0].x).toBeCloseTo(0.25, 1)
    expect(corners![2].x).toBeCloseTo(0.75, 1)
  })

  it('drops a search that nobody wants by the time the worker is ready', async () => {
    let wanted = true
    const job = new PipelineRunner().detect(pixels(), steps, () => wanted)
    const worker = await started()
    wanted = false
    worker.onmessage!({
      data: { ready: true },
    })
    await expect(job).resolves.toBeNull()
    expect(worker.postMessage).not.toHaveBeenCalled()
  })

  it('drops a search that nobody wants before the main thread runs it', async () => {
    vi.useFakeTimers()
    let wanted = true
    const read = vi.fn(() => new Uint8ClampedArray(8))
    const source = Object.defineProperty(pixels(), 'data', { get: read })
    const job = new PipelineRunner().detect(source, steps, () => wanted)
    wanted = false
    await vi.advanceTimersByTimeAsync(5000)
    await expect(job).resolves.toBeNull()
    expect(read).not.toHaveBeenCalled()
  })

  it('fails every job when the worker crashes', async () => {
    const runner = new PipelineRunner()
    const first = runner.run(pixels(), steps)
    const second = runner.run(pixels(), steps)
    const worker = await started()
    worker.onmessage!({
      data: { ready: true },
    })
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledTimes(2))

    worker.onerror!({ message: 'crashed' })

    await expect(first).rejects.toThrow('crashed')
    await expect(second).rejects.toThrow('crashed')
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

  it('starts no worker once destroyed', async () => {
    const runner = new PipelineRunner()
    runner.destroy()
    await expect(runner.detect(pixels(), steps, () => true)).rejects.toThrow('destroyed')
    expect(FakeWorker.instances).toHaveLength(0)
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
