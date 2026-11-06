import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from '../src'

interface FakeImage {
  src: string
  naturalWidth: number
  naturalHeight: number
  decode: () => Promise<void>
}

/** The images created so far, each waiting for the test to finish its decoding. */
let images: { image: FakeImage, resolve: () => void, reject: (reason: Error) => void }[]
let resizeCallback: () => void
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

      observe() {}
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

  it('builds accessible markup', () => {
    pic = new PaperPic(container, { alt: 'A receipt' })

    expect(container.querySelector('canvas')!.getAttribute('role')).toBe('img')
    expect(container.querySelector('canvas')!.getAttribute('aria-label')).toBe('A receipt')
    expect(viewportOf().tabIndex).toBe(0)
    expect(viewportOf().getAttribute('aria-label')).toBe('Image viewer')
    expect(container.querySelector('[role="status"]')).not.toBeNull()
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

    await finishLoading()

    expect(onLoad).toHaveBeenCalledWith({ width: 600, height: 250 })
    expect(pic.getState()).toEqual({
      status: 'ready',
      image: { width: 600, height: 250 },
      zoom: 0.5,
      fit: 'image',
      rotation: 0,
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
    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The image could not be loaded')
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

    it('zooms with the public methods, within the limits', () => {
      pic.zoomTo(100)
      expect(pic.getState().zoom).toBe(8)
      pic.zoomOut()
      expect(pic.getState().zoom).toBeCloseTo(6.4)
      pic.fit('height')
      expect(pic.getState()).toMatchObject({ zoom: 0.6, fit: 'height' })
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

    it('announces the zoom from the toolbar to screen readers', () => {
      button('Zoom in').click()
      expect(container.querySelector('[role="status"]')!.textContent).toBe('Zoom 63%')
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

    it('leaves the container ready for a new instance', async () => {
      new PaperPic(container).destroy()
      pic = new PaperPic(container, { src: '/receipt.jpg' })
      await finishLoading()
      expect(container.querySelectorAll('.paperpic')).toHaveLength(1)
      expect(pic.getState().status).toBe('ready')
    })
  })
})
