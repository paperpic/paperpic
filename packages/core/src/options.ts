import type { PaperPicOutput } from './pipeline/export'
import type { PaperPicSource } from './pipeline/load-image'
import type { ToolId } from './tools/types'
import type { PaperPicIcons } from './ui/icons'
import type { PaperPicLabels } from './ui/labels'
import { ENCODABLE } from './pipeline/export'
import { ALL_TOOL_IDS } from './tools'

/**
 * What the constructor and `setOptions()` take.
 *
 * @see https://paperpic.dev/reference/options
 */
export interface PaperPicOptions {
  /** Describes the image for screen readers. Without it, they skip the image, as they skip an `<img>` with an empty `alt`. */
  alt?: string
  /** The real proportions of the document, as width divided by height, such as `210 / 297` for A4. Without it, straightening estimates them. */
  aspectRatio?: number
  /** Whether the toolbar has a button that saves the image on display, which is the result of the last Apply or else the source. */
  download?: boolean
  /**
   * Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image.
   * That rotation only changes the display.
   */
  editable?: boolean
  /** The name of the saved file. By default, the name of the source. The extension follows the format of the image. */
  filename?: string
  /**
   * Replaces any of the icons with the markup of one element, such as an `<svg>`. The markup is inserted as HTML, so
   * pass only markup you trust. An empty string leaves the buttons of that icon without one.
   */
  icons?: Partial<PaperPicIcons>
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
  /** The longest side of the edited image, in pixels. By default, it keeps the full resolution. */
  maxOutputSize?: number
  /** The format of the edited image. By default, the format of the source. */
  output?: PaperPicOutput
  /**
   * From 0 to 1. How much gray cleaning up a document keeps, which makes letters easier to read. By default, 0.25.
   * Use 0 for strict black and white, which gives smaller files but breaks thin strokes.
   */
  softness?: number
  /** The image to show. Passing the same value again does not reload it: use `reload()`. */
  src?: PaperPicSource
  /** Whether to show the built-in toolbar and edit bar. Without them, build your own with the public methods. */
  toolbar?: boolean
  /** Which tools the edit bar offers. By default, all of them. It only chooses the buttons: the methods work with every tool. */
  tools?: readonly ToolId[]
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
}

type OptionalOption = 'icons' | 'labels' | 'output' | 'maxOutputSize' | 'aspectRatio' | 'softness' | 'filename'

/** The options in use: each one with its value, or its default. `src` is not one, because the viewer tracks it apart. */
export type ResolvedOptions = Required<Omit<PaperPicOptions, 'src' | OptionalOption>> & Pick<PaperPicOptions, OptionalOption>
export type OptionName = keyof ResolvedOptions

export const DEFAULT_OPTIONS: ResolvedOptions = {
  alt: '',
  aspectRatio: undefined,
  download: false,
  editable: true,
  filename: undefined,
  icons: undefined,
  labels: undefined,
  maxOutputSize: undefined,
  output: undefined,
  softness: undefined,
  toolbar: true,
  tools: ALL_TOOL_IDS,
  wheelZoom: true,
}

export const OPTION_NAMES = Object.keys(DEFAULT_OPTIONS) as OptionName[]

/** The options in use after a change. An option missing from `options` keeps its value, and `undefined` brings back its default. */
export function mergeOptions(current: ResolvedOptions, options: PaperPicOptions): ResolvedOptions {
  const next: ResolvedOptions = { ...current }
  for (const name of OPTION_NAMES) {
    if (name in options) {
      // Wrappers pass every option, with undefined for the ones not set
      Object.assign(next, { [name]: options[name] ?? DEFAULT_OPTIONS[name] })
    }
  }
  return next
}

/**
 * Whether two values of an option are the same, looking one level into arrays and objects. Wrappers pass a new
 * `tools` or `output` with the same contents on every render, which must not count as a change.
 */
export function sameOption(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
    return false
  }
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  return keysA.length === keysB.length
    && keysA.every(key => Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

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
