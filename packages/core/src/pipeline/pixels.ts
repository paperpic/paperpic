import type { PixelBuffer } from '../processing/types'
import type { ReadPlan } from './read-plan'

/**
 * Reads the part of an image that a plan asks for.
 *
 * @throws {Error} If the browser cannot hold that many pixels, or the image comes from another origin.
 */
export function readPixels(image: CanvasImageSource, { region, width, height }: ReadPlan): PixelBuffer {
  const tooLarge = `The browser could not read an image of ${width}×${height}. Set maxOutputSize to a smaller value.`
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  try {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) {
      throw new Error(tooLarge)
    }
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, width, height)
    try {
      return { data: context.getImageData(0, 0, width, height).data, width, height }
    }
    catch (cause) {
      // Only a canvas that holds an image from another origin fails this way. Anything else is a matter of size
      throw new Error((cause as Error).name === 'SecurityError'
        ? 'The browser does not allow reading this image, because it comes from another origin. Serve it from the same origin, or pass it as a Blob or a File.'
        : tooLarge, { cause })
    }
  }
  finally {
    releaseCanvas(canvas)
  }
}

/** Frees the memory of a canvas at once. Some browsers, such as Safari on iOS, keep it for a while otherwise, and limit the total. */
export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0
  canvas.height = 0
}

/** Puts pixels on a new canvas. */
export function pixelsToCanvas({ data, width, height }: PixelBuffer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  return canvas
}
