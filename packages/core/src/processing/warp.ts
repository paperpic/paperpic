import type { PixelBuffer, Quad } from './types'
import { solveHomography } from './homography'

/**
 * Straightens the area inside `quad` into a rectangle of the given size, with bilinear interpolation.
 *
 * @throws {RangeError} If the size is not positive, or the corners are degenerate.
 */
export function warpPerspective(source: PixelBuffer, quad: Quad, width: number, height: number): PixelBuffer {
  if (!(width > 0 && height > 0)) {
    throw new RangeError(`The output size must be positive, got ${width}×${height}`)
  }

  const rectangle: Quad = [
    { x: 0, y: 0 },
    { x: width - 1, y: 0 },
    { x: width - 1, y: height - 1 },
    { x: 0, y: height - 1 },
  ]
  // Maps each output pixel back to the source, so the output has no holes
  const [a, b, c, d, e, f, g, h, i] = solveHomography(rectangle, quad)

  const { data: input, width: sourceWidth, height: sourceHeight } = source
  const output = new Uint8ClampedArray(width * height * 4)
  const lastColumn = sourceWidth - 1
  const lastRow = sourceHeight - 1

  let offset = 0
  for (let y = 0; y < height; y++) {
    let numeratorX = b * y + c
    let numeratorY = e * y + f
    let denominator = h * y + i

    for (let x = 0; x < width; x++) {
      const sourceX = Math.min(lastColumn, Math.max(0, numeratorX / denominator))
      const sourceY = Math.min(lastRow, Math.max(0, numeratorY / denominator))
      const left = sourceX | 0
      const top = sourceY | 0
      const fractionX = sourceX - left
      const fractionY = sourceY - top
      const topOffset = (top * sourceWidth + left) * 4
      const rightStep = left < lastColumn
        ? 4
        : 0
      const bottomStep = top < lastRow
        ? sourceWidth * 4
        : 0

      for (let channel = 0; channel < 4; channel++) {
        const topLeft = input[topOffset + channel]!
        const topRight = input[topOffset + rightStep + channel]!
        const bottomLeft = input[topOffset + bottomStep + channel]!
        const bottomRight = input[topOffset + bottomStep + rightStep + channel]!
        const upper = topLeft + (topRight - topLeft) * fractionX
        const lower = bottomLeft + (bottomRight - bottomLeft) * fractionX
        output[offset++] = upper + (lower - upper) * fractionY
      }

      numeratorX += a
      numeratorY += d
      denominator += g
    }
  }

  return { data: output, width, height }
}
