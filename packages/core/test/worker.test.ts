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
  beforeAll(async () => {
    vi.stubGlobal('postMessage', postMessage)
    await import('../src/processing/worker')
  })

  afterEach(() => {
    postMessage.mockClear()
  })

  it('answers a threshold job and transfers the result', () => {
    const [response, transfer] = send({
      id: 1,
      operation: 'threshold',
      source: grayImage(8),
    })
    expect(response.id).toBe(1)
    expect(response).toMatchObject({
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
