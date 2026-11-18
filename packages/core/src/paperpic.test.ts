import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from './index'
import { Toolbar } from './ui/toolbar'

interface FakeImage {
  decode: () => Promise<void>
  naturalHeight: number
  naturalWidth: number
  src: string
}

/** The images created so far, each waiting for the test to finish its decoding. */
let images: { image: FakeImage, reject: (reason: Error) => void, resolve: () => void }[]
let resizeCallback: () => void
/** The elements that the viewer asked the ResizeObserver to watch. */
let observed: Element[]
const disconnect = vi.fn()
const revoke = vi.fn()

async function flush() {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

async function finishLoading(index = images.length - 1) {
  images[index]!.resolve()
  await flush()
}

describe('paperPic', () => {
  let container: HTMLElement
  let pic: PaperPic

  const viewportOf = () => container.querySelector<HTMLElement>('.paperpic-viewport')!
  const toolbarOf = () => container.querySelector<HTMLElement>('.paperpic-toolbar')!
  const button = (label: string) => container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!

  beforeEach(() => {
    images = []
    observed = []
    disconnect.mockClear()
    revoke.mockClear()

    vi.stubGlobal('Image', class implements FakeImage {
      src = ''
      naturalWidth = 600
      naturalHeight = 250
      decode() {
        return new Promise<void>((resolve, reject) => {
          images.push({ image: this, resolve, reject })
        })
      }
    })
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) {
        resizeCallback = callback
      }

      observe(element: Element) {
        observed.push(element)
      }

      disconnect = disconnect
    })
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
    URL.createObjectURL = () => 'blob:fake'
    URL.revokeObjectURL = revoke

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 300 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 150 })

    container = document.createElement('div')
    document.body.replaceChildren(container)
  })

  afterEach(() => {
    pic?.destroy()
    vi.unstubAllGlobals()
  })

  it('explains how to fix a missing container', () => {
    expect(() => new PaperPic(null as unknown as HTMLElement)).toThrow(/once the element exists/)
  })

  it.each([
    [
      { softness: 2 },
      'softness must be between 0 and 1, got 2',
    ],
    [
      { aspectRatio: 0 },
      'aspectRatio must be width divided by height, such as 210 / 297 for A4, got 0',
    ],
    [
      { aspectRatio: Number.POSITIVE_INFINITY },
      'aspectRatio must be',
    ],
    [
      { maxOutputSize: -1 },
      'maxOutputSize must be a positive number of pixels, got -1',
    ],
    [
      { maxOutputSize: Number.NaN },
      'maxOutputSize must be a positive number of pixels, got NaN',
    ],
    [
      {
        output: { quality: 1.5 },
      },
      'output.quality must be between 0 and 1, got 1.5',
    ],
    [
      {
        output: { type: 'image/jpg' },
      },
      'output.type must be \'image/jpeg\', \'image/png\', \'image/webp\', got \'image/jpg\'',
    ],
  ])('explains an option out of its range: %o', (options, message) => {
    expect(() => new PaperPic(container, options)).toThrow(RangeError)
    expect(() => new PaperPic(container, options)).toThrow(message)
    expect(container.children).toHaveLength(0)

    pic = new PaperPic(container, { alt: 'A receipt' })
    expect(() => pic.setOptions({ alt: 'Another', ...options })).toThrow(message)
    expect(container.querySelector('canvas')!.getAttribute('aria-label')).toBe('A receipt')
  })

  it('takes every value in range, and undefined for the default', () => {
    pic = new PaperPic(container, {
      softness: 0,
      aspectRatio: 210 / 297,
      maxOutputSize: 2000,
      output: { type: 'image/webp', quality: 1 },
    })
    expect(() => pic.setOptions({
      softness: undefined,
      aspectRatio: undefined,
      maxOutputSize: undefined,
      output: undefined,
    })).not.toThrow()
    expect(() => pic.setOptions({ output: {} })).not.toThrow()
  })

  it('builds accessible markup', () => {
    pic = new PaperPic(container, { alt: 'A receipt' })

    expect(container.querySelector('canvas')!.getAttribute('role')).toBe('img')
    expect(container.querySelector('canvas')!.getAttribute('aria-label')).toBe('A receipt')
    expect(container.querySelector('canvas')!.hasAttribute('aria-hidden')).toBe(false)
    expect(viewportOf().tabIndex).toBe(0)
    expect(viewportOf().getAttribute('aria-label')).toBe('Image viewer')
    expect(container.querySelector('[role="status"]')).not.toBeNull()
  })

  it('sizes the canvas again when the density of the screen changes, which no resize reports', () => {
    const queries: { listener: () => void, media: string, signal?: AbortSignal }[] = []
    vi.stubGlobal('matchMedia', (media: string) => ({
      addEventListener: (_type: string, listener: () => void, options?: AddEventListenerOptions) => {
        queries.push({ listener, media, signal: options?.signal })
      },
    }))
    pic = new PaperPic(container)
    const canvas = container.querySelector<HTMLCanvasElement>('.paperpic-canvas')!
    expect(queries.at(-1)!.media).toBe('(resolution: 1dppx)')
    expect(canvas.width).toBe(300)

    vi.stubGlobal('devicePixelRatio', 2)
    queries.at(-1)!.listener()
    expect(canvas.width).toBe(600)
    expect(queries.at(-1)!.media).toBe('(resolution: 2dppx)')

    pic.destroy()
    expect(queries.at(-1)!.signal!.aborted).toBe(true)
  })

  it.each(['', '  '])('hides an image without a description from screen readers, with alt %j', (alt) => {
    pic = new PaperPic(container, { alt: 'A receipt' })
    pic.setOptions({ alt })

    const canvas = container.querySelector('canvas')!
    expect(canvas.hasAttribute('role')).toBe(false)
    expect(canvas.hasAttribute('aria-label')).toBe(false)
    expect(canvas.getAttribute('aria-hidden')).toBe('true')

    pic.setOptions({ alt: 'A receipt' })
    expect(canvas.getAttribute('role')).toBe('img')
    expect(canvas.hasAttribute('aria-hidden')).toBe(false)
  })

  it('starts empty without a source', () => {
    pic = new PaperPic(container)
    expect(pic.getState()).toMatchObject({ status: 'empty', image: null })
  })

  it('fits the whole image once loaded, and reports it', async () => {
    pic = new PaperPic(container, { src: '/receipt.jpg' })
    const onLoad = vi.fn()
    pic.on('load', onLoad)

    expect(pic.getState().status).toBe('loading')
    expect(images[0]!.image.src).toBe('/receipt.jpg')
    expect(viewportOf().getAttribute('aria-busy')).toBe('true')

    await finishLoading()

    expect(viewportOf().getAttribute('aria-busy')).toBe('false')
    expect(onLoad).toHaveBeenCalledWith({ width: 600, height: 250 })
    expect(pic.getState()).toEqual({
      status: 'ready',
      mode: 'view',
      image: { width: 600, height: 250 },
      zoom: 0.5,
      fit: 'image',
      rotation: 0,
      canUndo: false,
      canRedo: false,
      canApply: false,
      busy: false,
      activeTool: null,
      threshold: { enabled: false, sensitivity: 0.5 },
      adjustments: { brightness: 0, contrast: 0 },
    })
  })

  it('reports a load error, with a message that says what to check', async () => {
    pic = new PaperPic(container, { src: '/missing.jpg' })
    const onError = vi.fn()
    pic.on('error', onError)

    images[0]!.reject(new Error('decode failed'))
    await flush()

    expect(pic.getState().status).toBe('error')
    expect(onError.mock.calls[0]![0].error.message).toMatch(/"\/missing\.jpg".*Check/)
    expect(onError.mock.calls[0]![0].phase).toBe('load')
    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The image could not be loaded')
  })

  it('keeps the image when a load listener throws, because the load did not fail', async () => {
    const reportError = vi.fn()
    vi.stubGlobal('reportError', reportError)
    const failure = new Error('the app failed')
    const onError = vi.fn()
    pic = new PaperPic(container, { src: '/receipt.jpg' })
    pic.on('error', onError)
    pic.on('load', () => {
      throw failure
    })
    await finishLoading()

    expect(reportError).toHaveBeenCalledWith(failure)
    expect(onError).not.toHaveBeenCalled()
    expect(pic.getState().status).toBe('ready')
  })

  it('ignores an older load when the source changes meanwhile', async () => {
    pic = new PaperPic(container, {
      src: new Blob(['first']),
    })
    const onLoad = vi.fn()
    pic.on('load', onLoad)
    pic.setOptions({ src: '/second.jpg' })

    await finishLoading(1)
    expect(onLoad).toHaveBeenCalledOnce()
    expect(pic.getState().status).toBe('ready')

    await finishLoading(0)
    expect(onLoad).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:fake')
  })

  it('does not reload the same source', async () => {
    pic = new PaperPic(container, { src: '/receipt.jpg' })
    await finishLoading()
    pic.setOptions({ src: '/receipt.jpg', alt: 'Now with a description' })
    expect(images).toHaveLength(1)
  })

  it('empties the viewer when the source goes away', async () => {
    pic = new PaperPic(container, {
      src: new Blob(['image']),
    })
    await finishLoading()
    pic.setOptions({ src: undefined })
    expect(pic.getState()).toMatchObject({ status: 'empty', image: null })
    expect(revoke).toHaveBeenCalledOnce()
  })

  describe('with an image', () => {
    beforeEach(async () => {
      pic = new PaperPic(container, { src: '/receipt.jpg', editable: false })
      await finishLoading()
    })

    it('emits change for user actions, and not for setOptions', () => {
      const onChange = vi.fn()
      pic.on('change', onChange)

      pic.setOptions({ alt: 'Another', wheelZoom: false, editable: true })
      pic.setOptions({ editable: false })
      expect(onChange).not.toHaveBeenCalled()

      pic.zoomIn()
      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0]![0].zoom).toBeCloseTo(0.625)
    })

    it('does not emit change when nothing changed', () => {
      const onChange = vi.fn()
      pic.on('change', onChange)
      pic.fit('image')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('stops emitting after unsubscribing', () => {
      const onChange = vi.fn()
      const off = pic.on('change', onChange)
      off()
      pic.zoomIn()
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not emit change for a pan, which the state does not hold', () => {
      pic.zoomTo(2)
      const onChange = vi.fn()
      pic.on('change', onChange)
      const moved = !viewportOf().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
      expect(moved).toBe(true)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('updates only what follows the view on a pan or a zoom, and not the whole bars', () => {
      const update = vi.spyOn(Toolbar.prototype, 'update')
      const updateView = vi.spyOn(Toolbar.prototype, 'updateView')
      pic.zoomTo(2)
      viewportOf().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
      expect(update).not.toHaveBeenCalled()
      expect(updateView).toHaveBeenCalledTimes(2)
      expect(container.querySelector('.paperpic-toolbar [data-paperpic-control="zoomOut"]')!.getAttribute('aria-disabled')).toBe('false')
      update.mockRestore()
      updateView.mockRestore()
    })

    it('leaves an arrow key to the page when there is nothing to move, so it can scroll', () => {
      const press = (key: string) => !viewportOf().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

      expect(press('ArrowDown')).toBe(false)

      pic.zoomTo(2)
      expect(press('ArrowDown')).toBe(true)
      // The image reaches its edge after a few steps, and the arrow goes back to the page
      const steps = Array.from({ length: 20 }, () => press('ArrowDown'))
      expect(steps.at(-1)).toBe(false)
    })

    it('listens to the wheel only while it zooms', () => {
      const wheel = () => {
        const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
        viewportOf().dispatchEvent(event)
        return event.defaultPrevented
      }

      expect(wheel()).toBe(true)
      pic.setOptions({ wheelZoom: false })
      expect(wheel()).toBe(false)
      pic.setOptions({ wheelZoom: undefined })
      expect(wheel()).toBe(true)
    })

    it('reports a listener that throws to the page, and goes on', () => {
      const reportError = vi.fn()
      vi.stubGlobal('reportError', reportError)
      const failure = new Error('the app failed')
      const onChange = vi.fn()
      pic.on('change', () => {
        throw failure
      })
      pic.on('change', onChange)

      pic.zoomIn()

      expect(reportError).toHaveBeenCalledWith(failure)
      expect(onChange).toHaveBeenCalledOnce()
      expect(pic.getState().zoom).toBeCloseTo(0.625)
    })

    it('zooms with the public methods, within the limits', () => {
      pic.zoomTo(100)
      expect(pic.getState().zoom).toBe(8)
      pic.zoomOut()
      expect(pic.getState().zoom).toBeCloseTo(6.4)
      pic.fit('height')
      expect(pic.getState()).toMatchObject({ zoom: 0.6, fit: 'height' })
      pic.zoomTo(Number.POSITIVE_INFINITY)
      expect(pic.getState().zoom).toBe(8)
    })

    it('rejects a zoom that is not a number, or a point that is not finite, and keeps the view', () => {
      expect(() => pic.zoomTo(Number.NaN)).toThrow(new RangeError('zoom must be a number of screen pixels per image pixel, such as 1 for 100%, got NaN'))
      expect(() => pic.zoomTo(2, { x: Number.NaN, y: 0 })).toThrow(RangeError)
      expect(() => pic.zoomTo(2, { x: 0, y: Number.POSITIVE_INFINITY })).toThrow('point must have a finite x and y')
      expect(pic.getState()).toMatchObject({ zoom: 0.5, fit: 'image' })

      pic.zoomIn()
      expect(pic.getState().zoom).toBeCloseTo(0.625)
    })

    it('disables a zoom button at its limit', () => {
      expect(button('Zoom out').getAttribute('aria-disabled')).toBe('true')
      expect(button('Zoom in').getAttribute('aria-disabled')).toBe('false')
      pic.zoomTo(8)
      expect(button('Zoom in').getAttribute('aria-disabled')).toBe('true')
    })

    it('rotates the display, and starts over with another image', async () => {
      button('Rotate right').click()
      expect(pic.getState().rotation).toBe(90)
      pic.rotate(-1)
      pic.rotate(-1)
      expect(pic.getState().rotation).toBe(270)

      pic.setOptions({ src: '/another.jpg' })
      await finishLoading()
      expect(pic.getState().rotation).toBe(0)
    })

    it('measures the toolbar with the viewer, and not on every move of a pan', () => {
      const width = vi.fn(() => 40)
      Object.defineProperty(toolbarOf(), 'offsetWidth', { configurable: true, get: width })
      expect(observed).toContain(toolbarOf())
      resizeCallback()
      expect(width).toHaveBeenCalled()
      width.mockClear()

      pic.zoomTo(2)
      const press = (key: string) => viewportOf().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      press('ArrowLeft')
      press('ArrowRight')
      expect(width).not.toHaveBeenCalled()
    })

    it('announces the zoom from the toolbar to screen readers, without showing it', () => {
      button('Zoom in').click()
      expect(container.querySelector('.paperpic-announcement[role="status"]')!.textContent).toBe('Zoom 63%')
      expect(container.querySelector('.paperpic-status-visible')).toBeNull()
    })

    it('uses the keyboard', () => {
      const press = (key: string) => viewportOf().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

      press('+')
      expect(pic.getState().zoom).toBeCloseTo(0.625)

      pic.zoomTo(1)
      press('ArrowRight')
      expect(pic.getState().fit).toBeNull()

      press('0')
      expect(pic.getState()).toMatchObject({ zoom: 0.5, fit: 'image' })
    })

    it('marks the viewport pannable only when the image overflows it', () => {
      expect(viewportOf().classList.contains('paperpic-viewport-pannable')).toBe(false)
      pic.zoomTo(2)
      expect(viewportOf().classList.contains('paperpic-viewport-pannable')).toBe(true)
    })

    it('fits again when the container changes size', () => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 600 })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 250 })
      resizeCallback()
      expect(pic.getState().zoom).toBe(1)
    })

    it('hides the toolbar on request', () => {
      pic.setOptions({ toolbar: false })
      expect(toolbarOf().hidden).toBe(true)
      pic.setOptions({ toolbar: undefined })
      expect(toolbarOf().hidden).toBe(false)
    })

    it('replaces texts, and keeps the rest in English', () => {
      pic.setOptions({
        labels: { zoomIn: 'Acercar' },
      })
      expect(button('Acercar')).not.toBeNull()
      expect(button('Zoom out')).not.toBeNull()
    })

    it('replaces icons, keeps the rest, and brings them back without the option', () => {
      const zoomOut = button('Zoom out').firstElementChild
      pic.setOptions({
        icons: { zoomIn: '<svg data-icon="custom"></svg>' },
      })
      expect(button('Zoom in').firstElementChild!.getAttribute('data-icon')).toBe('custom')
      expect(button('Zoom out').firstElementChild).toBe(zoomOut)

      pic.setOptions({ icons: undefined })
      expect(button('Zoom in').querySelector('[data-icon="custom"]')).toBeNull()
      expect(button('Zoom in').querySelector('.paperpic-icon')).not.toBeNull()
    })
  })

  describe('rotation and editing', () => {
    it('does not rotate while editing is available, the default', async () => {
      pic = new PaperPic(container, { src: '/receipt.jpg' })
      await finishLoading()

      pic.rotate(1)

      expect(pic.getState().rotation).toBe(0)
      expect(button('Rotate left').hidden).toBe(true)
    })

    it('drops the display rotation when editing becomes available', async () => {
      pic = new PaperPic(container, { src: '/receipt.jpg', editable: false })
      await finishLoading()
      pic.rotate(1)

      pic.setOptions({ editable: true })

      expect(pic.getState().rotation).toBe(0)
    })
  })

  describe('in a container without a size', () => {
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 0 })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 0 })
    })

    it('waits for a size before fitting, and commands do nothing meanwhile', async () => {
      pic = new PaperPic(container, { src: '/receipt.jpg', editable: false })
      await finishLoading()
      const before = pic.getState()

      pic.zoomIn()
      pic.fit('width')
      pic.rotate(1)
      expect(pic.getState()).toEqual(before)

      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 300 })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 150 })
      resizeCallback()
      expect(pic.getState().zoom).toBe(0.5)
    })
  })

  describe('destroy', () => {
    it('removes everything, and can run twice', async () => {
      pic = new PaperPic(container, {
        src: new Blob(['image']),
      })
      await finishLoading()

      pic.destroy()
      pic.destroy()

      expect(container.children).toHaveLength(0)
      expect(disconnect).toHaveBeenCalledOnce()
      expect(revoke).toHaveBeenCalledOnce()
    })

    it('ignores a load that finishes afterwards, and releases it', async () => {
      pic = new PaperPic(container, {
        src: new Blob(['image']),
      })
      const onLoad = vi.fn()
      pic.on('load', onLoad)
      pic.destroy()

      await finishLoading()

      expect(onLoad).not.toHaveBeenCalled()
      expect(revoke).toHaveBeenCalledOnce()
    })

    it('does not load again afterwards, because nothing would release the image', async () => {
      pic = new PaperPic(container, { src: '/receipt.jpg' })
      await finishLoading()
      pic.destroy()

      pic.reload()

      expect(images).toHaveLength(1)
    })

    it('leaves the container ready for a new instance', async () => {
      new PaperPic(container).destroy()
      pic = new PaperPic(container, { src: '/receipt.jpg' })
      await finishLoading()
      expect(container.querySelectorAll('.paperpic')).toHaveLength(1)
      expect(pic.getState().status).toBe('ready')
    })
  })
})
