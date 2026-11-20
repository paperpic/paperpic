import type { PixelBuffer } from '../processing/types'
import type { CanvasMocks } from '../test/canvas'
import type { PipelineStep } from './steps'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubCanvas } from '../test/canvas'
import { loadedImage } from '../test/images'
import { renderPreview } from './preview'

describe('renderPreview', () => {
  let drawImage: CanvasMocks['drawImage']
  const runner = {
    run: vi.fn(async ({ data, width, height }: PixelBuffer, _steps: readonly PipelineStep[]) => ({ data, width: height, height: width })),
    prepare: vi.fn(),
  }

  beforeEach(() => {
    runner.run.mockClear()
    runner.prepare.mockClear()
    drawImage = stubCanvas().drawImage
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows the image as it is without steps, with nothing for a ruler to change', async () => {
    const preview = await renderPreview(loadedImage(8, 8), [], null, null, runner)
    expect(runner.run).not.toHaveBeenCalled()
    expect(runner.prepare).not.toHaveBeenCalled()
    expect(preview.tint).toBeUndefined()
    expect(preview).toMatchObject({ width: 8, height: 8 })
  })

  it('works on a copy of about two million pixels, and reports the size at full resolution', async () => {
    const preview = await renderPreview(loadedImage(4000, 2000), [
      { type: 'rotate', rotation: 90 },
    ], null, null, runner)
    expect(drawImage.mock.calls[0]!.slice(7)).toEqual([2000, 1000])
    expect(runner.run.mock.calls[0]![1]).toEqual([
      { type: 'rotate', rotation: 90 },
    ])
    expect((preview.element as HTMLCanvasElement).width).toBe(1000)
    expect(preview).toMatchObject({ width: 2000, height: 4000 })
  })

  it('frees its canvas on release', async () => {
    const preview = await renderPreview(loadedImage(8, 8), [], null, null, runner)
    preview.release()
    expect((preview.element as HTMLCanvasElement).width).toBe(0)
  })
})
