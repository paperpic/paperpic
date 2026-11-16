import type { Quad } from '../processing/types'
import { describe, expect, it } from 'vitest'
import { photoFrame } from './photo-frame'

const image = { width: 1000, height: 500 }
const crop = {
  type: 'crop',
  rect: {
    x: 0.5,
    y: 0.2,
    width: 0.5,
    height: 0.5,
  },
} as const

describe('photoFrame', () => {
  it('is the whole photo without steps', () => {
    expect(photoFrame(image, [])).toEqual({
      photo: image,
      origin: { x: 0, y: 0 },
    })
  })

  it('follows a crop back to the photo', () => {
    expect(photoFrame(image, [crop, crop])).toEqual({
      photo: image,
      origin: { x: 750, y: 150 },
    })
  })

  it('turns the photo with a rotation', () => {
    expect(photoFrame(image, [
      crop,
      { type: 'rotate', rotation: 90 },
    ])).toEqual({
      photo: { width: 500, height: 1000 },
      origin: { x: 150, y: 500 },
    })
  })

  it('mirrors the origin with a flip', () => {
    expect(photoFrame(image, [
      { type: 'flip' },
      crop,
    ])).toEqual({
      photo: image,
      origin: { x: 500, y: 100 },
    })
  })

  it('counts the result of a perspective change as a new photo', () => {
    const quad: Quad = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]
    const frame = photoFrame(image, [
      crop,
      { type: 'perspective', quad, aspectRatio: 4 },
    ])
    expect(frame.origin).toEqual({ x: 0, y: 0 })
    expect(frame.photo.width / frame.photo.height).toBeCloseTo(4, 1)
  })

  it('ignores the tones', () => {
    expect(photoFrame(image, [
      { type: 'adjust', brightness: 1, contrast: 0 },
      { type: 'threshold', sensitivity: 0.5, softness: 0 },
    ])).toEqual(photoFrame(image, []))
  })
})
