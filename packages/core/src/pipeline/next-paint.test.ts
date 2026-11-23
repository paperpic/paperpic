import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextPaint } from './next-paint'

describe('nextPaint', () => {
  let frame: (() => void) | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      frame = callback
      return 1
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('waits for the frame, and for the browser to paint it', async () => {
    const painted = vi.fn()
    void nextPaint().then(painted)
    frame!()
    await Promise.resolve()
    expect(painted).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(painted).toHaveBeenCalledOnce()
  })

  it('goes on without a frame, as in a hidden page', async () => {
    const painted = vi.fn()
    void nextPaint().then(painted)
    await vi.advanceTimersByTimeAsync(99)
    expect(painted).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(painted).toHaveBeenCalledOnce()
  })
})
