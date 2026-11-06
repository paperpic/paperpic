import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './operations'
import { cropPixels } from '../processing/crop'
import { rotatePixels } from '../processing/rotate'

function applyStep(pixels: PixelBuffer, step: PipelineStep): PixelBuffer {
  switch (step.type) {
    case 'rotate':
      return rotatePixels(pixels, step.rotation)
    case 'crop':
      return cropPixels(pixels, step.rect)
  }
}

/** Runs the steps in order. It has no DOM, so the worker and the main thread share it. */
export function applySteps(source: PixelBuffer, steps: readonly PipelineStep[]): PixelBuffer {
  return steps.reduce(applyStep, source)
}
