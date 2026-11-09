import type { PreparedThreshold } from '../processing/threshold'
import type { PixelBuffer } from '../processing/types'
import type { LoadedImage } from '../render/load-image'
import type { PipelineStep, ToneStep } from './operations'
import { adjustPixels } from '../processing/adjust'
import { applyThreshold } from '../processing/threshold'
import { pixelsToCanvas, readPixels } from './pixels'
import { planRead, resultSize } from './read-plan'

/** The size of the copy that previews work on. It keeps each step well under a second on a phone. */
const PREVIEW_PIXELS = 2_000_000

/** What the edits look like. */
export interface Preview extends LoadedImage {
  /**
   * Repaints with another setting of its tones, fast enough for a slider. Only a preview with tones has it,
   * and it ignores a step of another kind than the one it was computed with.
   */
  tint?: (tone: ToneStep) => void
}

/** Where the expensive part of a preview runs. */
export interface PreviewRunner {
  prepare: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PreparedThreshold>
  run: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PixelBuffer>
}

/**
 * Computes what the edits look like, on a small copy of the image.
 * The result reports the size at full resolution, so it paints at the same scale as the final image.
 * `steps` change the shape of the image, and `tone` changes its tones afterwards, or is `null` if nothing does.
 */
export async function renderPreview(
  image: LoadedImage,
  steps: readonly PipelineStep[],
  tone: ToneStep | null,
  runner: PreviewRunner,
): Promise<Preview> {
  const plan = planRead(image, steps, { maxPixels: PREVIEW_PIXELS })
  const pixels = readPixels(image.element, plan)
  let canvas: HTMLCanvasElement
  let tint: Preview['tint']

  const paint = ({ data, width, height }: PixelBuffer) => {
    canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  }

  if (tone?.type === 'threshold') {
    const prepared = await runner.prepare(pixels, plan.steps)
    canvas = pixelsToCanvas(applyThreshold(prepared, tone))
    tint = (next) => {
      if (next.type === 'threshold') {
        paint(applyThreshold(prepared, next))
      }
    }
  }
  else {
    const shaped = plan.steps.length > 0
      ? await runner.run(pixels, plan.steps)
      : pixels
    if (tone?.type === 'adjust') {
      // The shaped pixels stay, so a slider only runs the table of tones on them
      canvas = pixelsToCanvas(adjustPixels(shaped, tone))
      tint = (next) => {
        if (next.type === 'adjust') {
          paint(adjustPixels(shaped, next))
        }
      }
    }
    else {
      canvas = pixelsToCanvas(shaped)
    }
  }

  return {
    element: canvas,
    ...resultSize(image, steps),
    tint,
    release: () => {
      canvas.width = 0
      canvas.height = 0
    },
  }
}
