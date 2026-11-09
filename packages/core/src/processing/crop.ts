import type { NormalizedRect, PixelBuffer } from './types'

/** A rectangle in whole pixels. */
export interface PixelRect {
  height: number
  width: number
  x: number
  y: number
}

/** Turns a normalized rectangle into whole pixels of an image, always inside it and at least 1 pixel wide and high. */
export function cropBox(rect: NormalizedRect, width: number, height: number): PixelRect {
  const x = Math.min(width - 1, Math.max(0, Math.round(rect.x * width)))
  const y = Math.min(height - 1, Math.max(0, Math.round(rect.y * height)))
  return {
    x,
    y,
    width: Math.min(width - x, Math.max(1, Math.round(rect.width * width))),
    height: Math.min(height - y, Math.max(1, Math.round(rect.height * height))),
  }
}

/** Copies a rectangle out of an image. */
export function cropPixels(source: PixelBuffer, rect: NormalizedRect): PixelBuffer {
  const { x, y, width, height } = cropBox(rect, source.width, source.height)
  const data = new Uint8ClampedArray(width * height * 4)
  const rowLength = width * 4
  for (let row = 0; row < height; row++) {
    const start = ((y + row) * source.width + x) * 4
    data.set(source.data.subarray(start, start + rowLength), row * rowLength)
  }
  return { data, width, height }
}
