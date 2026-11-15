import type { PaperPicOptions } from './paperpic'
import { ENCODABLE } from './pipeline/export'

function assertInRange(name: string, value: number | undefined, valid: (value: number) => boolean, range: string): void {
  // `undefined` brings an option back to its default, which is always valid
  if (value !== undefined && value !== null && !valid(value)) {
    throw new RangeError(`${name} must be ${range}, got ${value}`)
  }
}

/**
 * Checks the options that have a range, so that a wrong value fails where the app sets it, with a message that names
 * the option, and not later inside an edit.
 *
 * @throws {RangeError} If an option is out of its range.
 */
export function validateOptions({ aspectRatio, maxOutputSize, output, softness }: PaperPicOptions): void {
  assertInRange('softness', softness, value => value >= 0 && value <= 1, 'between 0 and 1')
  assertInRange('aspectRatio', aspectRatio, value => value > 0 && Number.isFinite(value), 'width divided by height, such as 210 / 297 for A4')
  assertInRange('maxOutputSize', maxOutputSize, value => value > 0, 'a positive number of pixels')
  assertInRange('output.quality', output?.quality, value => value >= 0 && value <= 1, 'between 0 and 1')
  const type = output?.type
  if (type !== undefined && type !== null && !ENCODABLE.has(type)) {
    throw new RangeError(`output.type must be ${[...ENCODABLE].map(name => `'${name}'`).join(', ')}, got '${type}'`)
  }
}
