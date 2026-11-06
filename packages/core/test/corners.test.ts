import type { Mock } from 'vitest'
import type { ToolHost } from '../src/tools/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { constrainToRectangle, CornerEditor, initialCorners, rectangleCorners } from '../src/tools/corners'
import { cropTool } from '../src/tools/crop'
import { placeLens } from '../src/tools/magnifier'
import { DEFAULT_LABELS } from '../src/ui/labels'

const frame = { width: 1000, height: 500 }

describe('initialCorners', () => {
  it('starts inside the image', () => {
    expect(initialCorners(frame, null)).toEqual(rectangleCorners(100, 50, 900, 450))
  })

  it('stays clear of the toolbar', () => {
    expect(initialCorners(frame, { x: 800, y: 300 })).toEqual(rectangleCorners(100, 50, 800, 450))
  })

  it('ignores a toolbar that covers no corner', () => {
    expect(initialCorners(frame, { x: 950, y: 300 })).toEqual(rectangleCorners(100, 50, 900, 450))
    expect(initialCorners(frame, { x: 800, y: 20 })).toEqual(rectangleCorners(100, 50, 900, 450))
    expect(initialCorners(frame, { x: 50, y: 300 })).toEqual(rectangleCorners(100, 50, 900, 450))
  })
})

describe('constrainToRectangle', () => {
  const corners = rectangleCorners(100, 100, 300, 300)

  it('moves the two neighbours of a corner', () => {
    expect(constrainToRectangle(corners, 0, { x: 50, y: 60 }, frame)).toEqual(rectangleCorners(50, 60, 300, 300))
    expect(constrainToRectangle(corners, 2, { x: 400, y: 450 }, frame)).toEqual(rectangleCorners(100, 100, 400, 450))
    expect(constrainToRectangle(corners, 1, { x: 400, y: 60 }, frame)).toEqual(rectangleCorners(100, 60, 400, 300))
    expect(constrainToRectangle(corners, 3, { x: 50, y: 450 }, frame)).toEqual(rectangleCorners(50, 100, 300, 450))
  })

  it('stays inside the frame', () => {
    expect(constrainToRectangle(corners, 0, { x: -50, y: -60 }, frame)).toEqual(rectangleCorners(0, 0, 300, 300))
    expect(constrainToRectangle(corners, 2, { x: 5000, y: 5000 }, frame)).toEqual(rectangleCorners(100, 100, 1000, 500))
  })

  it('never turns inside out', () => {
    expect(constrainToRectangle(corners, 0, { x: 900, y: 450 }, frame)).toEqual(rectangleCorners(284, 284, 300, 300))
  })
})

describe('placeLens', () => {
  const viewport = { width: 400, height: 600 }

  it('goes above the finger', () => {
    const lens = placeLens({ x: 1, y: 2 }, { x: 200, y: 300 }, viewport)
    expect(lens.center.x).toBe(200)
    expect(lens.center.y).toBeLessThan(300 - lens.radius)
    expect(lens.point).toEqual({ x: 1, y: 2 })
  })

  it('goes below the finger at the top of the viewport', () => {
    const lens = placeLens({ x: 1, y: 2 }, { x: 200, y: 30 }, viewport)
    expect(lens.center.y).toBeGreaterThan(30 + lens.radius)
  })

  it('stays on screen at the sides', () => {
    const lens = placeLens({ x: 1, y: 2 }, { x: 395, y: 300 }, viewport)
    expect(lens.center.x + lens.radius).toBeLessThanOrEqual(400)
    expect(placeLens({ x: 1, y: 2 }, { x: 5, y: 300 }, viewport).center.x).toBe(lens.radius)
  })
})

describe('cornerEditor', () => {
  let host: ToolHost & { reveal: Mock<ToolHost['reveal']>, announce: Mock<ToolHost['announce']>, paintLens: Mock<ToolHost['paintLens']> }
  let layer: HTMLElement

  const press = (handle: Element, key: string, options = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    })
    handle.dispatchEvent(event)
    return event
  }

  beforeEach(() => {
    layer = document.createElement('div')
    layer.getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 400,
      height: 300,
    }) as DOMRect
    document.body.replaceChildren(layer)
    // Half a screen pixel per image pixel
    host = {
      layer,
      frameSize: () => frame,
      frameToViewport: ({ x, y }) => ({ x: x / 2, y: y / 2 }),
      viewportToFrame: ({ x, y }) => ({ x: x * 2, y: y * 2 }),
      toolbarCorner: () => null,
      reveal: vi.fn(),
      requestPaint: vi.fn(),
      announce: vi.fn(),
      labels: () => DEFAULT_LABELS,
      paintLens: vi.fn(),
    }
  })

  const editor = () => new CornerEditor(host, rectangleCorners(100, 100, 300, 300), constrainToRectangle)
  const handles = () => [
    ...layer.querySelectorAll<HTMLButtonElement>('.paperpic-handle'),
  ]

  it('creates four named handles at their positions', () => {
    editor()
    expect(handles().map(handle => handle.getAttribute('aria-label'))).toEqual([
      'Top left corner',
      'Top right corner',
      'Bottom right corner',
      'Bottom left corner',
    ])
    expect([handles()[2]!.style.left, handles()[2]!.style.top]).toEqual(['150px', '150px'])
  })

  it('takes the focus without scrolling', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    editor().focus()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    focus.mockRestore()
  })

  it('moves with the arrow keys by one screen pixel, or ten with Shift, and announces it', () => {
    const corners = editor()
    const event = press(handles()[2]!, 'ArrowRight')
    expect(event.defaultPrevented).toBe(true)
    expect(corners.points[2]).toEqual({ x: 302, y: 300 })
    expect(host.announce).toHaveBeenLastCalledWith('Bottom right corner: 302, 300')

    press(handles()[2]!, 'ArrowDown', { shiftKey: true })
    expect(corners.points[2]).toEqual({ x: 302, y: 320 })
    expect(handles()[2]!.style.top).toBe('160px')
  })

  it('keeps the arrow keys from panning the image', () => {
    const onKey = vi.fn()
    layer.addEventListener('keydown', onKey)
    editor()
    press(handles()[0]!, 'ArrowLeft')
    expect(onKey).not.toHaveBeenCalled()
    press(handles()[0]!, 'Enter')
    expect(onKey).toHaveBeenCalledOnce()
  })

  it('brings a corner that gets the focus on screen', () => {
    const corners = editor()
    handles()[1]!.dispatchEvent(new FocusEvent('focus'))
    expect(host.reveal).toHaveBeenCalledWith(corners.points[1])
  })

  const pointer = (type: string, clientX: number, clientY: number, pointerType = 'mouse') => Object.assign(new MouseEvent(type, { bubbles: true, clientX, clientY }), {
    pointerId: 1,
    pointerType,
  })

  describe('dragging', () => {
    beforeEach(() => {
      HTMLElement.prototype.setPointerCapture = vi.fn()
    })

    it('moves the corner without jumping to the pointer, and hides the drag from the viewer', () => {
      const corners = editor()
      const onDown = vi.fn()
      layer.addEventListener('pointerdown', onDown)
      const handle = handles()[2]!

      // The corner is at 150, 150 in the layer, which starts at 10, 20. The pointer grabs it 5 pixels off
      handle.dispatchEvent(pointer('pointerdown', 165, 170))
      expect(onDown).not.toHaveBeenCalled()
      handle.dispatchEvent(pointer('pointermove', 175, 180))
      expect(corners.points[2]).toEqual({ x: 320, y: 320 })
      expect(host.announce).not.toHaveBeenCalled()

      handle.dispatchEvent(pointer('pointerup', 175, 180))
      expect(host.announce).toHaveBeenCalledWith('Bottom right corner: 320, 320')
      handle.dispatchEvent(pointer('pointermove', 300, 300))
      expect(corners.points[2]).toEqual({ x: 320, y: 320 })
    })

    it('shows the lens only with touch', () => {
      const context = {} as CanvasRenderingContext2D
      Object.assign(context, {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
      })
      const corners = editor()
      const handle = handles()[2]!

      handle.dispatchEvent(pointer('pointerdown', 160, 170))
      corners.drawOverlay(context)
      expect(host.paintLens).not.toHaveBeenCalled()
      handle.dispatchEvent(pointer('pointerup', 160, 170))

      handle.dispatchEvent(pointer('pointerdown', 160, 170, 'touch'))
      corners.drawOverlay(context)
      expect(host.paintLens).toHaveBeenCalledOnce()
      expect(handles().map(({ hidden }) => hidden)).toEqual([true, true, false, true])
      expect(host.paintLens.mock.calls[0]![1].point).toEqual(corners.points[2])

      handle.dispatchEvent(pointer('pointerup', 160, 170, 'touch'))
      corners.drawOverlay(context)
      expect(host.paintLens).toHaveBeenCalledOnce()
      expect(handles().map(({ hidden }) => hidden)).toEqual([false, false, false, false])
    })
  })

  it('removes its handles', () => {
    editor().deactivate()
    expect(handles()).toEqual([])
  })

  describe('crop tool', () => {
    it('gives a rectangle as fractions of the image', () => {
      const session = cropTool.activate!(host)
      expect(session.confirm()).toEqual({
        type: 'crop',
        rect: {
          x: 0.1,
          y: 0.1,
          width: 0.8,
          height: 0.8,
        },
      })
    })

    it('gives nothing when the selection is the whole image', () => {
      const session = cropTool.activate!(host)
      for (const [index, [x, y]] of [
        [0, 0],
        [1000, 0],
        [1000, 500],
        [0, 500],
      ].entries()) {
        for (let times = 0; times < 60; times++) {
          press(handles()[index]!, x === 0
            ? 'ArrowLeft'
            : 'ArrowRight', { shiftKey: true })
          press(handles()[index]!, y === 0
            ? 'ArrowUp'
            : 'ArrowDown', { shiftKey: true })
        }
      }
      expect(session.confirm()).toBeNull()
    })
  })
})
