import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './operations'
import { pixelsToCanvas, readPixels } from './pixels'
import { planRead } from './read-plan'

/** The format of the image that editing produces. */
export interface PaperPicOutput {
  /** From 0 to 1, for JPEG and WebP. */
  quality?: number
  /** `image/jpeg`, `image/png` or `image/webp`. By default, the format of the source. */
  type?: string
}

/** The image that editing produces. */
export interface ExportedImage {
  blob: Blob
  height: number
  /** The format of `blob`. A browser that cannot encode the requested one gives PNG. */
  type: string
  width: number
}

export interface ExportRequest {
  height: number
  image: CanvasImageSource
  /** The longest side of the result, in pixels. */
  maxOutputSize?: number
  output?: PaperPicOutput
  /** Runs the steps. It takes over the buffer it receives. */
  run: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PixelBuffer>
  source: string | Blob | undefined
  steps: readonly PipelineStep[]
  width: number
}

const ENCODABLE = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}
const DEFAULT_TYPE = 'image/png'
const DEFAULT_QUALITY = 0.92

/**
 * Chooses the output format: the one requested, or PNG for a cleaned document, whose sharp edges JPEG would damage,
 * or the one of the source, or PNG.
 */
export function resolveOutputType(source: string | Blob | undefined, output: PaperPicOutput = {}, cleaned = false): string {
  const sourceType = typeof source === 'string'
    ? EXTENSIONS[source.split(/[?#]/)[0]!.split('.').pop()!.toLowerCase()]
    : source?.type
  const type = output.type ?? (cleaned ? DEFAULT_TYPE : sourceType)
  return type && ENCODABLE.has(type)
    ? type
    : DEFAULT_TYPE
}

function encode(pixels: PixelBuffer, type: string, quality: number): Promise<Blob> {
  const canvas = pixelsToCanvas(pixels)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
      else {
        reject(new Error(`The browser could not save an image of ${pixels.width}×${pixels.height}. Set maxOutputSize to a smaller value.`))
      }
    }, type, quality)
  })
}

/** Lets the browser paint the message about the work, because reading a large image blocks the page for a moment. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    // A hidden page gets no frames, and the work must still go on
    const timer = setTimeout(resolve, 100)
    requestAnimationFrame(() => {
      clearTimeout(timer)
      setTimeout(resolve)
    })
  })
}

/** Reads the image at full resolution, applies the edits and encodes the result. */
export async function exportImage(request: ExportRequest): Promise<ExportedImage> {
  const plan = planRead(request, request.steps, { maxSide: request.maxOutputSize })
  await nextPaint()
  const pixels = readPixels(request.image, plan)
  const result = plan.steps.length > 0
    ? await request.run(pixels, plan.steps)
    : pixels
  const blob = await encode(result, resolveOutputType(request.source, request.output, request.steps.some(({ type }) => type === 'threshold')), request.output?.quality ?? DEFAULT_QUALITY)
  return {
    blob,
    width: result.width,
    height: result.height,
    type: blob.type,
  }
}
