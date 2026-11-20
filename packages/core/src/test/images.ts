import type { LoadedImage } from '../pipeline/load-image'
import type { PixelBuffer } from '../processing/types'

/** An image of one color, opaque gray by default. */
export function filled(width: number, height: number, [red, green, blue, alpha] = [128, 128, 128, 255]): PixelBuffer {
  return {
    data: new Uint8ClampedArray(Array.from({ length: width * height }, () => [red, green, blue, alpha]).flat()),
    width,
    height,
  }
}

/** Draws an image as text, one row per line and one character per pixel: `#` black, `.` white, `-` anything else. */
export function picture({ data, width, height }: PixelBuffer): string[] {
  return Array.from({ length: height }, (_, row) => Array.from({ length: width }, (_, column) => {
    const value = data[(row * width + column) * 4]
    return value === 0
      ? '#'
      : value === 255
        ? '.'
        : '-'
  }).join(''))
}

/** A loaded image of that size, with no pixels behind it, for code that reads them through a stubbed canvas. */
export function loadedImage(width: number, height: number): LoadedImage {
  return {
    element: {} as CanvasImageSource,
    width,
    height,
    release: () => {},
  }
}
