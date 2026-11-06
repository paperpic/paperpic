import type { QuarterTurn } from '../processing/rotate'
import type { Rotation } from '../rotation'
import { normalizeRotation } from '../rotation'

/** One edit, as the history stores it. */
export interface Operation { type: 'rotate', direction: 1 | -1 }

/** One thing the pipeline does to the pixels. */
export interface PipelineStep { type: 'rotate', rotation: QuarterTurn }

/** The rotation the viewer shows for a list of edits. */
export function netRotation(operations: readonly Operation[]): Rotation {
  return normalizeRotation(operations.reduce((degrees, { direction }) => degrees + 90 * direction, 0))
}

/**
 * Turns edits into the shortest list of steps. Rotations that cancel out disappear,
 * so a user who turns the image all the way around has changed nothing.
 */
export function toPipelineSteps(operations: readonly Operation[]): PipelineStep[] {
  const rotation = netRotation(operations)
  return rotation === 0
    ? []
    : [
        { type: 'rotate', rotation },
      ]
}
