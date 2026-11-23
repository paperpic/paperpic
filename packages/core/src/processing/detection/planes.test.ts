import { describe, expect, it } from 'vitest'
import { painted } from '../../test/photos'
import { blur, closing, mapChannels, shrink } from './planes'

/** A plane drawn as text, one row per line and one character per pixel: `#` dark and `.` bright. */
function plane(rows: readonly string[]): Float32Array {
  return Float32Array.from(rows.join(''), pixel => pixel === '#'
    ? 20
    : 200)
}

function draw(values: Float32Array, width: number): string[] {
  const pixels = Array.from(values, value => value === 20
    ? '#'
    : '.').join('')
  return Array.from({ length: values.length / width }, (_, row) => pixels.slice(row * width, (row + 1) * width))
}

describe('shrink', () => {
  it('takes the mean of the pixels behind each one, with a plane for each channel', () => {
    const planes = shrink(painted({ width: 4, height: 2 }, (x, y) => [
      x * 10,
      y * 10,
      x < 2
        ? 0
        : 100,
    ]), 2)
    expect(planes).toMatchObject({ width: 2, height: 1 })
    expect(planes.channels.map(channel => [...channel])).toEqual([
      [5, 25],
      [5, 5],
      [0, 100],
    ])
  })

  it('keeps the proportions, and the size of an image that already fits', () => {
    expect(shrink(painted({ width: 1000, height: 500 }, () => [0, 0, 0]), 256)).toMatchObject({ width: 256, height: 128 })
    expect(shrink(painted({ width: 30, height: 20 }, () => [0, 0, 0]), 256)).toMatchObject({ width: 30, height: 20 })
    expect(shrink(painted({ width: 600, height: 1 }, () => [0, 0, 0]), 256)).toMatchObject({ width: 256, height: 1 })
  })
})

describe('mapChannels', () => {
  it('runs on each channel, with the size of the image', () => {
    const planes = shrink(painted({ width: 3, height: 2 }, () => [1, 2, 3]), 8)
    const doubled = mapChannels(planes, (channel, { width, height }) => {
      expect([width, height]).toEqual([3, 2])
      return channel.map(value => value * 2)
    })
    expect(doubled.channels.map(([first]) => first)).toEqual([2, 4, 6])
    expect(planes.channels.map(([first]) => first)).toEqual([1, 2, 3])
  })
})

describe('closing', () => {
  it('removes the dark details narrower than twice the radius, and keeps the wider ones as they are', () => {
    const rows = [
      '............',
      '.#.......##.',
      '.#..####.##.',
      '....####....',
      '....####.#..',
      '....####....',
      '............',
      '............',
    ]
    expect(draw(closing(plane(rows), { width: 12, height: 8 }, 1), 12)).toEqual([
      '............',
      '............',
      '....####....',
      '....####....',
      '....####....',
      '....####....',
      '............',
      '............',
    ])
  })

  it('keeps a dark area that touches the border', () => {
    const rows = [
      '###....',
      '###....',
      '###..#.',
      '.......',
    ]
    expect(draw(closing(plane(rows), { width: 7, height: 4 }, 1), 7)).toEqual([
      '###....',
      '###....',
      '###....',
      '.......',
    ])
  })

  it('works with a radius larger than the image', () => {
    expect([
      ...closing(plane(['#.', '.#']), { width: 2, height: 2 }, 4),
    ]).toEqual([200, 200, 200, 200])
  })
})

describe('blur', () => {
  it('spreads a pixel over its neighbours, and keeps the total', () => {
    const source = new Float32Array(49)
    source[24] = 256
    const blurred = blur(source, { width: 7, height: 7 })
    expect(blurred[24]).toBe(36)
    expect(blurred[23]).toBe(24)
    expect(blurred[17]).toBe(24)
    expect(blurred[22]).toBe(6)
    expect(blurred.reduce((sum, value) => sum + value)).toBe(256)
  })

  it('keeps a flat area flat, up to the border', () => {
    expect([
      ...blur(new Float32Array(12).fill(80), { width: 4, height: 3 }),
    ]).toEqual(Array.from({ length: 12 }).fill(80))
  })
})
