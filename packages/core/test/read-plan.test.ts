import { describe, expect, it } from 'vitest'
import { toPipelineSteps, toPreviewSteps, trailingRotation } from '../src/pipeline/operations'
import { applySteps } from '../src/pipeline/pipeline'
import { planRead, resultSize, unrotateRect } from '../src/pipeline/read-plan'
import { cropBox, cropPixels } from '../src/processing/crop'
import { rotatePixels } from '../src/processing/rotate'

const image = { width: 1000, height: 500 }
const half = { x: 0, y: 0, width: 0.5, height: 0.5 }
const right = { type: 'rotate', direction: 1 } as const
const left = { type: 'rotate', direction: -1 } as const
const crop = { type: 'crop', rect: half } as const

/** A 4×3 image where each pixel holds its own index in every channel. */
function indexed() {
  const values = Array.from({ length: 12 }, (_, index) => index)
  return {
    data: new Uint8ClampedArray(values.flatMap(value => [value, value, value, 255])),
    width: 4,
    height: 3,
  }
}

function indexes({ data }: { data: Uint8ClampedArray }) {
  return [...data].filter((_, index) => index % 4 === 0)
}

describe('operations with pixels', () => {
  it('merges only the rotations next to each other', () => {
    expect(toPipelineSteps([right, right, crop, left])).toEqual([
      { type: 'rotate', rotation: 180 },
      crop,
      { type: 'rotate', rotation: 270 },
    ])
  })

  it('drops rotations that cancel out around a crop', () => {
    expect(toPipelineSteps([right, left, crop])).toEqual([crop])
  })

  it('leaves to the view matrix only the rotation after the last crop', () => {
    expect(trailingRotation([right, crop])).toBe(0)
    expect(trailingRotation([right, crop, left])).toBe(270)
    expect(trailingRotation([right, right])).toBe(180)
  })

  it('previews the pixels up to the last crop', () => {
    expect(toPreviewSteps([right, crop, left])).toEqual([
      { type: 'rotate', rotation: 90 },
      crop,
    ])
    expect(toPreviewSteps([right, right])).toEqual([])
  })
})

describe('cropBox', () => {
  it('rounds to whole pixels', () => {
    expect(cropBox({
      x: 0.25,
      y: 0.5,
      width: 0.5,
      height: 0.25,
    }, 100, 100)).toEqual({ x: 25, y: 50, width: 50, height: 25 })
  })

  it('stays inside the image, with at least one pixel', () => {
    expect(cropBox({
      x: 0.99,
      y: 0.99,
      width: 0.5,
      height: 0.001,
    }, 10, 10)).toEqual({ x: 9, y: 9, width: 1, height: 1 })
    expect(cropBox({ x: 0, y: 0, width: 1, height: 1 }, 10, 10)).toEqual({ x: 0, y: 0, width: 10, height: 10 })
  })
})

describe('cropPixels', () => {
  it('copies the rectangle', () => {
    const result = cropPixels(indexed(), {
      x: 0.25,
      y: 1 / 3,
      width: 0.5,
      height: 2 / 3,
    })
    expect([result.width, result.height]).toEqual([2, 2])
    expect(indexes(result)).toEqual([5, 6, 9, 10])
  })
})

describe('unrotateRect', () => {
  it.each([90, 180, 270] as const)('takes a rectangle from a frame turned %d degrees back to the image', (rotation) => {
    // Marks the pixel the rectangle should keep, in the image, and looks for it through the rotation
    const source = indexed()
    const turned = rotatePixels(indexed(), rotation)
    const rect = {
      x: 0,
      y: 0,
      width: 1 / turned.width,
      height: 1 / turned.height,
    }
    const expected = indexes(cropPixels(turned, rect))
    expect(indexes(cropPixels(source, unrotateRect(rect, rotation)))).toEqual(expected)
  })
})

describe('planRead', () => {
  it('reads the whole image without steps', () => {
    expect(planRead(image, [])).toEqual({
      region: { x: 0, y: 0, width: 1000, height: 500 },
      width: 1000,
      height: 500,
      steps: [],
    })
  })

  it('turns a crop into the region to read, with no step left', () => {
    expect(planRead(image, [crop])).toEqual({
      region: { x: 0, y: 0, width: 500, height: 250 },
      width: 500,
      height: 250,
      steps: [],
    })
  })

  it('joins crops in a row', () => {
    const plan = planRead(image, [
      {
        type: 'crop',
        rect: { x: 0.5, y: 0, width: 0.5, height: 1 },
      },
      {
        type: 'crop',
        rect: {
          x: 0.5,
          y: 0.5,
          width: 0.5,
          height: 0.5,
        },
      },
    ])
    expect(plan.region).toEqual({
      x: 750,
      y: 250,
      width: 250,
      height: 250,
    })
  })

  it('keeps a rotation, after reading the part it needs', () => {
    const plan = planRead(image, [
      { type: 'rotate', rotation: 90 },
      {
        type: 'crop',
        rect: { x: 0, y: 0, width: 0.5, height: 1 },
      },
    ])
    expect(plan.region).toEqual({
      x: 0,
      y: 250,
      width: 1000,
      height: 250,
    })
    expect(plan.steps).toEqual([
      { type: 'rotate', rotation: 90 },
    ])
  })

  it('limits the pixels to read, and reads a small crop at full size', () => {
    expect(planRead(image, [], { maxPixels: 125_000 })).toMatchObject({ width: 500, height: 250 })
    expect(planRead(image, [crop], { maxPixels: 125_000 })).toMatchObject({ width: 500, height: 250 })
  })

  it('limits the longest side of the result, not of the photo', () => {
    expect(planRead(image, [crop], { maxSide: 100 })).toMatchObject({ width: 100, height: 50 })
    expect(planRead(image, [crop], { maxSide: 800 })).toMatchObject({ width: 500, height: 250 })
  })

  it.each([
    [
      [right, crop],
    ],
    [
      [right, right, crop, right],
    ],
    [
      [crop, right, crop],
    ],
    [
      [left, crop, left, crop, left],
    ],
  ])('gives the same pixels as running the steps one by one: %j', (operations) => {
    const steps = toPipelineSteps(operations)
    const source = {
      data: new Uint8ClampedArray(Array.from({ length: 64 }, (_, index) => [index, index, index, 255]).flat()),
      width: 16,
      height: 4,
    }
    const expected = applySteps(source, steps)

    const plan = planRead(source, steps)
    const read = cropPixels(source, {
      x: plan.region.x / source.width,
      y: plan.region.y / source.height,
      width: plan.region.width / source.width,
      height: plan.region.height / source.height,
    })
    const result = applySteps(read, plan.steps)

    expect([result.width, result.height]).toEqual([expected.width, expected.height])
    expect(indexes(result)).toEqual(indexes(expected))
  })
})

describe('resultSize', () => {
  it('is the size at full resolution', () => {
    expect(resultSize(image, [])).toEqual(image)
    expect(resultSize(image, [crop])).toEqual({ width: 500, height: 250 })
    expect(resultSize(image, toPipelineSteps([crop, right]))).toEqual({ width: 250, height: 500 })
    expect(resultSize(image, toPipelineSteps([right, right]))).toEqual(image)
  })
})
