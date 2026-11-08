import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect, Quad } from '../processing/types'
import type { Rotation } from '../rotation'
import { DEFAULT_SENSITIVITY, DEFAULT_SOFTNESS } from '../processing/threshold'
import { normalizeRotation } from '../rotation'

/** Straightens the area inside `quad`, whose corners are fractions of the image, into these proportions. */
export interface PerspectiveEdit {
  type: 'perspective'
  quad: Quad
  /** The proportions of the result, as width divided by height. */
  aspectRatio: number
}

/**
 * One edit, as the history stores it.
 * A rectangle refers to the image as the user saw it at that moment, with the earlier edits done.
 */
export type Operation
  = | { type: 'rotate', direction: 1 | -1 }
    | { type: 'crop', rect: NormalizedRect }
    | PerspectiveEdit
    | { type: 'threshold', enabled: boolean, sensitivity: number, softness: number }

/** The threshold in effect. */
export interface ThresholdSetting {
  enabled: boolean
  sensitivity: number
  softness: number
}

/** Cleans up the image. */
export interface ThresholdStep {
  type: 'threshold'
  sensitivity: number
  softness: number
}

/** One thing the pipeline does to the pixels. */
export type PipelineStep
  = | { type: 'rotate', rotation: QuarterTurn }
    | { type: 'crop', rect: NormalizedRect }
    | PerspectiveEdit
    | ThresholdStep

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
    else if (operation.type !== 'threshold') {
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

/**
 * Turns edits into the shortest list of steps, with the threshold always last, so the result does not depend on when the user turned it on.
 * A user who turns the image all the way around has changed nothing.
 */
export function toPipelineSteps(operations: readonly Operation[]): PipelineStep[] {
  const steps = geometrySteps(operations)
  const { enabled, sensitivity, softness } = thresholdSetting(operations)
  if (enabled) {
    steps.push({ type: 'threshold', sensitivity, softness })
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
 * and so is the threshold, which a preview paints apart so that a slider can change it.
 */
export function toPreviewSteps(operations: readonly Operation[]): PipelineStep[] {
  return geometrySteps(operations.slice(0, lastPixelEdit(operations) + 1))
}
