import type { WorkerRequest, WorkerResponse } from '../src/processing/worker'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

interface WorkerScope {
  onmessage: (event: { data: WorkerRequest }) => void
}

const postMessage = vi.fn<(message: WorkerResponse, transfer: Transferable[]) => void>()

function grayImage(size: number) {
  return {
    data: new Uint8ClampedArray(size * size * 4).fill(200),
    width: size,
    height: size,
  }
}

function send(request: WorkerRequest) {
  (globalThis as unknown as WorkerScope).onmessage({ data: request })
  return postMessage.mock.calls[0]!
}

describe('processing worker', () => {
  let firstMessage: Parameters<typeof postMessage> | undefined

  beforeAll(async () => {
    vi.stubGlobal('postMessage', postMessage)
    await import('../src/processing/worker')
    firstMessage = postMessage.mock.calls[0]
    postMessage.mockClear()
  })

  afterEach(() => {
    postMessage.mockClear()
  })

  it('reports that it loaded, before any job', () => {
    expect(firstMessage).toEqual([
      { ready: true },
      [],
    ])
  })

  it('runs the pipeline', () => {
    const [response] = send({
      id: 4,
      operation: 'pipeline',
      source: {
        data: new Uint8ClampedArray(2 * 1 * 4),
        width: 2,
        height: 1,
      },
      steps: [
        { type: 'rotate', rotation: 90 },
      ],
    })
    expect(response).toMatchObject({
      id: 4,
      result: { width: 1, height: 2 },
    })
  })

  it('answers a threshold job and transfers the result', () => {
    const [response, transfer] = send({
      id: 1,
      operation: 'threshold',
      source: grayImage(8),
    })
    expect(response).toMatchObject({
      id: 1,
      result: { width: 8, height: 8 },
    })
    expect(response).toHaveProperty('milliseconds')
    expect(transfer).toHaveLength(1)
  })

  it('answers a warp job with the requested size', () => {
    const [response] = send({
      id: 2,
      operation: 'warp',
      source: grayImage(8),
      quad: [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
        { x: 7, y: 7 },
        { x: 0, y: 7 },
      ],
      width: 4,
      height: 2,
    })
    expect(response).toMatchObject({
      id: 2,
      result: { width: 4, height: 2 },
    })
  })

  it('reports an error instead of failing silently', () => {
    const [response, transfer] = send({
      id: 3,
      operation: 'threshold',
      source: grayImage(8),
      options: { sensitivity: 2 },
    })
    expect(response).toMatchObject({
      id: 3,
      error: expect.stringContaining('sensitivity'),
    })
    expect(transfer).toEqual([])
  })
})
