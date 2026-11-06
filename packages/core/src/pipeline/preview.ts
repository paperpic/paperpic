import type { PixelBuffer } from '../processing/types'
import type { LoadedImage } from '../render/load-image'
import type { PipelineStep } from './operations'
import { pixelsToCanvas, readPixels } from './pixels'
import { planRead, resultSize } from './read-plan'

/** The size of the copy that previews work on. It keeps each step well under a second on a phone. */
const PREVIEW_PIXELS = 2_000_000

/**
 * Computes what the edits look like, on a small copy of the image.
 * The result reports the size at full resolution, so it paints at the same scale as the final image.
 */
export async function renderPreview(
  image: LoadedImage,
  steps: readonly PipelineStep[],
  run: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PixelBuffer>,
): Promise<LoadedImage> {
  const plan = planRead(image, steps, { maxPixels: PREVIEW_PIXELS })
  const pixels = readPixels(image.element, plan)
  const result = plan.steps.length > 0
    ? await run(pixels, plan.steps)
    : pixels
  const canvas = pixelsToCanvas(result)
  return {
    element: canvas,
    ...resultSize(image, steps),
    release: () => {
      canvas.width = 0
      canvas.height = 0
    },
  }
}
