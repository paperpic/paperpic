import type { PixelBuffer } from './types'

/**
 * Converts an image to luminance, with one byte per pixel.
 *
 * Uses the Rec. 709 weights in fixed point (54, 183 and 19 out of 256), so it needs no floating point per pixel.
 */
export function toGrayscale({ data, width, height }: PixelBuffer): Uint8Array {
  const gray = new Uint8Array(width * height)
  for (let pixel = 0, offset = 0; pixel < gray.length; pixel++, offset += 4) {
    gray[pixel] = (54 * data[offset]! + 183 * data[offset + 1]! + 19 * data[offset + 2]!) >> 8
  }
  return gray
}

/** Turns an image gray, with the weights of `toGrayscale()`. It keeps four bytes per pixel and the transparency. */
export function grayPixels({ data, width, height }: PixelBuffer): PixelBuffer {
  const output = new Uint8ClampedArray(data.length)
  for (let offset = 0; offset < data.length; offset += 4) {
    const gray = (54 * data[offset]! + 183 * data[offset + 1]! + 19 * data[offset + 2]!) >> 8
    output[offset] = gray
    output[offset + 1] = gray
    output[offset + 2] = gray
    output[offset + 3] = data[offset + 3]!
  }
  return { data: output, width, height }
}
