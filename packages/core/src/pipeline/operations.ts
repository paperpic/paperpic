import type { NormalizedRect } from '../processing/types'
import type { Rotation } from '../state/view'
import type { AdjustStep, PerspectiveStep, PipelineStep, ToneStep } from './steps'
import { DEFAULT_SENSITIVITY, DEFAULT_SOFTNESS } from '../processing/threshold'
import { normalizeRotation } from '../state/view'
import { mirrorOrientation, orientationSteps, UPRIGHT } from './steps'

/**
 * The finish of the image: `'original'` keeps its tones, `'gray'` turns it gray, and `'mono'` cleans up the document
 * in black and white.
 *
 * @see https://paperpic.dev/reference/types#finishmode
 */
export type FinishMode = 'original' | 'gray' | 'mono'

/** Every finish of Clean up, in the order its panel offers them. */
export const FINISH_MODES: readonly FinishMode[] = ['original', 'gray', 'mono']

/** The finish in effect. `sensitivity` and `softness` only change `'mono'`. */
export interface FinishSetting {
  mode: FinishMode
  sensitivity: number
  softness: number
}

/**
 * One edit, as the history stores it.
 * A rectangle refers to the image as the user saw it at that moment, with the earlier edits done. Straighten
 * stores the same fields as its step.
 */
export type Operation
  = | { direction: 1 | -1, type: 'rotate' }
    | { type: 'flip' }
    | { rect: NormalizedRect, type: 'crop' }
    | PerspectiveStep
    | FinishSetting & { type: 'finish' }
    | Omit<AdjustStep, 'gray'>

/** The brightness and contrast in effect. */
export type AdjustSetting = Omit<AdjustStep, 'gray' | 'type'>

/** The steps that change the shape of the image. Turns and flips next to each other merge or cancel out. */
function geometrySteps(operations: readonly Operation[]): PipelineStep[] {
  const steps: PipelineStep[] = []
  let orientation = UPRIGHT
  for (const operation of operations) {
    if (operation.type === 'rotate') {
      orientation = { ...orientation, degrees: orientation.degrees + 90 * operation.direction }
    }
    else if (operation.type === 'flip') {
      orientation = mirrorOrientation(orientation)
    }
    else if (operation.type === 'crop' || operation.type === 'perspective') {
      steps.push(...orientationSteps(orientation), operation)
      orientation = UPRIGHT
    }
  }
  steps.push(...orientationSteps(orientation))
  return steps
}

/** The finish in effect: its last edit decides, wherever it is in the list. */
export function finishSetting(operations: readonly Operation[]): FinishSetting {
  for (let index = operations.length - 1; index >= 0; index--) {
    const operation = operations[index]!
    if (operation.type === 'finish') {
      return {
        mode: operation.mode,
        sensitivity: operation.sensitivity,
        softness: operation.softness,
      }
    }
  }
  return {
    mode: 'original',
    sensitivity: DEFAULT_SENSITIVITY,
    softness: DEFAULT_SOFTNESS,
  }
}

/** The brightness and contrast in effect: their last edit decides, wherever it is in the list. */
export function adjustSetting(operations: readonly Operation[]): AdjustSetting {
  for (let index = operations.length - 1; index >= 0; index--) {
    const operation = operations[index]!
    if (operation.type === 'adjust') {
      return {
        brightness: operation.brightness,
        contrast: operation.contrast,
      }
    }
  }
  return {
    brightness: 0,
    contrast: 0,
  }
}

/**
 * The step that changes the tones, or `null` if there is none. A document in black and white has tones of its own,
 * so it leaves out the brightness and contrast. A gray finish runs after them.
 */
export function toneStep(operations: readonly Operation[]): ToneStep | null {
  const { mode, sensitivity, softness } = finishSetting(operations)
  if (mode === 'mono') {
    return { type: 'threshold', sensitivity, softness }
  }
  const { brightness, contrast } = adjustSetting(operations)
  const gray = mode === 'gray'
  return brightness !== 0 || contrast !== 0 || gray
    ? {
        type: 'adjust',
        brightness,
        contrast,
        ...(gray && { gray }),
      }
    : null
}

/**
 * Turns edits into the shortest list of steps, with the tones always last, so the result does not depend on when the user changed them.
 * A user who turns the image all the way around, or moves a ruler back to 0, has changed nothing.
 */
export function toPipelineSteps(operations: readonly Operation[]): PipelineStep[] {
  const steps = geometrySteps(operations)
  const tone = toneStep(operations)
  if (tone) {
    steps.push(tone)
  }
  return steps
}

/** The index of the last edit that the preview computes. A flip is one of them, because the view matrix only turns. */
function lastPixelEdit(operations: readonly Operation[]): number {
  return operations.map(({ type }) => type === 'crop' || type === 'perspective' || type === 'flip').lastIndexOf(true)
}

/**
 * The rotation that goes in the view matrix: the one after the last edit that changes the pixels of the shape.
 * The rotations before that edit are already in the preview.
 */
export function trailingRotation(operations: readonly Operation[]): Rotation {
  const degrees = operations
    .slice(lastPixelEdit(operations) + 1)
    .reduce((total, operation) => total + (operation.type === 'rotate'
      ? 90 * operation.direction
      : 0), 0)
  return normalizeRotation(degrees)
}

/**
 * The steps that decide the shape on display. The last rotations are left out, because the view matrix does them,
 * and so are the tones, which a preview paints apart so that a ruler can change them.
 */
export function toPreviewSteps(operations: readonly Operation[]): PipelineStep[] {
  return geometrySteps(operations.slice(0, lastPixelEdit(operations) + 1))
}
