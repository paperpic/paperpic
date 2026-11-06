import type { PixelRect } from '../processing/crop'
import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect, Quad } from '../processing/types'
import type { Rotation } from '../rotation'
import type { Size } from '../state/view'
import type { PerspectiveEdit, PipelineStep } from './operations'
import { cropBox } from '../processing/crop'
import { estimateOutputSize, scaleQuad } from '../processing/homography'
import { normalizeRotation } from '../rotation'

/** What to read from an image, and what is left to do with those pixels. */
export interface ReadPlan {
  /** The part of the image to read, in its pixels. */
  region: PixelRect
  /** The size to read it at. */
  width: number
  height: number
  steps: PipelineStep[]
}

export interface ReadLimits {
  /** The longest side of the result. */
  maxSide?: number
  /** The pixels to read, at most. */
  maxPixels?: number
}

/** Takes a rectangle from the frame of an image turned clockwise back to the frame of the image. */
export function unrotateRect({ x, y, width, height }: NormalizedRect, rotation: Rotation): NormalizedRect {
  switch (rotation) {
    case 0:
      return { x, y, width, height }
    case 90:
      return {
        x: y,
        y: 1 - x - width,
        width: height,
        height: width,
      }
    case 180:
      return {
        x: 1 - x - width,
        y: 1 - y - height,
        width,
        height,
      }
    case 270:
      return {
        x: 1 - y - height,
        y: x,
        width: height,
        height: width,
      }
  }
}

function shortenSide(side: number, scale: number): number {
  return Math.max(1, Math.round(side * scale))
}

/** The smallest rectangle around some corners. */
function quadBounds(quad: Quad): NormalizedRect {
  const xs = quad.map(({ x }) => x)
  const ys = quad.map(({ y }) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  }
}

function sizeAfterStep({ width, height }: Size, step: PipelineStep): Size {
  switch (step.type) {
    case 'rotate':
      return step.rotation === 180
        ? { width, height }
        : { width: height, height: width }
    case 'crop': {
      const box = cropBox(step.rect, width, height)
      return { width: box.width, height: box.height }
    }
    case 'perspective':
      return estimateOutputSize(scaleQuad(step.quad, width, height), { width, height }, { aspectRatio: step.aspectRatio })
  }
}

function sizeAfterSteps(start: Size, steps: readonly PipelineStep[]): Size {
  return steps.reduce(sizeAfterStep, start)
}

/**
 * Plans the read of an image, so the steps work with as few pixels as possible.
 * The crops at the start become the region to read, and so does the area around the first perspective change.
 * That keeps a small selection of a large photo sharp in a preview.
 */
export function planRead(image: Size, steps: readonly PipelineStep[], { maxSide, maxPixels }: ReadLimits = {}): ReadPlan {
  let left = 0
  let top = 0
  let regionWidth = 1
  let regionHeight = 1
  let degrees = 0
  let index = 0
  let perspective: PerspectiveEdit | null = null

  const keep = (frameRect: NormalizedRect) => {
    const rect = unrotateRect(frameRect, normalizeRotation(degrees))
    left += rect.x * regionWidth
    top += rect.y * regionHeight
    regionWidth *= rect.width
    regionHeight *= rect.height
  }

  while (index < steps.length && !perspective) {
    const step = steps[index++]!
    if (step.type === 'rotate') {
      degrees += step.rotation
    }
    else if (step.type === 'crop') {
      keep(step.rect)
    }
    else {
      const bounds = quadBounds(step.quad)
      keep(bounds)
      perspective = {
        ...step,
        quad: step.quad.map(({ x, y }) => ({
          x: (x - bounds.x) / bounds.width,
          y: (y - bounds.y) / bounds.height,
        })) as unknown as Quad,
      }
    }
  }

  const region = cropBox({
    x: left,
    y: top,
    width: regionWidth,
    height: regionHeight,
  }, image.width, image.height)
  const rotation = normalizeRotation(degrees)
  const remaining: PipelineStep[] = [
    ...(rotation === 0
      ? []
      : [
          { type: 'rotate' as const, rotation: rotation as QuarterTurn },
        ]),
    ...(perspective
      ? [perspective]
      : []),
    ...steps.slice(index),
  ]

  const result = sizeAfterSteps({ width: region.width, height: region.height }, remaining)
  const scale = Math.min(
    1,
    (maxSide ?? Number.POSITIVE_INFINITY) / Math.max(result.width, result.height),
    Math.sqrt((maxPixels ?? Number.POSITIVE_INFINITY) / (region.width * region.height)),
  )

  return {
    region,
    width: shortenSide(region.width, scale),
    height: shortenSide(region.height, scale),
    steps: remaining,
  }
}

/** The size the result has at full resolution. */
export function resultSize(image: Size, steps: readonly PipelineStep[]): Size {
  const { region, steps: remaining } = planRead(image, steps)
  return sizeAfterSteps({ width: region.width, height: region.height }, remaining)
}
