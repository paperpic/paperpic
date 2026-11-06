import type { Scene } from '../src/render/renderer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Renderer } from '../src/render/renderer'
import { createView } from '../src/state/view'

describe('renderer', () => {
  const context = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
  }
  let canvas: HTMLCanvasElement
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
    const renderer = new Renderer(canvas, () => scene)
    renderer.resize({ width: 300, height: 150 }, 2)
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(300)
  })

  it('paints once per frame, however many changes arrive', () => {
    const renderer = new Renderer(canvas, () => scene)
    renderer.requestPaint()
    renderer.requestPaint()
    renderer.requestPaint()
    paint()
    expect(context.drawImage).toHaveBeenCalledOnce()

    renderer.requestPaint()
    paint()
    expect(context.drawImage).toHaveBeenCalledTimes(2)
  })

  it('draws through the transform, scaled to device pixels', () => {
    const renderer = new Renderer(canvas, () => scene)
    renderer.resize({ width: 300, height: 150 }, 2)
    paint()
    expect(context.setTransform).toHaveBeenLastCalledWith(1, 0, -0, 1, 0, 25)
    expect(context.drawImage).toHaveBeenCalledWith(scene!.image, 0, 0, 600, 250)
    expect(context.imageSmoothingQuality).toBe('high')
  })

  it('only clears when there is nothing to show', () => {
    scene = null
    const renderer = new Renderer(canvas, () => scene)
    renderer.requestPaint()
    paint()
    expect(context.clearRect).toHaveBeenCalled()
    expect(context.drawImage).not.toHaveBeenCalled()
  })

  it('cancels a pending paint when destroyed', () => {
    const renderer = new Renderer(canvas, () => scene)
    renderer.requestPaint()
    renderer.destroy()
    paint()
    expect(context.drawImage).not.toHaveBeenCalled()
  })
})
