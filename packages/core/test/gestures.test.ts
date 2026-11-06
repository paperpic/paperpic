import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { attachGestures } from '../src/input/gestures'
import { keyToCommand } from '../src/input/keyboard'

function pointer(type: string, id: number, x: number, y: number, timeStamp = 0, button = 0, pointerType = 'touch') {
  const event = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    button,
    bubbles: true,
  }) as unknown as PointerEvent
  Object.defineProperties(event, {
    pointerId: { value: id },
    pointerType: { value: pointerType },
    timeStamp: { value: timeStamp },
  })
  return event
}

describe('attachGestures', () => {
  let element: HTMLElement
  let detach: () => void
  let wheelZoom: boolean
  const handlers = {
    onPan: vi.fn(),
    onZoom: vi.fn(),
    onDoubleTap: vi.fn(),
    wheelZoom: () => wheelZoom,
  }

  beforeEach(() => {
    wheelZoom = true
    vi.clearAllMocks()
    element = document.createElement('div')
    element.setPointerCapture = vi.fn()
    detach = attachGestures(element, handlers)
  })

  afterEach(() => detach())

  it('pans with one pointer', () => {
    element.dispatchEvent(pointer('pointerdown', 1, 10, 10))
    element.dispatchEvent(pointer('pointermove', 1, 25, 5))
    expect(handlers.onPan).toHaveBeenCalledWith(15, -5)
    expect(element.setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('ignores movement without a press, and the other mouse buttons', () => {
    element.dispatchEvent(pointer('pointermove', 1, 25, 5))
    element.dispatchEvent(pointer('pointerdown', 2, 10, 10, 0, 2, 'mouse'))
    element.dispatchEvent(pointer('pointermove', 2, 20, 20))
    expect(handlers.onPan).not.toHaveBeenCalled()
  })

  it('zooms by the change of distance between two pointers, around their center', () => {
    element.dispatchEvent(pointer('pointerdown', 1, 0, 0))
    element.dispatchEvent(pointer('pointerdown', 2, 100, 0))
    element.dispatchEvent(pointer('pointermove', 2, 200, 0))
    expect(handlers.onZoom).toHaveBeenCalledWith(2, { x: 100, y: 0 })
  })

  it('recognizes a double tap, and not a slow or distant one', () => {
    element.dispatchEvent(pointer('pointerdown', 1, 50, 50, 0))
    element.dispatchEvent(pointer('pointerup', 1, 50, 50, 10))
    element.dispatchEvent(pointer('pointerdown', 1, 52, 50, 100))
    element.dispatchEvent(pointer('pointerup', 1, 52, 50, 110))
    expect(handlers.onDoubleTap).toHaveBeenCalledWith({ x: 52, y: 50 })

    handlers.onDoubleTap.mockClear()
    element.dispatchEvent(pointer('pointerdown', 1, 50, 50, 1000))
    element.dispatchEvent(pointer('pointerup', 1, 50, 50, 1010))
    element.dispatchEvent(pointer('pointerdown', 1, 50, 50, 2000))
    element.dispatchEvent(pointer('pointerup', 1, 50, 50, 2010))
    expect(handlers.onDoubleTap).not.toHaveBeenCalled()
  })

  it('does not take a drag for a tap', () => {
    element.dispatchEvent(pointer('pointerdown', 1, 0, 0, 0))
    element.dispatchEvent(pointer('pointermove', 1, 50, 0, 5))
    element.dispatchEvent(pointer('pointerup', 1, 50, 0, 10))
    element.dispatchEvent(pointer('pointerdown', 1, 50, 0, 50))
    element.dispatchEvent(pointer('pointerup', 1, 50, 0, 60))
    expect(handlers.onDoubleTap).not.toHaveBeenCalled()
  })

  it('forgets a pointer when the browser takes it over to scroll', () => {
    element.dispatchEvent(pointer('pointerdown', 1, 0, 0))
    element.dispatchEvent(pointer('pointercancel', 1, 0, 0))
    element.dispatchEvent(pointer('pointermove', 1, 50, 50))
    expect(handlers.onPan).not.toHaveBeenCalled()
  })

  it('zooms with the wheel and stops the page from scrolling', () => {
    const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
    Object.defineProperties(event, {
      clientX: { value: 5 },
      clientY: { value: 6 },
    })
    element.dispatchEvent(event)
    expect(handlers.onZoom.mock.calls[0]![0]).toBeCloseTo(Math.exp(0.2))
    expect(handlers.onZoom.mock.calls[0]![1]).toEqual({ x: 5, y: 6 })
    expect(event.defaultPrevented).toBe(true)
  })

  it('leaves the wheel to the page when wheelZoom is off', () => {
    wheelZoom = false
    const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
    element.dispatchEvent(event)
    expect(handlers.onZoom).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('stops listening once detached', () => {
    detach()
    element.dispatchEvent(pointer('pointerdown', 1, 0, 0))
    element.dispatchEvent(pointer('pointermove', 1, 50, 50))
    element.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))
    expect(handlers.onPan).not.toHaveBeenCalled()
    expect(handlers.onZoom).not.toHaveBeenCalled()
  })
})

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
