import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect, PixelBuffer, Quad } from '../processing/types'
import { adjustPixels } from '../processing/adjust'
import { cropPixels } from '../processing/crop'
import { flipPixels } from '../processing/flip'
import { estimateOutputSize, scaleQuad } from '../processing/homography'
import { rotatePixels } from '../processing/rotate'
import { adaptiveThreshold } from '../processing/threshold'
import { warpPerspective } from '../processing/warp'
import { normalizeRotation } from '../state/view'

/** Changes the brightness and contrast, each from -1 to 1, where 0 leaves the image as it is. */
export interface AdjustStep {
  brightness: number
  contrast: number
  type: 'adjust'
}

/** Straightens the area inside `quad`, whose corners are fractions of the image, into these proportions. */
export interface PerspectiveStep {
  /** The proportions of the result, as width divided by height. */
  aspectRatio: number
  quad: Quad
  type: 'perspective'
}

/** Cleans up the image. */
export interface ThresholdStep {
  sensitivity: number
  softness: number
  type: 'threshold'
}

/** A step that changes the tones and not the shape. It always runs after the others. */
export type ToneStep = AdjustStep | ThresholdStep

/** One thing the pipeline does to the pixels. */
export type PipelineStep
  = | { rotation: QuarterTurn, type: 'rotate' }
    /** Mirrors the image left to right. */
    | { type: 'flip' }
    | { rect: NormalizedRect, type: 'crop' }
    | PerspectiveStep
    | ToneStep

/** Whether a step changes only the tones. */
export function isToneStep(step: PipelineStep): step is ToneStep {
  return step.type === 'threshold' || step.type === 'adjust'
}

/** Every way to turn and mirror an image: a flip if `mirrored`, and then a clockwise turn. */
export interface Orientation {
  degrees: number
  mirrored: boolean
}

export const UPRIGHT: Orientation = { degrees: 0, mirrored: false }

/** Mirrors an orientation left to right. A flip after a turn is the same as a flip before the opposite turn. */
export function mirrorOrientation({ degrees, mirrored }: Orientation): Orientation {
  return { degrees: -degrees, mirrored: !mirrored }
}

/** The steps of an orientation, in the order it means: the flip, then the turn. */
export function orientationSteps({ degrees, mirrored }: Orientation): PipelineStep[] {
  const rotation = normalizeRotation(degrees)
  return [
    ...(mirrored
      ? [
          { type: 'flip' as const },
        ]
      : []),
    ...(rotation === 0
      ? []
      : [
          { type: 'rotate' as const, rotation },
        ]),
  ]
}

function applyStep(pixels: PixelBuffer, step: PipelineStep): PixelBuffer {
  switch (step.type) {
    case 'rotate':
      return rotatePixels(pixels, step.rotation)
    case 'flip':
      return flipPixels(pixels)
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
