import type { PixelBuffer } from './types'

/** Mirrors an image left to right, moving whole pixels, so it loses no quality. */
export function flipPixels({ data, width, height }: PixelBuffer): PixelBuffer {
  const source = new Uint32Array(data.buffer, data.byteOffset, width * height)
  const output = new Uint32Array(width * height)

  for (let row = 0; row < width * height; row += width) {
    const last = row + width - 1
    for (let x = 0; x < width; x++) {
      output[row + x] = source[last - x]!
    }
  }

  return {
    data: new Uint8ClampedArray(output.buffer),
    width,
    height,
  }
}
