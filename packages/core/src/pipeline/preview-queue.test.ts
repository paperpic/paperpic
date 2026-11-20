import type { Preview } from './preview'
import type { PreviewQueueHost } from './preview-queue'
import type { ShapeStep, ToneStep } from './steps'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PreviewQueue } from './preview-queue'

/** A render that finishes when the test says so. */
interface Pending {
  fail: (cause: unknown) => void
  finish: () => Preview
  steps: ShapeStep[]
}

function crop(x: number): ShapeStep[] {
  return [
    {
      type: 'crop',
      rect: { x, y: 0, width: 0.5, height: 0.5 },
    },
  ]
}
const adjust = (brightness: number): ToneStep => ({ type: 'adjust', brightness, contrast: 0 })

describe('previewQueue', () => {
  let renders: Pending[]
  let host: { [K in keyof PreviewQueueHost]: ReturnType<typeof vi.fn<PreviewQueueHost[K]>> }
  let queue: PreviewQueue

  /** Lets the queue react to a render that settled. */
  const settle = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    renders = []
    host = {
      render: vi.fn(steps => new Promise<Preview>((resolve, reject) => {
        renders.push({
          steps,
          fail: reject,
          finish: () => {
            const preview = {
              element: {} as CanvasImageSource,
              width: 1,
              height: 1,
              release: vi.fn(),
            }
            resolve(preview)
            return preview
          },
        })
      })),
      ready: vi.fn(),
      failed: vi.fn(),
      tint: vi.fn(),
    }
    queue = new PreviewQueue(host)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a preview and hands it over', async () => {
    queue.request(crop(0), null, null)
    expect(queue.pending).toBe(true)
    const preview = renders[0]!.finish()
    await settle()
    expect(host.ready).toHaveBeenCalledWith(preview)
    expect(queue.pending).toBe(false)
  })

  it('renders one at a time, and only the latest of those that waited', async () => {
    queue.request(crop(0), null, null)
    queue.request(crop(0.1), null, null)
    queue.request(crop(0.2), null, null)
    expect(renders).toHaveLength(1)

    const outdated = renders[0]!.finish()
    await settle()
    expect(renders.map(({ steps }) => steps)).toEqual([
      crop(0),
      crop(0.2),
    ])
    expect(host.ready).not.toHaveBeenCalled()
    expect(outdated.release).toHaveBeenCalled()
    expect(queue.pending).toBe(true)

    const latest = renders[1]!.finish()
    await settle()
    expect(host.ready.mock.calls).toEqual([
      [latest],
    ])
    expect(queue.pending).toBe(false)
  })

  it('reports only the failure of the latest preview', async () => {
    queue.request(crop(0), null, null)
    queue.request(crop(0.1), null, null)
    renders[0]!.fail(new Error('outdated'))
    await settle()
    expect(host.failed).not.toHaveBeenCalled()

    const cause = new Error('latest')
    renders[1]!.fail(cause)
    await settle()
    expect(host.failed).toHaveBeenCalledWith(cause)
    expect(queue.pending).toBe(false)
  })

  it('hands over nothing that was asked for before forget, and frees it', async () => {
    queue.request(crop(0), null, null)
    queue.request(crop(0.1), null, null)
    queue.forget()
    expect(queue.pending).toBe(false)

    const preview = renders[0]!.finish()
    await settle()
    expect(renders).toHaveLength(1)
    expect(host.ready).not.toHaveBeenCalled()
    expect(preview.release).toHaveBeenCalled()
  })

  describe('tints', () => {
    let frames: FrameRequestCallback[]
    const cancelAnimationFrame = vi.fn()

    beforeEach(() => {
      frames = []
      cancelAnimationFrame.mockClear()
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
      vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame)
    })

    it('repaints at most once per frame, with the latest tones', () => {
      queue.scheduleTint(adjust(0.1))
      queue.scheduleTint(adjust(0.2))
      expect(frames).toHaveLength(1)
      expect(host.tint).not.toHaveBeenCalled()

      frames[0]!(0)
      expect(host.tint.mock.calls).toEqual([
        [
          adjust(0.2),
        ],
      ])

      queue.scheduleTint(adjust(0.3))
      expect(frames).toHaveLength(2)
    })

    it('drops the tones that wait for a frame on cancel and on forget', () => {
      queue.scheduleTint(adjust(0.1))
      queue.cancelTint()
      expect(cancelAnimationFrame).toHaveBeenCalledWith(1)

      queue.scheduleTint(adjust(0.2))
      queue.forget()
      expect(cancelAnimationFrame).toHaveBeenCalledWith(2)
      frames[1]!(0)
      expect(host.tint).not.toHaveBeenCalled()

      queue.cancelTint()
      expect(cancelAnimationFrame).toHaveBeenCalledTimes(2)
    })
  })
})
