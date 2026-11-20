import type { Point } from './types'
import { describe, expect, it } from 'vitest'
import { filled, picture } from '../test/images'
import { rectangleCorners } from './homography'
import { clipPolygon, redactPixels } from './redact'

/** A gray image of 10 by 10 pixels, half transparent, so any covered pixel shows. */
function image() {
  return filled(10, 10, [120, 120, 120, 128])
}

function square(left: number, top: number, right: number, bottom: number): Point[] {
  return [
    ...rectangleCorners(left, top, right, bottom),
  ]
}

describe('redactPixels', () => {
  it('fills a rectangle with opaque black', () => {
    const covered = redactPixels(image(), [
      {
        color: 'black',
        points: square(0.2, 0.3, 0.5, 0.6),
      },
    ])
    expect(picture(covered)).toEqual([
      '----------',
      '----------',
      '----------',
      '--###-----',
      '--###-----',
      '--###-----',
      '----------',
      '----------',
      '----------',
      '----------',
    ])
    expect(covered.data[(3 * 10 + 2) * 4 + 3]).toBe(255)
  })

  it('fills with white, in place, so a large photo is not copied', () => {
    const source = image()
    const covered = redactPixels(source, [
      {
        color: 'white',
        points: square(0, 0, 0.1, 0.1),
      },
    ])
    expect(picture(covered)[0]).toBe('.---------')
    expect(covered).toBe(source)
    expect(covered.data[3]).toBe(255)
  })

  it('covers every pixel that an edge crosses, so nothing peeks out', () => {
    const covered = redactPixels(image(), [
      {
        color: 'black',
        points: square(0.25, 0.25, 0.45, 0.45),
      },
    ])
    expect(picture(covered).slice(1, 6)).toEqual([
      '----------',
      '--###-----',
      '--###-----',
      '--###-----',
      '----------',
    ])
  })

  it('fills a turned shape', () => {
    const diamond = [
      { x: 0.5, y: 0 },
      { x: 1, y: 0.5 },
      { x: 0.5, y: 1 },
      { x: 0, y: 0.5 },
    ]
    const rows = picture(redactPixels(image(), [
      { color: 'black', points: diamond },
    ]))
    expect(rows[0]).toBe('----##----')
    expect(rows[4]).toBe('##########')
    expect(rows[9]).toBe('----##----')
  })

  it('keeps to the image when an area goes past it', () => {
    const covered = redactPixels(image(), [
      {
        color: 'black',
        points: square(-1, 0.9, 2, 3),
      },
    ])
    expect(picture(covered)[9]).toBe('##########')
    expect(covered.data).toHaveLength(400)
  })
})

describe('clipPolygon', () => {
  it('keeps the part inside the clip', () => {
    const clipped = clipPolygon(square(0.5, 0.5, 2, 2), square(0, 0, 1, 1))
    expect(clipped).toHaveLength(4)
    for (const { x, y } of clipped) {
      expect(x).toBeGreaterThanOrEqual(0.5)
      expect(x).toBeLessThanOrEqual(1)
      expect(y).toBeGreaterThanOrEqual(0.5)
      expect(y).toBeLessThanOrEqual(1)
    }
  })

  it('works with a clip whose corners go the other way around', () => {
    const clip = square(0, 0, 1, 1).reverse()
    expect(clipPolygon(square(0.2, 0.2, 0.4, 0.4), clip)).toEqual(square(0.2, 0.2, 0.4, 0.4))
  })

  it('leaves nothing when the shapes do not meet', () => {
    expect(clipPolygon(square(2, 2, 3, 3), square(0, 0, 1, 1))).toEqual([])
  })
})
