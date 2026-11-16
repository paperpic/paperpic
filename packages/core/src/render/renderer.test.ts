import type { Scene } from './renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createView } from '../state/view'
import { Renderer } from './renderer'

describe('renderer', () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
  }
  const overlayContext = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
  }
  let canvas: HTMLCanvasElement
  let overlay: HTMLCanvasElement
  let frames: (() => void)[]
  let scene: Scene | null

  const paint = () => {
    const pending = frames
    frames = []
    pending.forEach(frame => frame())
  }

  beforeEach(() => {
    vi.clearAllMocks()
    frames = []
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => frames.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = []
    })
    canvas = document.createElement('canvas')
    canvas.getContext = (() => context) as unknown as HTMLCanvasElement['getContext']
    overlay = document.createElement('canvas')
    overlay.getContext = (() => overlayContext) as unknown as HTMLCanvasElement['getContext']
    scene = {
      image: {} as CanvasImageSource,
      imageSize: { width: 600, height: 250 },
      view: {
        ...createView(),
        zoom: 0.5,
      },
      viewport: { width: 300, height: 150 },
    }
  })

  afterEach(() => vi.unstubAllGlobals())

  it('sizes the canvas in device pixels', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.resize({ width: 300, height: 150 }, 2)
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(300)
  })

  it('paints once per frame, however many changes arrive', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.requestPaint()
    renderer.requestPaint()
    renderer.requestPaint()
    paint()
    expect(context.drawImage).toHaveBeenCalledOnce()

    renderer.requestPaint()
    paint()
    expect(context.drawImage).toHaveBeenCalledTimes(2)
  })

  it('keeps the canvas, and its pixels, when the size does not change', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.resize({ width: 300, height: 150 }, 2)
    const setWidth = vi.spyOn(canvas, 'width', 'set')
    renderer.resize({ width: 300, height: 150 }, 2)
    expect(setWidth).not.toHaveBeenCalled()
  })

  it('paints at once after a resize, and drops the paint of the next frame', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.requestPaint()
    renderer.resize({ width: 300, height: 150 }, 2)
    renderer.paintNow()
    expect(context.drawImage).toHaveBeenCalledOnce()
    paint()
    expect(context.drawImage).toHaveBeenCalledOnce()
  })

  it('draws through the transform, scaled to device pixels', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.resize({ width: 300, height: 150 }, 2)
    renderer.paintNow()
    expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, -0, 1, 0, 25)
    expect(context.drawImage).toHaveBeenCalledWith(scene!.image, 0, 0, 600, 250)
    expect(context.imageSmoothingQuality).toBe('high')
  })

  it('only clears when there is nothing to show', () => {
    scene = null
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.requestPaint()
    paint()
    expect(context.clearRect).toHaveBeenCalled()
    expect(context.drawImage).not.toHaveBeenCalled()
  })

  it('cancels a pending paint when destroyed', () => {
    const renderer = new Renderer(canvas, overlay, () => scene)
    renderer.requestPaint()
    renderer.destroy()
    paint()
    expect(context.drawImage).not.toHaveBeenCalled()
  })
})
