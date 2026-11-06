import type { PixelRect } from '../processing/crop'
import type { QuarterTurn } from '../processing/rotate'
import type { NormalizedRect } from '../processing/types'
import type { Rotation } from '../rotation'
import type { Size } from '../state/view'
import type { PipelineStep } from './operations'
import { cropBox } from '../processing/crop'
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

/**
 * Plans the read of an image, so the steps work with as few pixels as possible.
 * The crops at the start become the region to read, which also keeps a small crop of a large photo sharp in a preview.
 */
export function planRead(image: Size, steps: readonly PipelineStep[], { maxSide, maxPixels }: ReadLimits = {}): ReadPlan {
  let left = 0
  let top = 0
  let regionWidth = 1
  let regionHeight = 1
  let degrees = 0
  let index = 0

  for (; index < steps.length; index++) {
    const step = steps[index]!
    if (step.type === 'rotate') {
      degrees += step.rotation
    }
    else {
      const rect = unrotateRect(step.rect, normalizeRotation(degrees))
      left += rect.x * regionWidth
      top += rect.y * regionHeight
      regionWidth *= rect.width
      regionHeight *= rect.height
    }
  }

  const region = cropBox({
    x: left,
    y: top,
    width: regionWidth,
    height: regionHeight,
  }, image.width, image.height)
  const scale = Math.min(
    1,
    (maxSide ?? Number.POSITIVE_INFINITY) / Math.max(region.width, region.height),
    Math.sqrt((maxPixels ?? Number.POSITIVE_INFINITY) / (region.width * region.height)),
  )
  const rotation = normalizeRotation(degrees)

  return {
    region,
    width: shortenSide(region.width, scale),
    height: shortenSide(region.height, scale),
    steps: [
      ...(rotation === 0
        ? []
        : [
            { type: 'rotate' as const, rotation: rotation as QuarterTurn },
          ]),
      ...steps.slice(index),
    ],
  }
}

/** The size the result has at full resolution. */
export function resultSize(image: Size, steps: readonly PipelineStep[]): Size {
  const { region, steps: remaining } = planRead(image, steps)
  return remaining.reduce<Size>(({ width, height }, step) => {
    if (step.type === 'crop') {
      const box = cropBox(step.rect, width, height)
      return { width: box.width, height: box.height }
    }
    return step.rotation === 180
      ? { width, height }
      : { width: height, height: width }
  }, { width: region.width, height: region.height })
}
