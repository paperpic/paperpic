import type { PixelBuffer } from '../processing/types'
import type { ReadPlan } from './read-plan'

/**
 * Reads the part of an image that a plan asks for.
 *
 * @throws {Error} If the browser cannot hold that many pixels, or the image comes from another origin.
 */
export function readPixels(image: CanvasImageSource, { region, width, height }: ReadPlan): PixelBuffer {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    throw new Error(`The browser could not read an image of ${width}×${height}. Set maxOutputSize to a smaller value.`)
  }
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, width, height)
  try {
    return { data: context.getImageData(0, 0, width, height).data, width, height }
  }
  catch (cause) {
    throw new Error('The browser does not allow reading this image, because it comes from another origin. Serve it from the same origin, or pass it as a Blob or a File.', { cause })
  }
}

/** Puts pixels on a new canvas. */
export function pixelsToCanvas({ data, width, height }: PixelBuffer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, width, height), 0, 0)
  return canvas
}
