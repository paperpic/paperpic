import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect, Quad } from '../processing/types'
import type { Rotation } from '../rotation'
import { DEFAULT_SENSITIVITY, DEFAULT_SOFTNESS } from '../processing/threshold'
import { normalizeRotation } from '../rotation'

/** Changes the brightness and contrast, each from -1 to 1, where 0 leaves the image as it is. */
export interface AdjustEdit {
  brightness: number
  contrast: number
  type: 'adjust'
}

/** Straightens the area inside `quad`, whose corners are fractions of the image, into these proportions. */
export interface PerspectiveEdit {
  /** The proportions of the result, as width divided by height. */
  aspectRatio: number
  quad: Quad
  type: 'perspective'
}

/**
 * One edit, as the history stores it.
 * A rectangle refers to the image as the user saw it at that moment, with the earlier edits done.
 */
export type Operation
  = | { direction: 1 | -1, type: 'rotate' }
    | { rect: NormalizedRect, type: 'crop' }
    | PerspectiveEdit
    | { enabled: boolean, sensitivity: number, softness: number, type: 'threshold' }
    | AdjustEdit

/** The brightness and contrast in effect. */
export type AdjustSetting = Omit<AdjustEdit, 'type'>

/** The threshold in effect. */
export interface ThresholdSetting {
  enabled: boolean
  sensitivity: number
  softness: number
}

/** Cleans up the image. */
export interface ThresholdStep {
  sensitivity: number
  softness: number
  type: 'threshold'
}

/** A step that changes the tones and not the shape. It always runs after the others. */
export type ToneStep = AdjustEdit | ThresholdStep

/** One thing the pipeline does to the pixels. */
export type PipelineStep
  = | { rotation: QuarterTurn, type: 'rotate' }
    | { rect: NormalizedRect, type: 'crop' }
    | PerspectiveEdit
    | ToneStep

/** Whether a step changes only the tones. */
export function isToneStep(step: PipelineStep): step is ToneStep {
  return step.type === 'threshold' || step.type === 'adjust'
}

function addRotation(steps: PipelineStep[], degrees: number): void {
  const rotation = normalizeRotation(degrees)
  if (rotation !== 0) {
    steps.push({ type: 'rotate', rotation })
  }
}

/** The steps that change the shape of the image. Rotations next to each other merge or cancel out. */
function geometrySteps(operations: readonly Operation[]): PipelineStep[] {
  const steps: PipelineStep[] = []
  let degrees = 0
  for (const operation of operations) {
    if (operation.type === 'rotate') {
      degrees += 90 * operation.direction
    }
    else if (operation.type !== 'threshold' && operation.type !== 'adjust') {
      addRotation(steps, degrees)
      degrees = 0
      steps.push(operation)
    }
  }
  addRotation(steps, degrees)
  return steps
}

/** The threshold in effect: its last edit decides, wherever it is in the list. */
export function thresholdSetting(operations: readonly Operation[]): ThresholdSetting {
  for (let index = operations.length - 1; index >= 0; index--) {
    const operation = operations[index]!
    if (operation.type === 'threshold') {
      return {
        enabled: operation.enabled,
        sensitivity: operation.sensitivity,
        softness: operation.softness,
      }
    }
  }
  return {
    enabled: false,
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
 * The step that changes the tones, or `null` if there is none. A cleaned document has tones of its own,
 * so the threshold leaves out the brightness and contrast.
 */
export function toneStep(operations: readonly Operation[]): ToneStep | null {
  const { enabled, sensitivity, softness } = thresholdSetting(operations)
  if (enabled) {
    return { type: 'threshold', sensitivity, softness }
  }
  const { brightness, contrast } = adjustSetting(operations)
  return brightness !== 0 || contrast !== 0
    ? { type: 'adjust', brightness, contrast }
    : null
}

/**
 * Turns edits into the shortest list of steps, with the tones always last, so the result does not depend on when the user changed them.
 * A user who turns the image all the way around, or moves a slider back to 0, has changed nothing.
 */
export function toPipelineSteps(operations: readonly Operation[]): PipelineStep[] {
  const steps = geometrySteps(operations)
  const tone = toneStep(operations)
  if (tone) {
    steps.push(tone)
  }
  return steps
}

function lastPixelEdit(operations: readonly Operation[]): number {
  return operations.map(({ type }) => type === 'crop' || type === 'perspective').lastIndexOf(true)
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
 * and so are the tones, which a preview paints apart so that a slider can change them.
 */
export function toPreviewSteps(operations: readonly Operation[]): PipelineStep[] {
  return geometrySteps(operations.slice(0, lastPixelEdit(operations) + 1))
}
