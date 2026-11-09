import type { Operation } from '../src/pipeline/operations'
import type { PixelBuffer } from '../src/processing/types'
import { describe, expect, it } from 'vitest'
import { toPipelineSteps, toPreviewSteps, trailingRotation } from '../src/pipeline/operations'
import { photoFrame } from '../src/pipeline/photo-frame'
import { applySteps } from '../src/pipeline/pipeline'
import { planRead } from '../src/pipeline/read-plan'
import { cropPixels } from '../src/processing/crop'
import { flipPixels } from '../src/processing/flip'
import { rotatePixels } from '../src/processing/rotate'

const right: Operation = { type: 'rotate', direction: 1 }
const left: Operation = { type: 'rotate', direction: -1 }
const flip: Operation = { type: 'flip' }
const crop: Operation = {
  type: 'crop',
  rect: {
    x: 0.25,
    y: 0,
    width: 0.5,
    height: 0.5,
  },
}

/**
 * An image of 8 by 4 pixels, each with its own green, so any move shows.
 * The crops below fall on whole pixels in every orientation, so reading a region rounds nothing.
 */
function image(): PixelBuffer {
  return {
    data: new Uint8ClampedArray(Array.from({ length: 32 }, (_, pixel) => [200, pixel, 0, 255]).flat()),
    width: 8,
    height: 4,
  }
}

function greens({ data }: PixelBuffer): number[] {
  return [...data].filter((_, index) => index % 4 === 1)
}

/** Does each edit on the pixels as the user made it, without merging anything. */
function editOneByOne(operations: readonly Operation[]): PixelBuffer {
  return operations.reduce((pixels, operation) => {
    switch (operation.type) {
      case 'rotate':
        return rotatePixels(pixels, operation.direction === 1
          ? 90
          : 270)
      case 'flip':
        return flipPixels(pixels)
      case 'crop':
        return cropPixels(pixels, operation.rect)
      default:
        return pixels
    }
  }, image())
}

describe('flipPixels', () => {
  it('mirrors each row and keeps the size', () => {
    const flipped = flipPixels(image())
    expect(flipped).toMatchObject({ width: 8, height: 4 })
    expect(greens(flipped).slice(0, 8)).toEqual([7, 6, 5, 4, 3, 2, 1, 0])
    expect(greens(flipped).slice(24)).toEqual([31, 30, 29, 28, 27, 26, 25, 24])
  })

  it('gives the image back when it runs twice', () => {
    expect(flipPixels(flipPixels(image())).data).toEqual(image().data)
  })
})

describe('flips in the operations', () => {
  it('cancel out in pairs, so two flips are no change', () => {
    expect(toPipelineSteps([flip, flip])).toEqual([])
    expect(toPipelineSteps([flip, right, right, flip, right, right])).toEqual([])
  })

  it('merge with the turns next to them into a flip and then a turn', () => {
    expect(toPipelineSteps([right, flip])).toEqual([
      { type: 'flip' },
      { type: 'rotate', rotation: 270 },
    ])
    expect(toPipelineSteps([right, flip, right])).toEqual([
      { type: 'flip' },
    ])
    expect(toPipelineSteps([flip, right, flip])).toEqual([
      { type: 'rotate', rotation: 270 },
    ])
  })

  it.each([
    [
      [flip],
    ],
    [
      [right, flip],
    ],
    [
      [flip, left],
    ],
    [
      [right, flip, right, right, flip],
    ],
    [
      [left, crop, flip, right],
    ],
    [
      [flip, crop, right, flip, crop],
    ],
  ])('give the pixels of each edit done in turn: %#', (operations) => {
    expect(applySteps(image(), toPipelineSteps(operations))).toEqual(editOneByOne(operations))
  })

  it('make the preview compute them, and leave a turn after them to the view matrix', () => {
    expect(toPreviewSteps([flip, right])).toEqual([
      { type: 'flip' },
    ])
    expect(trailingRotation([flip, right])).toBe(90)
    expect(trailingRotation([right, flip])).toBe(0)
  })
})

describe('flips in the read plan', () => {
  it('read the mirrored region of a crop after them', () => {
    const plan = planRead({ width: 100, height: 50 }, [
      { type: 'flip' },
      {
        type: 'crop',
        rect: { x: 0, y: 0, width: 0.3, height: 0.5 },
      },
    ])
    expect(plan.region).toEqual({ x: 70, y: 0, width: 30, height: 25 })
    expect(plan.steps).toEqual([
      { type: 'flip' },
    ])
  })

  it.each([
    [
      [flip, crop],
    ],
    [
      [right, flip, crop],
    ],
    [
      [flip, left, crop, right, flip, crop],
    ],
  ])('read only what the steps need, with the same result: %#', (operations) => {
    const steps = toPipelineSteps(operations)
    const { region, steps: remaining } = planRead({ width: 8, height: 4 }, steps)
    const read = cropPixels(image(), {
      x: region.x / 8,
      y: region.y / 4,
      width: region.width / 8,
      height: region.height / 4,
    })
    expect(applySteps(read, remaining)).toEqual(applySteps(image(), steps))
  })
})

describe('flips in the photo frame', () => {
  it('mirror where the image sits in the photo', () => {
    expect(photoFrame({ width: 100, height: 50 }, [
      {
        type: 'crop',
        rect: { x: 0, y: 0, width: 0.3, height: 0.5 },
      },
      { type: 'flip' },
    ])).toEqual({
      photo: { width: 100, height: 50 },
      origin: { x: 70, y: 0 },
    })
  })
})
