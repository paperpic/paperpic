import type { PixelBuffer } from './types'

/** A clockwise rotation that changes the image. */
export type QuarterTurn = 90 | 180 | 270

/** Turns an image clockwise, moving whole pixels, so it loses no quality. */
export function rotatePixels({ data, width, height }: PixelBuffer, rotation: QuarterTurn): PixelBuffer {
  const source = new Uint32Array(data.buffer, data.byteOffset, width * height)
  const output = new Uint32Array(width * height)
  const sideways = rotation !== 180
  const outputWidth = sideways ? height : width

  for (let y = 0, index = 0; y < height; y++) {
    for (let x = 0; x < width; x++, index++) {
      const target = rotation === 90
        ? x * outputWidth + (height - 1 - y)
        : rotation === 180
          ? (height - 1 - y) * outputWidth + (width - 1 - x)
          : (width - 1 - x) * outputWidth + y
      output[target] = source[index]!
    }
  }

  return {
    data: new Uint8ClampedArray(output.buffer),
    width: outputWidth,
    height: sideways ? width : height,
  }
}
