import { describe, expect, it } from 'vitest'
import { keyToCommand } from './keyboard'

describe('keyToCommand', () => {
  const key = (value: string, modifiers = {}) => ({
    shiftKey: false,
    key: value,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...modifiers,
  })

  it.each([
    ['+', 'zoomIn'],
    ['=', 'zoomIn'],
    ['-', 'zoomOut'],
    ['0', 'fit'],
    ['ArrowLeft', 'pan'],
  ])('maps %s to %s', (value, type) => {
    expect(keyToCommand(key(value))?.type).toBe(type)
  })

  it('moves the image the way the arrow points, so the view reveals what is beyond', () => {
    expect(keyToCommand(key('ArrowDown'))).toEqual({ type: 'pan', deltaX: 0, deltaY: -40 })
    expect(keyToCommand(key('ArrowRight'))).toEqual({ type: 'pan', deltaX: -40, deltaY: 0 })
  })

  it('leaves browser shortcuts and other keys alone', () => {
    expect(keyToCommand(key('+', { ctrlKey: true }))).toBeNull()
    expect(keyToCommand(key('0', { metaKey: true }))).toBeNull()
    expect(keyToCommand(key('a'))).toBeNull()
    expect(keyToCommand(key('c', { ctrlKey: true }))).toBeNull()
  })

  it('maps Undo and Redo on both platforms', () => {
    expect(keyToCommand(key('z', { ctrlKey: true }))?.type).toBe('undo')
    expect(keyToCommand(key('z', { metaKey: true }))?.type).toBe('undo')
    expect(keyToCommand(key('Z', { ctrlKey: true, shiftKey: true }))?.type).toBe('redo')
    expect(keyToCommand(key('y', { ctrlKey: true }))?.type).toBe('redo')
  })

  it('maps Esc and Enter', () => {
    expect(keyToCommand(key('Escape'))?.type).toBe('cancel')
    expect(keyToCommand(key('Enter'))?.type).toBe('apply')
  })
})
