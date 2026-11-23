import type { Mock } from 'vitest'
import type { ToolHost } from './types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rectangleCorners } from '../processing/homography'
import { toolHost } from '../test/tool-host'
import { DEFAULT_LABELS } from '../ui/labels'
import { boxCorners, boxOf, constrainToConvex, constrainToRectangle, constrainToTurnedRectangle, CornerEditor, initialCorners } from './corners'

const frame = { width: 1000, height: 500 }

describe('initialCorners', () => {
  it('starts inside the image', () => {
    expect(initialCorners(frame)).toEqual(rectangleCorners(100, 50, 900, 450))
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

describe('constrainToConvex', () => {
  const corners = rectangleCorners(100, 100, 300, 300)

  it('moves only that corner', () => {
    expect(constrainToConvex(corners, 0, { x: 50, y: 60 }, frame)).toEqual([
      { x: 50, y: 60 },
      corners[1],
      corners[2],
      corners[3],
    ])
  })

  it('stays inside the frame', () => {
    expect(constrainToConvex(corners, 2, { x: 5000, y: -90 }, frame)[2]).toEqual({ x: 1000, y: 300 })
  })

  it('never crosses, and slides along the side that still allows it', () => {
    // Past the opposite side in x only: y still applies
    expect(constrainToConvex(corners, 0, { x: 700, y: 60 }, frame)[0]).toEqual({ x: 100, y: 60 })
  })

  it('stays where it was when nothing allows the move', () => {
    expect(constrainToConvex(corners, 0, { x: 700, y: 700 }, frame)).toBe(corners)
  })

  it('never leaves a concave shape', () => {
    // Inside the triangle of the other three corners. It slides along the top side instead
    expect(constrainToConvex(corners, 0, { x: 280, y: 280 }, frame)[0]).toEqual({ x: 280, y: 100 })
  })
})

describe('constrainToTurnedRectangle', () => {
  const turned = boxCorners({
    center: { x: 500, y: 250 },
    width: 200,
    height: 100,
    angle: Math.PI / 6,
  })

  it('resizes along the turned sides, and the opposite corner stays', () => {
    const across = {
      x: Math.cos(Math.PI / 6),
      y: Math.sin(Math.PI / 6),
    }
    const down = {
      x: -Math.sin(Math.PI / 6),
      y: Math.cos(Math.PI / 6),
    }
    // 50 more across and 20 more down, plus a little that the turned sides throw away
    const target = {
      x: turned[2].x + across.x * 50 + down.x * 20,
      y: turned[2].y + across.y * 50 + down.y * 20,
    }
    const resized = constrainToTurnedRectangle(turned, 2, target, frame)
    const box = boxOf(resized)
    expect(resized[0].x).toBeCloseTo(turned[0].x)
    expect(resized[0].y).toBeCloseTo(turned[0].y)
    expect(box.angle).toBeCloseTo(Math.PI / 6)
    expect(box.width).toBeCloseTo(250)
    expect(box.height).toBeCloseTo(120)
  })

  it('never turns inside out, and keeps the smallest size', () => {
    const box = boxOf(constrainToTurnedRectangle(turned, 2, turned[0], frame))
    expect(box.width).toBeCloseTo(16)
    expect(box.height).toBeCloseTo(16)
    expect(box.angle).toBeCloseTo(Math.PI / 6)
  })

  it('keeps the dragged corner inside the image', () => {
    const level = rectangleCorners(100, 100, 300, 200)
    expect(constrainToTurnedRectangle(level, 2, { x: 5000, y: 5000 }, frame)[2]).toEqual({ x: 1000, y: 500 })
  })
})

describe('cornerEditor', () => {
  let host: ToolHost & {
    announce: Mock<ToolHost['announce']>
    paintMagnifier: Mock<ToolHost['paintMagnifier']>
    reveal: Mock<ToolHost['reveal']>
    selectionMoved: Mock<ToolHost['selectionMoved']>
    setHint: Mock<ToolHost['setHint']>
  }
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
    host = toolHost(frame, {
      layer,
      frameToViewport: ({ x, y }) => ({ x: x / 2, y: y / 2 }),
      viewportToFrame: ({ x, y }) => ({ x: x * 2, y: y * 2 }),
      reveal: vi.fn(),
      requestPaint: vi.fn(),
      setHint: vi.fn(),
      announce: vi.fn(),
      paintMagnifier: vi.fn(),
      selectionMoved: vi.fn(),
    }) as typeof host
  })

  const editor = () => new CornerEditor(host, rectangleCorners(100, 100, 300, 300), constrainToRectangle)
  const handles = () => [
    ...layer.querySelectorAll<HTMLButtonElement>('.paperpic-handle'),
  ]

  it('tells whether a corner is off its start, and that it moved', () => {
    const corners = editor()
    expect(corners.moved).toBe(false)
    expect(host.selectionMoved).not.toHaveBeenCalled()
    press(handles()[0]!, 'ArrowRight')
    expect(corners.moved).toBe(true)
    expect(host.selectionMoved).toHaveBeenCalledOnce()
    press(handles()[0]!, 'ArrowLeft')
    expect(corners.moved).toBe(false)
  })

  it('is back at its start after moving there and back, whatever the zoom rounds', () => {
    host.frameToViewport = ({ x, y }) => ({ x: x * 0.3819 + 7.3, y: y * 0.3819 + 7.3 })
    host.viewportToFrame = ({ x, y }) => ({ x: (x - 7.3) / 0.3819, y: (y - 7.3) / 0.3819 })
    const corners = editor()
    for (const key of [
      'ArrowRight',
      'ArrowRight',
      'ArrowLeft',
      'ArrowLeft',
    ]) {
      press(handles()[0]!, key)
    }
    expect(corners.points).not.toEqual(rectangleCorners(100, 100, 300, 300))
    expect(corners.moved).toBe(false)
  })

  describe('suggesting corners', () => {
    const suggestion = rectangleCorners(200, 120, 700, 400)

    const preferMotion = (allowed: boolean) => vi.stubGlobal('matchMedia', (query: string) => ({
      matches: allowed && query === '(prefers-reduced-motion: no-preference)',
    }))
    const sliding = () => handles().map(handle => handle.classList.contains('paperpic-handle-sliding'))

    beforeEach(() => {
      HTMLElement.prototype.setPointerCapture = vi.fn()
      preferMotion(false)
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })

    it('moves the corners and their handles, and paints them', () => {
      const corners = editor()
      vi.mocked(host.requestPaint).mockClear()
      expect(corners.suggest(suggestion)).toBe(true)
      expect(corners.points).toEqual(suggestion)
      expect([handles()[2]!.style.left, handles()[2]!.style.top]).toEqual(['350px', '200px'])
      expect(host.requestPaint).toHaveBeenCalledOnce()
    })

    it('keeps the corner with the focus on screen', () => {
      const corners = editor()
      corners.focus()
      vi.mocked(host.reveal).mockClear()
      corners.suggest(suggestion)
      expect(host.reveal).toHaveBeenCalledExactlyOnceWith(suggestion[0])
    })

    it('leaves the view alone when no corner has the focus', () => {
      editor().suggest(suggestion)
      expect(host.reveal).not.toHaveBeenCalled()
    })

    it.each([
      [
        'a pressed handle',
        () => handles()[1]!.dispatchEvent(Object.assign(new MouseEvent('pointerdown', { bubbles: true }), { pointerId: 1, pointerType: 'touch' })),
      ],
      [
        'a selected corner',
        () => handles()[1]!.click(),
      ],
      [
        'a corner moved with the keyboard',
        () => press(handles()[1]!, 'ArrowDown'),
      ],
    ])('leaves the corners alone after %s', (_, touch) => {
      const corners = editor()
      touch()
      const before = corners.points
      expect(corners.suggest(suggestion)).toBe(false)
      expect(corners.points).toBe(before)
    })

    describe('with motion', () => {
      let now: number
      const moveTo = vi.fn()
      const context = {
        beginPath: vi.fn(),
        moveTo,
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
      } as unknown as CanvasRenderingContext2D

      beforeEach(() => {
        now = 1000
        moveTo.mockClear()
        vi.spyOn(performance, 'now').mockImplementation(() => now)
        preferMotion(true)
      })

      it('slides on screen from where they were, with the corners in place at once', () => {
        const corners = editor()
        corners.suggest(suggestion)
        expect(corners.points).toEqual(suggestion)
        // From 100 in the image, which is 50 on screen, to 200, which is 100
        expect(handles()[0]!.style.left).toBe('50px')
        expect(sliding()).toEqual([true, true, true, true])

        now += 125
        vi.mocked(host.requestPaint).mockClear()
        corners.drawOverlay(context)
        expect(Number.parseFloat(handles()[0]!.style.left)).toBeCloseTo(93.75)
        expect(moveTo.mock.calls[1]![0]).toBeCloseTo(93.75)
        expect(host.requestPaint).toHaveBeenCalledOnce()

        now += 125
        vi.mocked(host.requestPaint).mockClear()
        corners.drawOverlay(context)
        expect(handles()[0]!.style.left).toBe('100px')
        expect(sliding()).toEqual([false, false, false, false])
        expect(host.requestPaint).not.toHaveBeenCalled()
      })

      it('ends as soon as the keyboard moves a corner, which goes on from its place', () => {
        const corners = editor()
        corners.suggest(suggestion)
        press(handles()[0]!, 'ArrowRight')
        expect(corners.points[0].x).toBe(202)
        expect(handles()[0]!.style.left).toBe('101px')
        expect(sliding()).toEqual([false, false, false, false])
      })

      it('follows the zoom and the position of the image on the way', () => {
        const corners = editor()
        corners.suggest(suggestion)
        host.frameToViewport = ({ x, y }) => ({ x, y })
        corners.update()
        expect(handles()[0]!.style.left).toBe('100px')
      })
    })

    it('jumps when the browser cannot tell whether the user accepts motion', () => {
      vi.stubGlobal('matchMedia', undefined)
      editor().suggest(suggestion)
      expect(handles()[0]!.style.left).toBe('100px')
      expect(sliding()).toEqual([false, false, false, false])
    })

    it('moves the corners while a handle only has the focus', () => {
      const corners = editor()
      corners.focus()
      press(handles()[0]!, 'Tab')
      expect(corners.suggest(suggestion)).toBe(true)
    })
  })

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

  it('describes the keys on every handle, for screen readers, since the hint on screen speaks to a pointer', () => {
    editor()
    const ids = new Set(handles().map(handle => handle.getAttribute('aria-describedby')))
    expect(ids.size).toBe(1)
    const description = document.getElementById([...ids][0]!)!
    expect(description.textContent).toBe(DEFAULT_LABELS.cornerKeys)
    expect(description.hidden).toBe(true)
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
      expect(host.selectionMoved).not.toHaveBeenCalled()

      handle.dispatchEvent(pointer('pointerup', 175, 180))
      expect(host.selectionMoved).toHaveBeenCalledOnce()
      expect(host.announce).toHaveBeenCalledWith('Bottom right corner: 320, 320')
      handle.dispatchEvent(pointer('pointermove', 300, 300))
      expect(corners.points[2]).toEqual({ x: 320, y: 320 })
    })

    it('shows the magnifier only with touch', () => {
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
      expect(host.paintMagnifier).not.toHaveBeenCalled()
      handle.dispatchEvent(pointer('pointerup', 160, 170))

      handle.dispatchEvent(pointer('pointerdown', 160, 170, 'touch'))
      corners.drawOverlay(context)
      expect(host.paintMagnifier).toHaveBeenCalledOnce()
      expect(handles().map(({ hidden }) => hidden)).toEqual([true, true, false, true])
      expect(host.paintMagnifier.mock.calls[0]![1].point).toEqual(corners.points[2])

      handle.dispatchEvent(pointer('pointerup', 160, 170, 'touch'))
      corners.drawOverlay(context)
      expect(host.paintMagnifier).toHaveBeenCalledOnce()
      expect(handles().map(({ hidden }) => hidden)).toEqual([false, false, false, false])
    })
  })

  describe('placing without dragging', () => {
    const pressed = () => handles().map(handle => handle.getAttribute('aria-pressed'))
    const hint = 'Bottom right corner: tap where it goes'
    // A pointer clicks with the number of clicks, and the keyboard with 0, like `click()`
    const pointerClick = (handle: Element) => handle.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))

    beforeEach(() => {
      HTMLElement.prototype.setPointerCapture = vi.fn()
    })

    it('selects a pressed corner, and says what comes next', () => {
      editor()
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])

      handles()[2]!.click()
      expect(pressed()).toEqual(['false', 'false', 'true', 'false'])
      expect(host.setHint).toHaveBeenLastCalledWith(hint)
      expect(host.announce).toHaveBeenLastCalledWith(hint)
    })

    it('moves the selected corner to the next tap, announces it and lets it go', () => {
      const corners = editor()
      expect(corners.place({ x: 10, y: 10 })).toBe(false)

      handles()[2]!.click()
      // 200, 210 in the viewport is 400, 420 in the image
      expect(corners.place({ x: 200, y: 210 })).toBe(true)
      expect(corners.points[2]).toEqual({ x: 400, y: 420 })
      expect(handles()[2]!.style.left).toBe('200px')
      expect(host.announce).toHaveBeenLastCalledWith('Bottom right corner: 400, 420')
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])
      expect(host.setHint).toHaveBeenLastCalledWith(null)
      expect(corners.place({ x: 10, y: 10 })).toBe(false)
    })

    it('keeps the rules of the tool for a placed corner', () => {
      const corners = editor()
      handles()[0]!.click()
      corners.place({ x: 500, y: 500 })
      expect(corners.points).toEqual(rectangleCorners(284, 284, 300, 300))
    })

    it('lets go of a corner pressed again, and switches to another corner', () => {
      editor()
      handles()[2]!.click()
      handles()[2]!.click()
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])
      expect(host.setHint).toHaveBeenLastCalledWith(null)

      handles()[2]!.click()
      handles()[0]!.click()
      expect(pressed()).toEqual(['true', 'false', 'false', 'false'])
    })

    it('lets go with deselect, which says whether a corner was selected', () => {
      const corners = editor()
      expect(corners.deselect()).toBe(false)
      handles()[1]!.click()
      expect(corners.deselect()).toBe(true)
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])
    })

    it('takes a short movement for a tap, which selects without moving the corner', () => {
      const corners = editor()
      const handle = handles()[2]!
      handle.dispatchEvent(pointer('pointerdown', 160, 170, 'touch'))
      handle.dispatchEvent(pointer('pointermove', 163, 172, 'touch'))
      handle.dispatchEvent(pointer('pointerup', 163, 172, 'touch'))
      pointerClick(handle)

      expect(corners.points[2]).toEqual({ x: 300, y: 300 })
      expect(handle.style.left).toBe('150px')
      expect(pressed()[2]).toBe('true')
      expect(host.announce).toHaveBeenLastCalledWith(hint)
      expect(host.selectionMoved).not.toHaveBeenCalled()
    })

    it('does not select a corner at the end of a drag, and a drag lets go of the selection', () => {
      editor()
      handles()[0]!.click()
      const handle = handles()[2]!
      handle.dispatchEvent(pointer('pointerdown', 165, 170))
      handle.dispatchEvent(pointer('pointermove', 185, 190))
      handle.dispatchEvent(pointer('pointerup', 185, 190))
      pointerClick(handle)
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])

      handle.click()
      expect(pressed()[2]).toBe('true')
    })

    it('ignores the click of a tap on the image, which lands on the corner the tap moved there', () => {
      const corners = editor()
      handles()[2]!.click()
      corners.place({ x: 200, y: 210 })
      pointerClick(handles()[2]!)
      expect(pressed()).toEqual(['false', 'false', 'false', 'false'])
    })

    it('lets go of the selection when it closes', () => {
      const corners = editor()
      handles()[3]!.click()
      corners.deactivate()
      expect(host.setHint).toHaveBeenLastCalledWith(null)
    })
  })

  it('removes its handles and their description', () => {
    editor().deactivate()
    expect(handles()).toEqual([])
    expect(layer.children).toHaveLength(0)
  })
})
