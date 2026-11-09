/** An RGBA image in memory, with the same layout as `ImageData`. */
export interface PixelBuffer {
  /** Four bytes per pixel, row by row, starting at the top left corner. */
  data: Uint8ClampedArray
  height: number
  width: number
}

/** A position in image pixels. */
export interface Point {
  x: number
  y: number
}

/** A rectangle as fractions of the image, from 0 to 1, so it means the same at any resolution. */
export interface NormalizedRect {
  height: number
  width: number
  x: number
  y: number
}

/** Four corners, in order: top left, top right, bottom right, bottom left. */
export type Quad = readonly [Point, Point, Point, Point]
