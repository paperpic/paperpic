import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './steps'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderPreview } from './preview'

describe('renderPreview', () => {
  const drawImage = vi.fn()
  const runner = {
    run: vi.fn(async ({ data, width, height }: PixelBuffer, _steps: readonly PipelineStep[]) => ({ data, width: height, height: width })),
    prepare: vi.fn(),
  }

  beforeEach(() => {
    drawImage.mockClear()
    runner.run.mockClear()
    runner.prepare.mockClear()
    vi.stubGlobal('ImageData', class {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
      getImageData: (_x: number, _y: number, width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const image = (width: number, height: number) => ({
    element: {} as CanvasImageSource,
    width,
    height,
    release: () => {},
  })

  it('shows the image as it is without steps, with nothing for a ruler to change', async () => {
    const preview = await renderPreview(image(8, 8), [], null, runner)
    expect(runner.run).not.toHaveBeenCalled()
    expect(runner.prepare).not.toHaveBeenCalled()
    expect(preview.tint).toBeUndefined()
    expect(preview).toMatchObject({ width: 8, height: 8 })
  })

  it('works on a copy of about two million pixels, and reports the size at full resolution', async () => {
    const preview = await renderPreview(image(4000, 2000), [
      { type: 'rotate', rotation: 90 },
    ], null, runner)
    expect(drawImage.mock.calls[0]!.slice(7)).toEqual([2000, 1000])
    expect(runner.run.mock.calls[0]![1]).toEqual([
      { type: 'rotate', rotation: 90 },
    ])
    expect((preview.element as HTMLCanvasElement).width).toBe(1000)
    expect(preview).toMatchObject({ width: 2000, height: 4000 })
  })

  it('frees its canvas on release', async () => {
    const preview = await renderPreview(image(8, 8), [], null, runner)
    preview.release()
    expect((preview.element as HTMLCanvasElement).width).toBe(0)
  })
})
