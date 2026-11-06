import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect } from '../processing/types'
import type { Rotation } from '../rotation'
import { normalizeRotation } from '../rotation'

/**
 * One edit, as the history stores it.
 * A rectangle refers to the image as the user saw it at that moment, with the earlier edits done.
 */
export type Operation
  = | { type: 'rotate', direction: 1 | -1 }
    | { type: 'crop', rect: NormalizedRect }

/** One thing the pipeline does to the pixels. */
export type PipelineStep
  = | { type: 'rotate', rotation: QuarterTurn }
    | { type: 'crop', rect: NormalizedRect }

function addRotation(steps: PipelineStep[], degrees: number): void {
  const rotation = normalizeRotation(degrees)
  if (rotation !== 0) {
    steps.push({ type: 'rotate', rotation })
  }
}

/**
 * Turns edits into the shortest list of steps. Rotations next to each other merge or cancel out,
 * so a user who turns the image all the way around has changed nothing.
 */
export function toPipelineSteps(operations: readonly Operation[]): PipelineStep[] {
  const steps: PipelineStep[] = []
  let degrees = 0
  for (const operation of operations) {
    if (operation.type === 'rotate') {
      degrees += 90 * operation.direction
    }
    else {
      addRotation(steps, degrees)
      degrees = 0
      steps.push(operation)
    }
  }
  addRotation(steps, degrees)
  return steps
}

function lastPixelEdit(operations: readonly Operation[]): number {
  return operations.map(({ type }) => type !== 'rotate').lastIndexOf(true)
}

/**
 * The rotation that goes in the view matrix: the one after the last edit that needs new pixels.
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

/** The steps that decide the pixels on display. The last rotations are left out, because the view matrix does them. */
export function toPreviewSteps(operations: readonly Operation[]): PipelineStep[] {
  return toPipelineSteps(operations.slice(0, lastPixelEdit(operations) + 1))
}
