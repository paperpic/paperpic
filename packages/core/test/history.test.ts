import { describe, expect, it } from 'vitest'
import { netRotation, toPipelineSteps } from '../src/pipeline/operations'
import { applySteps } from '../src/pipeline/pipeline'
import { rotatePixels } from '../src/processing/rotate'
import { addToHistory, createHistory, redoHistory, undoHistory } from '../src/state/history'

const left = { type: 'rotate', direction: -1 } as const
const right = { type: 'rotate', direction: 1 } as const

describe('history', () => {
  it('undoes and redoes in order', () => {
    let history = addToHistory(addToHistory(createHistory<string>(), 'a'), 'b')
    history = undoHistory(history)
    expect(history).toEqual({
      done: ['a'],
      undone: ['b'],
    })
    history = undoHistory(history)
    expect(history).toEqual({
      done: [],
      undone: ['b', 'a'],
    })
    history = redoHistory(history)
    expect(history).toEqual({
      done: ['a'],
      undone: ['b'],
    })
  })

  it('loses what could be redone when a new edit arrives', () => {
    const undone = undoHistory(addToHistory(createHistory<string>(), 'a'))
    expect(addToHistory(undone, 'b')).toEqual({
      done: ['b'],
      undone: [],
    })
  })

  it('does nothing when there is nothing to undo or redo', () => {
    const empty = createHistory<string>()
    expect(undoHistory(empty)).toBe(empty)
    expect(redoHistory(empty)).toBe(empty)
  })
})

describe('operations', () => {
  it('adds up the rotation', () => {
    expect(netRotation([])).toBe(0)
    expect(netRotation([right])).toBe(90)
    expect(netRotation([left])).toBe(270)
    expect(netRotation([right, right, left])).toBe(90)
  })

  it('leaves no steps when the rotations cancel out', () => {
    expect(toPipelineSteps([right, left])).toEqual([])
    expect(toPipelineSteps([right, right, right, right])).toEqual([])
  })

  it('merges rotations into one step', () => {
    expect(toPipelineSteps([right, right])).toEqual([
      { type: 'rotate', rotation: 180 },
    ])
  })
})

describe('rotatePixels', () => {
  // 3×2 image where each pixel holds its own index in every channel
  //   0 1 2
  //   3 4 5
  const image = () => ({
    data: new Uint8ClampedArray([0, 1, 2, 3, 4, 5].flatMap(value => [value, value, value, 255])),
    width: 3,
    height: 2,
  })
  const indexes = ({ data }: { data: Uint8ClampedArray }) => [...data].filter((_, index) => index % 4 === 0)

  it('turns 90 degrees clockwise', () => {
    const result = rotatePixels(image(), 90)
    expect([result.width, result.height]).toEqual([2, 3])
    expect(indexes(result)).toEqual([3, 0, 4, 1, 5, 2])
  })

  it('turns 180 degrees', () => {
    const result = rotatePixels(image(), 180)
    expect([result.width, result.height]).toEqual([3, 2])
    expect(indexes(result)).toEqual([5, 4, 3, 2, 1, 0])
  })

  it('turns 270 degrees clockwise', () => {
    const result = rotatePixels(image(), 270)
    expect([result.width, result.height]).toEqual([2, 3])
    expect(indexes(result)).toEqual([2, 5, 1, 4, 0, 3])
  })

  it('keeps the whole pixel, alpha included', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 40, 50, 60, 70, 80])
    expect([
      ...rotatePixels({ data, width: 2, height: 1 }, 180).data,
    ]).toEqual([50, 60, 70, 80, 10, 20, 30, 40])
  })

  it('comes back to the start after four turns', () => {
    const start = image()
    const half = rotatePixels(rotatePixels(start, 90), 90)
    expect(rotatePixels(rotatePixels(half, 90), 90).data).toEqual(start.data)
  })
})

describe('applySteps', () => {
  it('returns the same pixels without steps', () => {
    const source = {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
    }
    expect(applySteps(source, [])).toBe(source)
  })

  it('runs the steps', () => {
    const source = {
      data: new Uint8ClampedArray(8),
      width: 2,
      height: 1,
    }
    expect(applySteps(source, [
      { type: 'rotate', rotation: 90 },
    ])).toMatchObject({ width: 1, height: 2 })
  })
})
