import type { Rotation } from '../src/rotation'
import { describe, expect, it } from 'vitest'
import { computeTransform, imageToViewport, viewportToImage } from '../src/render/transform'
import { createView } from '../src/state/view'

const viewport = { width: 300, height: 150 }
const image = { width: 600, height: 250 }

describe('computeTransform', () => {
  it('centers the image at a small zoom', () => {
    const transform = computeTransform({
      ...createView(),
      zoom: 0.1,
    }, image, viewport)
    expect(imageToViewport(transform, { x: 0, y: 0 })).toEqual({ x: 120, y: 62.5 })
    expect(imageToViewport(transform, { x: 600, y: 250 })).toEqual({ x: 180, y: 87.5 })
  })

  it('keeps a rotated image centered, with its sides swapped', () => {
    const transform = computeTransform({
      ...createView(),
      zoom: 0.1,
      rotation: 90,
    }, image, viewport)
    // The top left corner of the image ends at the top right corner of the rotated image
    expect(imageToViewport(transform, { x: 0, y: 0 })).toEqual({ x: 162.5, y: 45 })
    expect(imageToViewport(transform, { x: 600, y: 250 })).toEqual({ x: 137.5, y: 105 })
  })

  it('applies the pan', () => {
    const transform = computeTransform({
      ...createView(),
      zoom: 1,
      panX: 10,
      panY: -20,
    }, image, viewport)
    expect(imageToViewport(transform, { x: 300, y: 125 })).toEqual({ x: 160, y: 55 })
  })

  it.each<Rotation>([0, 90, 180, 270])('always sends the center of the image to the center of the viewport, at %d degrees', (rotation) => {
    const transform = computeTransform({
      ...createView(),
      zoom: 0.7,
      rotation,
    }, image, viewport)
    expect(imageToViewport(transform, { x: 300, y: 125 })).toEqual({ x: 150, y: 75 })
  })
})

describe('viewportToImage', () => {
  it.each<Rotation>([0, 90, 180, 270])('undoes the transform at %d degrees', (rotation) => {
    const transform = computeTransform({
      ...createView(),
      zoom: 1.5,
      panX: 12,
      panY: -7,
      rotation,
    }, image, viewport)
    const point = { x: 123, y: 45 }
    const back = viewportToImage(transform, imageToViewport(transform, point))
    expect(back.x).toBeCloseTo(point.x)
    expect(back.y).toBeCloseTo(point.y)
  })
})
