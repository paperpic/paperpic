import type { PreparedThreshold } from '../processing/threshold'
import type { PixelBuffer } from '../processing/types'
import type { LoadedImage } from './load-image'
import type { PipelineStep, RedactStep, ShapeStep, ToneStep } from './steps'
import { redactPixels } from '../processing/redact'
import { applyThreshold } from '../processing/threshold'
import { pixelsToCanvas, readPixels, releaseCanvas } from './pixels'
import { planRead, resultSize } from './read-plan'
import { adjustTones } from './steps'

/** The size of the copy that previews work on. It keeps each step well under a second on a phone. */
const PREVIEW_PIXELS = 2_000_000

/** What the edits look like. */
export interface Preview extends LoadedImage {
  /**
   * Repaints with another setting of its tones, fast enough for a ruler. Only a preview with tones has it,
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
 * `steps` change the shape of the image, `tone` changes its tones afterwards, or is `null` if nothing does, and
 * `redaction` covers areas of the result, or is `null` if nothing does.
 */
export async function renderPreview(
  image: LoadedImage,
  steps: readonly ShapeStep[],
  tone: ToneStep | null,
  redaction: RedactStep | null,
  runner: PreviewRunner,
): Promise<Preview> {
  const plan = planRead(image, steps, { maxPixels: PREVIEW_PIXELS })
  const pixels = readPixels(image.element, plan)
  let canvas: HTMLCanvasElement
  let tint: Preview['tint']

  // The areas of Redact go over the tones, so a ruler never shows what they cover. They fill in place, and a buffer
  // that a ruler keeps, such as the shaped pixels, only gets areas that every repaint covers again
  const cover = (shown: PixelBuffer) => redaction
    ? redactPixels(shown, redaction.areas)
    : shown
  const show = (shown: PixelBuffer) => pixelsToCanvas(cover(shown))
  const paint = (shown: PixelBuffer) => {
    const { data, width, height } = cover(shown)
    canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  }

  if (tone?.type === 'threshold') {
    const prepared = await runner.prepare(pixels, plan.steps)
    canvas = show(applyThreshold(prepared, tone))
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
      // The shaped pixels stay, so a ruler only runs the table of tones on them
      canvas = show(adjustTones(shaped, tone))
      tint = (next) => {
        if (next.type === 'adjust') {
          paint(adjustTones(shaped, next))
        }
      }
    }
    else {
      canvas = show(shaped)
    }
  }

  return {
    element: canvas,
    ...resultSize(image, steps),
    tint,
    release: () => releaseCanvas(canvas),
  }
}
