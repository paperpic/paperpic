import type { ApplyThresholdOptions, PreparedThreshold } from '../processing/threshold'
import type { PixelBuffer } from '../processing/types'
import type { LoadedImage } from '../render/load-image'
import type { PipelineStep } from './operations'
import { applyThreshold } from '../processing/threshold'
import { pixelsToCanvas, readPixels } from './pixels'
import { planRead, resultSize } from './read-plan'

/** The size of the copy that previews work on. It keeps each step well under a second on a phone. */
const PREVIEW_PIXELS = 2_000_000

/** What the edits look like. */
export interface Preview extends LoadedImage {
  /** Repaints with another threshold setting, fast enough for a slider. Only a preview with a threshold has it. */
  tint?: (options: ApplyThresholdOptions) => void
}

/** Where the expensive part of a preview runs. */
export interface PreviewRunner {
  run: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PixelBuffer>
  prepare: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PreparedThreshold>
}

/**
 * Computes what the edits look like, on a small copy of the image.
 * The result reports the size at full resolution, so it paints at the same scale as the final image.
 * `steps` change the shape of the image, and `threshold` is its setting, or `null` if it is off.
 */
export async function renderPreview(
  image: LoadedImage,
  steps: readonly PipelineStep[],
  threshold: ApplyThresholdOptions | null,
  runner: PreviewRunner,
): Promise<Preview> {
  const plan = planRead(image, steps, { maxPixels: PREVIEW_PIXELS })
  const pixels = readPixels(image.element, plan)
  let canvas: HTMLCanvasElement
  let tint: Preview['tint']

  if (threshold) {
    const prepared = await runner.prepare(pixels, plan.steps)
    canvas = pixelsToCanvas(applyThreshold(prepared, threshold))
    tint = (options) => {
      const { data, width, height } = applyThreshold(prepared, options)
      canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
    }
  }
  else {
    canvas = pixelsToCanvas(plan.steps.length > 0
      ? await runner.run(pixels, plan.steps)
      : pixels)
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
