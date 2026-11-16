import { describe, expect, it } from 'vitest'
import { addToHistory, createHistory, redoHistory, undoHistory } from './history'

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
