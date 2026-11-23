import type { PixelBuffer, Size } from '../types'

/** A small copy of an image for detection, with one plane for each of its red, green and blue, row by row. */
export interface Planes extends Size {
  channels: readonly Float32Array[]
}

/** How much each neighbour weighs in the blur, next to the 6 of the pixel itself. Together they make 16. */
const NEAR_WEIGHT = 4
const FAR_WEIGHT = 1
const CENTER_WEIGHT = 6
const TOTAL_WEIGHT = 16

/** Copies an image so that its longest side is at most `side`, as the mean of the pixels behind each one of the copy. */
export function shrink({ data, width, height }: PixelBuffer, side: number): Planes {
  const scale = Math.min(1, side / Math.max(width, height))
  const columns = Math.max(1, Math.round(width * scale))
  const rows = Math.max(1, Math.round(height * scale))
  const red = new Float32Array(columns * rows)
  const green = new Float32Array(columns * rows)
  const blue = new Float32Array(columns * rows)

  for (let row = 0, pixel = 0; row < rows; row++) {
    const top = Math.floor(row * height / rows)
    const bottom = Math.max(top + 1, Math.floor((row + 1) * height / rows))
    for (let column = 0; column < columns; column++, pixel++) {
      const left = Math.floor(column * width / columns)
      const right = Math.max(left + 1, Math.floor((column + 1) * width / columns))
      let redSum = 0
      let greenSum = 0
      let blueSum = 0
      for (let y = top; y < bottom; y++) {
        const end = (y * width + right) * 4
        for (let offset = (y * width + left) * 4; offset < end; offset += 4) {
          redSum += data[offset]!
          greenSum += data[offset + 1]!
          blueSum += data[offset + 2]!
        }
      }
      const count = (bottom - top) * (right - left)
      red[pixel] = redSum / count
      green[pixel] = greenSum / count
      blue[pixel] = blueSum / count
    }
  }

  return {
    channels: [red, green, blue],
    width: columns,
    height: rows,
  }
}

/** Runs a function on each channel. */
export function mapChannels(planes: Planes, change: (channel: Float32Array, size: Size) => Float32Array): Planes {
  return {
    ...planes,
    channels: planes.channels.map(channel => change(channel, planes)),
  }
}

/**
 * Takes for each pixel the brightest one at most `radius` away along the rows, or the columns. It compares each pair of
 * pixels once, which is several times faster than looking at the whole window of each pixel.
 */
function dilateAlong(source: Float32Array, { width, height }: Size, radius: number, axis: 'row' | 'column'): Float32Array {
  const output = source.slice()
  for (let distance = 1; distance <= radius; distance++) {
    const step = axis === 'row'
      ? distance
      : distance * width
    const columns = axis === 'row'
      ? width - distance
      : width
    for (let start = 0; start + step < width * height; start += width) {
      for (let pixel = start; pixel < start + columns; pixel++) {
        const first = source[pixel]!
        const second = source[pixel + step]!
        if (second > output[pixel]!) {
          output[pixel] = second
        }
        if (first > output[pixel + step]!) {
          output[pixel + step] = first
        }
      }
    }
  }
  return output
}

function dilate(source: Float32Array, size: Size, radius: number): Float32Array {
  return dilateAlong(dilateAlong(source, size, radius, 'row'), size, radius, 'column')
}

function negate(source: Float32Array): Float32Array {
  const output = new Float32Array(source.length)
  for (let pixel = 0; pixel < source.length; pixel++) {
    output[pixel] = -source[pixel]!
  }
  return output
}

/**
 * Removes the dark details narrower than twice `radius`, such as text, and keeps the shape of the rest. Growing the
 * bright areas covers them, and shrinking the areas back does not bring them back.
 */
export function closing(source: Float32Array, size: Size, radius: number): Float32Array {
  const grown = dilate(source, size, radius)
  // Shrinking the bright areas is growing the dark ones
  return negate(dilate(negate(grown), size, radius))
}

/** Blurs along the rows, with a `step` of 1 and the width as `lineStep`, or along the columns, the other way around. */
function blurAlong(source: Float32Array, length: number, step: number, lines: number, lineStep: number): Float32Array {
  const output = new Float32Array(source.length)
  for (let position = 0; position < length; position++) {
    // The border stands for the pixels past it
    const before = Math.min(position, 1) * step
    const farBefore = Math.min(position, 2) * step
    const after = Math.min(length - 1 - position, 1) * step
    const farAfter = Math.min(length - 1 - position, 2) * step
    for (let line = 0, pixel = position * step; line < lines; line++, pixel += lineStep) {
      output[pixel] = (CENTER_WEIGHT * source[pixel]!
        + NEAR_WEIGHT * (source[pixel - before]! + source[pixel + after]!)
        + FAR_WEIGHT * (source[pixel - farBefore]! + source[pixel + farAfter]!)) / TOTAL_WEIGHT
    }
  }
  return output
}

/** Smooths the noise, so it does not look like edges. */
export function blur(source: Float32Array, { width, height }: Size): Float32Array {
  return blurAlong(blurAlong(source, width, 1, height, width), height, width, width, 1)
}
