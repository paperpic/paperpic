import type { RedactArea } from '../processing/redact'
import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect, PixelBuffer, Quad } from '../processing/types'
import { adjustPixels } from '../processing/adjust'
import { cropPixels } from '../processing/crop'
import { flipPixels } from '../processing/flip'
import { grayPixels } from '../processing/grayscale'
import { estimateOutputSize, scaleQuad } from '../processing/homography'
import { redactPixels } from '../processing/redact'
import { rotatePixels } from '../processing/rotate'
import { adaptiveThreshold } from '../processing/threshold'
import { warpPerspective } from '../processing/warp'
import { normalizeRotation } from '../state/view'

/**
 * Changes the tones of an image that keeps its own: the brightness and contrast, each from -1 to 1, where 0 leaves the
 * image as it is, and then the gray finish.
 */
export interface AdjustStep {
  brightness: number
  contrast: number
  /** Turns the image gray after the brightness and contrast. */
  gray?: boolean
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

/** A step that changes the tones and not the shape. It runs after the steps of the shape. */
export type ToneStep = AdjustStep | ThresholdStep

/**
 * Covers areas of the result. It runs last, after the tones, so its black and white stay solid whatever the tones do.
 */
export interface RedactStep {
  areas: RedactArea[]
  type: 'redact'
}

/** A step that changes the shape of the image. They run first. */
export type ShapeStep
  = | { rotation: QuarterTurn, type: 'rotate' }
    /** Mirrors the image left to right. */
    | { type: 'flip' }
    | { rect: NormalizedRect, type: 'crop' }
    | PerspectiveStep

/** One thing the pipeline does to the pixels. */
export type PipelineStep = ShapeStep | ToneStep | RedactStep

/** Whether a step changes the shape of the image, which the other steps never do. */
export function isShapeStep(step: PipelineStep): step is ShapeStep {
  return step.type === 'rotate' || step.type === 'flip' || step.type === 'crop' || step.type === 'perspective'
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
export function orientationSteps({ degrees, mirrored }: Orientation): ShapeStep[] {
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
      return adjustTones(pixels, step)
    case 'redact':
      return redactPixels(pixels, step.areas)
  }
}

/** Runs an adjust step: the brightness and contrast, if they change anything, and then the gray finish. */
export function adjustTones(pixels: PixelBuffer, { brightness, contrast, gray }: AdjustStep): PixelBuffer {
  const adjusted = brightness !== 0 || contrast !== 0
    ? adjustPixels(pixels, { brightness, contrast })
    : pixels
  return gray
    ? grayPixels(adjusted)
    : adjusted
}

/** Runs the steps in order. It has no DOM, so the worker and the main thread share it. */
export function applySteps(source: PixelBuffer, steps: readonly PipelineStep[]): PixelBuffer {
  return steps.reduce(applyStep, source)
}
