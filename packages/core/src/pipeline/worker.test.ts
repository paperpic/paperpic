import type { WorkerRequest, WorkerResponse } from './worker'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { rectangleCorners } from '../processing/homography'
import { sheetPhoto } from '../test/photos'

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
    await import('./worker')
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

  it('prepares a threshold after the steps, and transfers the result', () => {
    const [response, transfer] = send({
      id: 5,
      operation: 'prepare',
      source: grayImage(8),
      steps: [
        { type: 'rotate', rotation: 90 },
      ],
    })
    expect(response).toMatchObject({
      id: 5,
      prepared: { width: 8, height: 8 },
    })
    expect(transfer).toHaveLength(1)
  })

  it('looks for the document after the steps, and gives its corners', () => {
    const [response, transfer] = send({
      id: 6,
      operation: 'detect',
      source: sheetPhoto({ width: 240, height: 180 }, rectangleCorners(60, 30, 180, 150)),
      steps: [
        {
          type: 'crop',
          rect: {
            x: 0,
            y: 0,
            width: 1,
            height: 0.95,
          },
        },
      ],
    })
    const { corners } = response as Extract<WorkerResponse, { corners: unknown }>
    expect(corners![0].x).toBeCloseTo(0.25, 1)
    expect(corners![2].y).toBeCloseTo(150 / 171, 1)
    expect(response).toMatchObject({ id: 6 })
    expect(transfer).toEqual([])
  })

  it('gives no corners when there is no document', () => {
    const [response] = send({
      id: 7,
      operation: 'detect',
      source: grayImage(32),
      steps: [],
    })
    expect(response).toMatchObject({ id: 7, corners: null })
  })

  it('transfers the result of the pipeline, with the time it took', () => {
    const [response, transfer] = send({
      id: 1,
      operation: 'pipeline',
      source: grayImage(8),
      steps: [
        { type: 'threshold', sensitivity: 0.5, softness: 0.25 },
      ],
    })
    expect(response).toMatchObject({
      id: 1,
      result: { width: 8, height: 8 },
    })
    expect(response).toHaveProperty('milliseconds')
    expect(transfer).toHaveLength(1)
  })

  it('reports an error instead of failing silently', () => {
    const [response, transfer] = send({
      id: 3,
      operation: 'pipeline',
      source: grayImage(8),
      steps: [
        { type: 'threshold', sensitivity: 2, softness: 0.25 },
      ],
    })
    expect(response).toMatchObject({
      id: 3,
      error: expect.stringContaining('sensitivity'),
    })
    expect(transfer).toEqual([])
  })
})
