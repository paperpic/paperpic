import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './operations'
import { rotatePixels } from '../processing/rotate'

/** Runs the steps in order. It has no DOM, so the worker and the main thread share it. */
export function applySteps(source: PixelBuffer, steps: readonly PipelineStep[]): PixelBuffer {
  return steps.reduce((pixels, step) => rotatePixels(pixels, step.rotation), source)
}
