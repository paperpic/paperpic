import type { PixelBuffer, Quad } from '../processing/types'
import type { LoadedImage } from './load-image'
import type { PipelineStep, ShapeStep } from './steps'
import { nextPaint } from './next-paint'
import { readPixels } from './pixels'
import { planRead } from './read-plan'

/**
 * The longest side of the copy that the search reads. The search makes a smaller one, and the photos that its
 * confidence was fitted to had about this size.
 */
const READ_SIDE = 800

/** The largest area of the photo to read. A crop after a perspective change leaves a result much smaller than that area. */
const READ_PIXELS = 2_000_000

/** Where the search runs. */
export interface DetectionRunner {
  detect: (source: PixelBuffer, steps: readonly PipelineStep[], wanted: () => boolean) => Promise<Quad | null>
}

/**
 * Looks for the document of an image, as `steps` leave it. The corners are fractions of that image, from the top left
 * one, clockwise. `null` if no shape is likely enough to be a document, or if the search fails, because the user can
 * place the corners without it. It is `null` too once `wanted` says that nobody can use the result, which spares the page
 * the heavy parts that are left.
 */
export async function findDocument(
  image: LoadedImage,
  steps: readonly ShapeStep[],
  runner: DetectionRunner,
  wanted: () => boolean,
): Promise<Quad | null> {
  const plan = planRead(image, steps, { maxSide: READ_SIDE, maxPixels: READ_PIXELS })
  await nextPaint()
  if (!wanted()) {
    return null
  }
  try {
    return await runner.detect(readPixels(image.element, plan), plan.steps, wanted)
  }
  catch {
    return null
  }
}
