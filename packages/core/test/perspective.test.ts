import type { PerspectiveEdit, PipelineStep } from '../src/pipeline/operations'
import type { Quad } from '../src/processing/types'
import type { ToolHost } from '../src/tools/types'
import { describe, expect, it } from 'vitest'
import { photoFrame } from '../src/pipeline/photo-frame'
import { applySteps } from '../src/pipeline/pipeline'
import { planRead, resultSize } from '../src/pipeline/read-plan'
import { cropPixels } from '../src/processing/crop'
import { estimateAspectRatio, scaleQuad } from '../src/processing/homography'
import { constrainToConvex, rectangleCorners } from '../src/tools/corners'
import { perspectiveTool } from '../src/tools/perspective'
import { DEFAULT_LABELS } from '../src/ui/labels'

const frame = { width: 1000, height: 500 }

/** Marks each pixel with its position, so a wrong sample shows in the values. */
function gradient(width: number, height: number) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set([x * 4, y * 4, 0, 255], (y * width + x) * 4)
    }
  }
  return { data, width, height }
}

const insideHalf: PerspectiveEdit = {
  type: 'perspective',
  quad: [
    { x: 0.5, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 0.5 },
    { x: 0.5, y: 0.5 },
  ],
  aspectRatio: 2,
}

describe('applySteps with a perspective change', () => {
  it('gives the proportions asked for, with about the same number of pixels', () => {
    const result = applySteps(gradient(40, 20), [insideHalf])
    expect(result.width / result.height).toBeCloseTo(2, 1)
    expect(result.width * result.height).toBeGreaterThan(190)
    expect(result.width * result.height).toBeLessThan(210)
  })

  it('samples the area inside the corners', () => {
    const result = applySteps(gradient(40, 20), [
      { ...insideHalf, aspectRatio: 2 },
    ])
    // The first pixel comes from the top left corner of the selection
    expect(result.data[0]).toBe(80)
    expect(result.data[1]).toBe(0)
  })
})

describe('planRead with a perspective change', () => {
  const image = { width: 1000, height: 500 }

  it('reads only the area around the corners', () => {
    const plan = planRead(image, [insideHalf])
    expect(plan.region).toEqual({
      x: 500,
      y: 0,
      width: 500,
      height: 250,
    })
    expect(plan.steps).toHaveLength(1)
    expect((plan.steps[0] as PerspectiveEdit).quad).toEqual(rectangleCorners(0, 0, 1, 1))
  })

  it('leaves the steps after it in place, and stops joining crops there', () => {
    const crop: PipelineStep = {
      type: 'crop',
      rect: { x: 0, y: 0, width: 0.5, height: 0.5 },
    }
    const plan = planRead(image, [crop, insideHalf, crop])
    expect(plan.region).toEqual({
      x: 250,
      y: 0,
      width: 250,
      height: 125,
    })
    expect(plan.steps.map(({ type }) => type)).toEqual(['perspective', 'crop'])
  })

  it('keeps an earlier rotation before it, and reads the right part of the photo', () => {
    const plan = planRead(image, [
      { type: 'rotate', rotation: 90 },
      insideHalf,
    ])
    // A clockwise turn sends (x, y) to (500 - y, x), so the top right of the frame is the top left of the image
    expect(plan.region).toEqual({ x: 0, y: 0, width: 500, height: 250 })
    expect(plan.steps.map(({ type }) => type)).toEqual(['rotate', 'perspective'])
  })

  it('gives the same result as running the steps one by one', () => {
    const source = gradient(40, 20)
    const steps: PipelineStep[] = [
      { type: 'rotate', rotation: 90 },
      {
        type: 'perspective',
        quad: [
          { x: 0.25, y: 0.25 },
          { x: 0.75, y: 0.25 },
          { x: 0.75, y: 0.75 },
          { x: 0.25, y: 0.75 },
        ],
        aspectRatio: 0.5,
      },
    ]
    const expected = applySteps(source, steps)

    const { region, steps: remaining } = planRead(source, steps)
    const read = cropPixels(source, {
      x: region.x / source.width,
      y: region.y / source.height,
      width: region.width / source.width,
      height: region.height / source.height,
    })
    const result = applySteps(read, remaining)

    expect([result.width, result.height]).toEqual([expected.width, expected.height])
    expect(resultSize(source, steps)).toEqual({ width: expected.width, height: expected.height })
    const difference = result.data.reduce((total, value, index) => total + Math.abs(value - expected.data[index]!), 0)
    expect(difference / result.data.length).toBeLessThan(4)
  })

  it('limits the longest side of the result, and not of the selection', () => {
    const tall = { ...insideHalf, aspectRatio: 0.25 }
    const full = resultSize(image, [tall])
    expect(full.height).toBeGreaterThan(full.width)

    const plan = planRead(image, [tall], { maxSide: full.height / 2 })
    expect(plan.width).toBe(250)
    expect(plan.height).toBe(125)
  })
})

describe('resultSize', () => {
  it('follows the steps after a perspective change', () => {
    const image = { width: 1000, height: 500 }
    const size = resultSize(image, [insideHalf])
    expect(size.width / size.height).toBeCloseTo(2, 2)
    expect(resultSize(image, [
      insideHalf,
      { type: 'rotate', rotation: 90 },
    ])).toEqual({ width: size.height, height: size.width })
  })
})

describe('photoFrame', () => {
  const image = { width: 1000, height: 500 }
  const crop: PipelineStep = {
    type: 'crop',
    rect: {
      x: 0.5,
      y: 0.2,
      width: 0.25,
      height: 0.5,
    },
  }

  it('is the image itself without edits', () => {
    expect(photoFrame(image, [])).toEqual({
      photo: image,
      origin: { x: 0, y: 0 },
    })
  })

  it('keeps the place of a crop', () => {
    expect(photoFrame(image, [crop])).toEqual({
      photo: image,
      origin: { x: 500, y: 100 },
    })
  })

  it('turns the photo with a rotation', () => {
    expect(photoFrame(image, [
      { type: 'rotate', rotation: 90 },
    ])).toEqual({
      photo: { width: 500, height: 1000 },
      origin: { x: 0, y: 0 },
    })
  })

  it('finds a crop after turning it', () => {
    // The crop covers x 500 to 750 and y 100 to 350. Turned clockwise, the point (x, y) goes to (500 - y, x)
    expect(photoFrame(image, [
      crop,
      { type: 'rotate', rotation: 90 },
    ])).toEqual({
      photo: { width: 500, height: 1000 },
      origin: { x: 150, y: 500 },
    })
    expect(photoFrame(image, [
      crop,
      { type: 'rotate', rotation: 180 },
    ])).toEqual({
      photo: image,
      origin: { x: 250, y: 150 },
    })
  })

  it('starts over after a perspective change', () => {
    const { photo, origin } = photoFrame(image, [crop, insideHalf])
    expect(origin).toEqual({ x: 0, y: 0 })
    expect(photo.width / photo.height).toBeCloseTo(2, 1)
  })

  it('estimates the same after a crop as before it', () => {
    const quad: Quad = [
      { x: 550, y: 120 },
      { x: 700, y: 130 },
      { x: 720, y: 330 },
      { x: 530, y: 320 },
    ]
    const whole = estimateAspectRatio(quad, image)
    const { photo, origin } = photoFrame(image, [crop])
    const relative = quad.map(({ x, y }) => ({ x: x - 500, y: y - 100 })) as unknown as Quad
    const moved = relative.map(({ x, y }) => ({ x: x + origin.x, y: y + origin.y })) as unknown as Quad
    expect(estimateAspectRatio(moved, photo)).toBeCloseTo(whole, 6)
  })
})

describe('constrainToConvex', () => {
  const corners = rectangleCorners(100, 100, 300, 300)

  it('moves only that corner', () => {
    expect(constrainToConvex(corners, 0, { x: 50, y: 60 }, frame)).toEqual([
      { x: 50, y: 60 },
      corners[1],
      corners[2],
      corners[3],
    ])
  })

  it('stays inside the frame', () => {
    expect(constrainToConvex(corners, 2, { x: 5000, y: -90 }, frame)[2]).toEqual({ x: 1000, y: 300 })
  })

  it('never crosses, and slides along the side that still allows it', () => {
    // Past the opposite side in x only: y still applies
    expect(constrainToConvex(corners, 0, { x: 700, y: 60 }, frame)[0]).toEqual({ x: 100, y: 60 })
  })

  it('stays where it was when nothing allows the move', () => {
    expect(constrainToConvex(corners, 0, { x: 700, y: 700 }, frame)).toBe(corners)
  })

  it('never leaves a concave shape', () => {
    // Inside the triangle of the other three corners. It slides along the top side instead
    expect(constrainToConvex(corners, 0, { x: 280, y: 280 }, frame)[0]).toEqual({ x: 280, y: 100 })
  })
})

describe('perspective tool', () => {
  const host = (overrides: Partial<ToolHost> = {}): ToolHost => ({
    layer: document.createElement('div'),
    frameSize: () => frame,
    frameToViewport: point => point,
    viewportToFrame: point => point,
    reveal: () => {},
    requestPaint: () => {},
    setHint: () => {},
    announce: () => {},
    labels: () => DEFAULT_LABELS,
    photoFrame: () => ({
      photo: frame,
      origin: { x: 0, y: 0 },
    }),
    aspectRatio: () => undefined,
    paintLens: () => {},
    ...overrides,
  })

  it('gives the corners as fractions of the image', () => {
    const edit = perspectiveTool.activate!(host()).confirm() as PerspectiveEdit
    expect(edit.type).toBe('perspective')
    expect(edit.quad[0].x).toBeCloseTo(0.1)
    expect(edit.quad[0].y).toBeCloseTo(0.1)
    expect(edit.quad[2].x).toBeCloseTo(0.9)
    expect(edit.quad[2].y).toBeCloseTo(0.9)
  })

  it('estimates the proportions when nobody says them', () => {
    const edit = perspectiveTool.activate!(host()).confirm() as PerspectiveEdit
    const corners = scaleQuad(edit.quad, frame.width, frame.height)
    expect(edit.aspectRatio).toBeCloseTo(estimateAspectRatio(corners, frame))
  })

  it('uses the proportions the consumer knows', () => {
    const edit = perspectiveTool.activate!(host({
      aspectRatio: () => 0.7,
    })).confirm() as PerspectiveEdit
    expect(edit.aspectRatio).toBe(0.7)
  })

  it('estimates with the place of the image in the photo', () => {
    const photo = { width: 4000, height: 3000 }
    const edit = perspectiveTool.activate!(host({
      photoFrame: () => ({
        photo,
        origin: { x: 3000, y: 100 },
      }),
    })).confirm() as PerspectiveEdit
    const moved = scaleQuad(edit.quad, frame.width, frame.height).map(({ x, y }) => ({ x: x + 3000, y: y + 100 })) as unknown as Quad
    expect(edit.aspectRatio).toBeCloseTo(estimateAspectRatio(moved, photo))
  })
})
