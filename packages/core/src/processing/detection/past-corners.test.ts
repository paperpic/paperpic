import type { Quad } from '../types'
import { describe, expect, it } from 'vitest'
import { painted, sheetPhoto } from '../../test/photos'
import { rectangleCorners } from '../homography'
import { findEdges } from './edges'
import { measurePastCorners } from './past-corners'
import { shrink } from './planes'

const size = { width: 160, height: 120 }
const sheet = rectangleCorners(30, 30, 130, 90)
const measure = (quad: Quad, image = sheetPhoto(size, sheet, { text: false })) => measurePastCorners(quad, findEdges(shrink(image, 256)))

describe('measurePastCorners', () => {
  it('is none for the outline of a whole sheet', () => {
    const { pastCorner, pastSide } = measure(sheet)
    expect(pastCorner).toBeLessThan(0.2)
    expect(pastSide).toBeLessThan(0.2)
  })

  it.each([
    [
      'left',
      rectangleCorners(30, 30, 80, 90),
    ],
    [
      'right',
      rectangleCorners(80, 30, 130, 90),
    ],
    [
      'top',
      rectangleCorners(30, 30, 130, 60),
    ],
    [
      'bottom',
      rectangleCorners(30, 60, 130, 90),
    ],
  ])('is high for the %s half of a sheet, whose edges go on past the side where it ends', (_, half) => {
    const { pastCorner, pastSide } = measure(half)
    expect(pastCorner).toBeGreaterThan(0.9)
    expect(pastSide).toBeGreaterThan(0.9)
  })

  it('tells one side that goes on from two', () => {
    // The last corner is out of the left edge of the sheet, so only the top edge goes on past the left side
    const { pastCorner, pastSide } = measure([
      { x: 60, y: 30 },
      { x: 130, y: 30 },
      { x: 130, y: 90 },
      { x: 30, y: 90 },
    ])
    expect(pastCorner).toBeGreaterThan(0.9)
    expect(pastSide).toBeLessThan(0.2)
  })

  it('works on a sheet darker than the table', () => {
    const dark = sheetPhoto(size, sheet, {
      paper: [40, 40, 40],
      table: [210, 210, 210],
      text: false,
    })
    expect(measure(sheet, dark).pastSide).toBeLessThan(0.2)
    expect(measure(rectangleCorners(30, 30, 80, 90), dark).pastSide).toBeGreaterThan(0.9)
  })

  it('leaves out an edge that gets brighter the other way, such as that of a dark band past the corner', () => {
    // A white page between two bands of the opposite contrast, above and below
    const image = painted(size, (x, y) => {
      const inPage = x >= 30 && x < 130
      const inBand = y < 30 || y >= 90
      return inPage !== inBand
        ? [230, 230, 230]
        : [60, 60, 60]
    })
    expect(measure(sheet, image).pastSide).toBeLessThan(0.2)
  })

  it('leaves out what is past the border of the photo', () => {
    const { pastCorner, pastSide } = measure(rectangleCorners(0, 0, 159, 119), sheetPhoto(size, rectangleCorners(0, 0, 160, 120), { text: false }))
    expect(pastCorner).toBe(0)
    expect(pastSide).toBe(0)
  })
})
