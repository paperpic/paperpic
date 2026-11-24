import type { PixelBuffer, Quad, Size } from '../processing/types'
import { projectPoint, rectangleCorners, solveHomography } from '../processing/homography'

type Color = readonly [number, number, number]

const INK: Color = [44, 44, 52]

/** An image whose pixels `color` decides. */
export function painted({ width, height }: Size, color: (x: number, y: number) => Color): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set([
        ...color(x, y),
        255,
      ], (y * width + x) * 4)
    }
  }
  return { data, width, height }
}

/** A photo of a sheet with lines of text, on a table. Its corners are in pixels, and the photo can cut them off. */
export function sheetPhoto(size: Size, corners: Quad, { paper = [236, 234, 228], table = [84, 66, 52], text = true }: {
  paper?: Color
  table?: Color
  text?: boolean
} = {}): PixelBuffer {
  const toSheet = solveHomography(corners, rectangleCorners(0, 0, 1, 1))
  return painted(size, (x, y) => {
    const { x: across, y: down } = projectPoint(toSheet, { x: x + 0.5, y: y + 0.5 })
    if (across < 0 || across > 1 || down < 0 || down > 1) {
      return table
    }
    const inMargins = across > 0.1 && across < 0.9 && down > 0.1 && down < 0.9
    return text && inMargins && (down * 24) % 1 < 0.4 && (across * 30) % 1 < 0.6
      ? INK
      : paper
  })
}

/** A photo with a hard shadow, which leaves `light`, from 0 to 1, where `inShadow` says. */
export function shaded({ data, width, height }: PixelBuffer, light: number, inShadow: (x: number, y: number) => boolean): PixelBuffer {
  return painted({ width, height }, (x, y) => {
    const offset = (y * width + x) * 4
    const share = inShadow(x, y)
      ? light
      : 1
    return [data[offset]! * share, data[offset + 1]! * share, data[offset + 2]! * share]
  })
}

/** A photo with no shape in it: each pixel has a tone of its own, always the same ones. */
export function noisePhoto(size: Size): PixelBuffer {
  let state = 1
  return painted(size, () => {
    // The generator of Park and Miller
    state = (state * 16807) % 2147483647
    const level = state % 256
    return [level, level, level]
  })
}
