import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './operations'

/** The format of the image that editing produces. */
export interface PaperPicOutput {
  /** `image/jpeg`, `image/png` or `image/webp`. By default, the format of the source. */
  type?: string
  /** From 0 to 1, for JPEG and WebP. */
  quality?: number
}

/** The image that editing produces. */
export interface ExportedImage {
  blob: Blob
  width: number
  height: number
  /** The format of `blob`. A browser that cannot encode the requested one gives PNG. */
  type: string
}

export interface ExportRequest {
  image: CanvasImageSource
  width: number
  height: number
  steps: readonly PipelineStep[]
  /** Runs the steps. It takes over the buffer it receives. */
  run: (source: PixelBuffer, steps: readonly PipelineStep[]) => Promise<PixelBuffer>
  source: string | Blob | undefined
  output?: PaperPicOutput
  /** The longest side of the result, in pixels. */
  maxOutputSize?: number
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

/** Chooses the output format: the one requested, or the one of the source, or PNG. */
export function resolveOutputType(source: string | Blob | undefined, output: PaperPicOutput = {}): string {
  const type = output.type ?? (
    typeof source === 'string'
      ? EXTENSIONS[source.split(/[?#]/)[0]!.split('.').pop()!.toLowerCase()]
      : source?.type
  )
  return type && ENCODABLE.has(type)
    ? type
    : DEFAULT_TYPE
}

/** The size to read the image at, so the longest side does not exceed `maxOutputSize`. */
export function outputSize(width: number, height: number, maxOutputSize = Number.POSITIVE_INFINITY): { width: number, height: number } {
  const scale = Math.min(1, maxOutputSize / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function readPixels(image: CanvasImageSource, width: number, height: number): PixelBuffer {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    throw new Error(`The browser could not read an image of ${width}×${height}. Set maxOutputSize to a smaller value.`)
  }
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)
  try {
    return { data: context.getImageData(0, 0, width, height).data, width, height }
  }
  catch (cause) {
    throw new Error('The browser does not allow reading this image, because it comes from another origin. Serve it from the same origin, or pass it as a Blob or a File.', { cause })
  }
}

function encode({ data, width, height }: PixelBuffer, type: string, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
      else {
        reject(new Error(`The browser could not save an image of ${width}×${height}. Set maxOutputSize to a smaller value.`))
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
  const { width, height } = outputSize(request.width, request.height, request.maxOutputSize)
  await nextPaint()
  const pixels = readPixels(request.image, width, height)
  const result = await request.run(pixels, request.steps)
  const blob = await encode(result, resolveOutputType(request.source, request.output), request.output?.quality ?? DEFAULT_QUALITY)
  return {
    blob,
    width: result.width,
    height: result.height,
    type: blob.type,
  }
}
