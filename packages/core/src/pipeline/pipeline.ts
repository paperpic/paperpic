import type { PixelBuffer } from '../processing/types'
import type { PipelineStep } from './operations'
import { adjustPixels } from '../processing/adjust'
import { cropPixels } from '../processing/crop'
import { estimateOutputSize, scaleQuad } from '../processing/homography'
import { rotatePixels } from '../processing/rotate'
import { adaptiveThreshold } from '../processing/threshold'
import { warpPerspective } from '../processing/warp'

function applyStep(pixels: PixelBuffer, step: PipelineStep): PixelBuffer {
  switch (step.type) {
    case 'rotate':
      return rotatePixels(pixels, step.rotation)
    case 'crop':
      return cropPixels(pixels, step.rect)
    case 'perspective': {
      const quad = scaleQuad(step.quad, pixels.width, pixels.height)
      const { width, height } = estimateOutputSize(quad, pixels, { aspectRatio: step.aspectRatio })
      return warpPerspective(pixels, quad, width, height)
    }
    case 'threshold':
      return adaptiveThreshold(pixels, { sensitivity: step.sensitivity, softness: step.softness })
    case 'adjust':
      return adjustPixels(pixels, { brightness: step.brightness, contrast: step.contrast })
  }
}

/** Runs the steps in order. It has no DOM, so the worker and the main thread share it. */
export function applySteps(source: PixelBuffer, steps: readonly PipelineStep[]): PixelBuffer {
  return steps.reduce(applyStep, source)
}
