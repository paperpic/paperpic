import type { PixelBuffer } from './types'

export interface AdjustOptions {
  /** From -1 to 1, where 0 leaves the image as it is. It shifts every tone, so 1 turns the middle grays white. */
  brightness?: number
  /** From -1 to 1, where 0 leaves the image as it is. It spreads the tones away from middle gray, up to four times at 1. */
  contrast?: number
}

/** The shift of the tones at full brightness, as a fraction of the whole range. */
const MAX_SHIFT = 0.5
/** The contrast factor is `2 ** (contrast * CONTRAST_EXPONENT)`, from a quarter to four times. */
const CONTRAST_EXPONENT = 2
const LEVELS = 256

function assertInRange(name: string, value: number): void {
  if (!(value >= -1 && value <= 1)) {
    throw new RangeError(`${name} must be between -1 and 1, got ${value}`)
  }
}

/**
 * Changes the brightness and contrast of an image. Each channel goes through the same table of 256 values,
 * so it is fast enough to run on every change of a slider. Transparency does not change.
 *
 * @throws {RangeError} If an option is out of range.
 */
export function adjustPixels({ data, width, height }: PixelBuffer, { brightness = 0, contrast = 0 }: AdjustOptions = {}): PixelBuffer {
  assertInRange('brightness', brightness)
  assertInRange('contrast', contrast)

  const factor = 2 ** (contrast * CONTRAST_EXPONENT)
  const shift = brightness * MAX_SHIFT
  // The array clamps and rounds each level to a byte
  const levels = new Uint8ClampedArray(LEVELS)
  for (let level = 0; level < LEVELS; level++) {
    levels[level] = ((level / (LEVELS - 1) - 0.5) * factor + 0.5 + shift) * (LEVELS - 1)
  }

  const output = new Uint8ClampedArray(data.length)
  for (let offset = 0; offset < data.length; offset += 4) {
    output[offset] = levels[data[offset]!]!
    output[offset + 1] = levels[data[offset + 1]!]!
    output[offset + 2] = levels[data[offset + 2]!]!
    output[offset + 3] = data[offset + 3]!
  }

  return { data: output, width, height }
}
