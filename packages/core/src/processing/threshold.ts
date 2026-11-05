import type { PixelBuffer } from './types'
import { toGrayscale } from './grayscale'

export interface PrepareThresholdOptions {
  /** Side of the local window, as a fraction of the shorter image side. Larger than the image is fine. */
  windowRatio?: number
}

export interface ApplyThresholdOptions {
  /** From 0 to 1. Higher values darken more pixels, which recovers faint text. */
  sensitivity?: number
  /**
   * From 0 to 1. How much gray the output keeps around the limit, which makes letters easier to read.
   * Use 0 for strict black and white, which gives smaller files but breaks thin strokes.
   */
  softness?: number
}

export type ThresholdOptions = PrepareThresholdOptions & ApplyThresholdOptions

/** The expensive part of a threshold, which sensitivity and softness do not change, so a slider can reuse it. */
export interface PreparedThreshold {
  /** One byte per pixel: its brightness relative to the local mean, multiplied by `RATIO_SCALE`. */
  ratios: Uint8ClampedArray
  width: number
  height: number
}

const DEFAULT_WINDOW_RATIO = 1 / 16
const DEFAULT_SENSITIVITY = 0.5
const DEFAULT_SOFTNESS = 0.25
/** At the default sensitivity this gives the 15% from Bradley and Roth. */
const MAX_DROP = 0.3
/** How the gray range splits around the limit. Compared on real photos: letters need more range below it. */
const SHARE_BELOW_LIMIT = 0.6
const SHARE_ABOVE_LIMIT = 0.4
/** Keeps paper white, whose brightness is close to the local mean, at high sensitivity. */
const MAX_WHITE_POINT = 0.98
/** Stores ratios up to about 1.33, since anything brighter than the mean is white at every setting. */
const RATIO_SCALE = 192
const RATIO_CODES = 256

function assertInRange(name: string, value: number, condition: boolean): void {
  if (!condition) {
    throw new RangeError(`${name} is out of range, got ${value}`)
  }
}

/**
 * Compares each pixel with the mean of a window around it, as Bradley and Roth propose, so the result handles uneven light.
 *
 * @throws {RangeError} If an option is out of range.
 */
export function prepareThreshold(source: PixelBuffer, { windowRatio = DEFAULT_WINDOW_RATIO }: PrepareThresholdOptions = {}): PreparedThreshold {
  assertInRange('windowRatio', windowRatio, windowRatio > 0)

  const { width, height } = source
  const gray = toGrayscale(source)
  const ratios = new Uint8ClampedArray(width * height)
  const radius = Math.max(1, Math.round(Math.min(width, height) * windowRatio / 2))

  // Rolling sums per column use memory proportional to the width. The sums of an integral image
  // of a 37 MP photo would overflow 32 bits.
  const columnSums = new Uint32Array(width)

  const addRow = (row: number, sign: 1 | -1) => {
    const start = row * width
    for (let x = 0; x < width; x++) {
      columnSums[x]! += sign * gray[start + x]!
    }
  }

  for (let row = 0; row < Math.min(radius, height); row++) {
    addRow(row, 1)
  }

  for (let y = 0; y < height; y++) {
    if (y + radius < height) {
      addRow(y + radius, 1)
    }
    if (y - radius - 1 >= 0) {
      addRow(y - radius - 1, -1)
    }
    const rows = Math.min(height - 1, y + radius) - Math.max(0, y - radius) + 1

    let sum = 0
    for (let x = 0; x <= Math.min(radius, width - 1); x++) {
      sum += columnSums[x]!
    }

    for (let x = 0, pixel = y * width; x < width; x++, pixel++) {
      const count = rows * (Math.min(width - 1, x + radius) - Math.max(0, x - radius) + 1)
      // The array clamps to its range. A black area has a mean of 0, and its NaN becomes 0.
      ratios[pixel] = gray[pixel]! * count / sum * RATIO_SCALE

      if (x + radius + 1 < width) {
        sum += columnSums[x + radius + 1]!
      }
      if (x - radius >= 0) {
        sum -= columnSums[x - radius]!
      }
    }
  }

  return { ratios, width, height }
}

/**
 * Produces the final image from a prepared threshold. It is fast enough to run on every change of a slider.
 * Pixels well below the local mean turn black, pixels close to it turn white, and the ones in between stay gray according to `softness`.
 *
 * @throws {RangeError} If an option is out of range.
 */
export function applyThreshold({ ratios, width, height }: PreparedThreshold, options: ApplyThresholdOptions = {}): PixelBuffer {
  const { sensitivity = DEFAULT_SENSITIVITY, softness = DEFAULT_SOFTNESS } = options
  assertInRange('sensitivity', sensitivity, sensitivity >= 0 && sensitivity <= 1)
  assertInRange('softness', softness, softness >= 0 && softness <= 1)

  const limit = 1 - MAX_DROP * (1 - sensitivity)
  const blackPoint = limit - softness * SHARE_BELOW_LIMIT
  const whitePoint = Math.min(limit + softness * SHARE_ABOVE_LIMIT, Math.max(MAX_WHITE_POINT, limit))

  // The red, green and blue bytes are equal, so byte order only decides where the opaque alpha goes:
  // the top byte, on the little-endian platforms that browsers run on.
  const colors = new Uint32Array(RATIO_CODES)
  for (let code = 0; code < RATIO_CODES; code++) {
    const ratio = code / RATIO_SCALE
    const level = softness === 0
      ? ratio < limit
        ? 0
        : 255
      : Math.round(255 * Math.min(1, Math.max(0, (ratio - blackPoint) / (whitePoint - blackPoint))))
    colors[code] = (0xFF000000 | (level << 16) | (level << 8) | level) >>> 0
  }

  const pixels = new Uint32Array(ratios.length)
  for (let pixel = 0; pixel < ratios.length; pixel++) {
    pixels[pixel] = colors[ratios[pixel]!]!
  }

  return {
    data: new Uint8ClampedArray(pixels.buffer),
    width,
    height,
  }
}

/**
 * Cleans a document image in one step. To react to a slider, call `prepareThreshold` once and `applyThreshold` on each change.
 *
 * @throws {RangeError} If an option is out of range.
 */
export function adaptiveThreshold(source: PixelBuffer, options: ThresholdOptions = {}): PixelBuffer {
  return applyThreshold(prepareThreshold(source, options), options)
}
