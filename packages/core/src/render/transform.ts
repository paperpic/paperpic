import type { Size, View, ViewPoint } from '../state/view'

/** A 2D transform in the order canvas uses: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export type Transform = readonly [a: number, b: number, c: number, d: number, e: number, f: number]

const COSINES = { 0: 1, 90: 0, 180: -1, 270: 0 }
const SINES = { 0: 0, 90: 1, 180: 0, 270: -1 }

/** Computes the transform from image pixels to viewport pixels. Painting and pointer conversion both use it. */
export function computeTransform(view: View, image: Size, viewport: Size): Transform {
  const cosine = COSINES[view.rotation] * view.zoom
  const sine = SINES[view.rotation] * view.zoom
  const centerX = viewport.width / 2 + view.panX
  const centerY = viewport.height / 2 + view.panY
  return [
    cosine,
    sine,
    -sine,
    cosine,
    centerX - (cosine * image.width - sine * image.height) / 2,
    centerY - (sine * image.width + cosine * image.height) / 2,
  ]
}

/** Converts an image position to a viewport position. */
export function imageToViewport([a, b, c, d, e, f]: Transform, { x, y }: ViewPoint): ViewPoint {
  return { x: a * x + c * y + e, y: b * x + d * y + f }
}

/** Converts a viewport position to an image position. */
export function viewportToImage([a, b, c, d, e, f]: Transform, { x, y }: ViewPoint): ViewPoint {
  const determinant = a * d - b * c
  return {
    x: (d * (x - e) - c * (y - f)) / determinant,
    y: (a * (y - f) - b * (x - e)) / determinant,
  }
}
