import type { Mock } from 'vitest'
import type { PaperPicState } from './index'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from './index'
import { ALL_TOOL_IDS } from './tools'
import { DEFAULT_LABELS } from './ui/labels'

const mocks = vi.hoisted(() => ({
  exportImage: vi.fn(),
  renderPreview: vi.fn(),
}))

vi.mock('./pipeline/export', async importOriginal => ({
  ...await importOriginal<typeof import('./pipeline/export')>(),
  exportImage: mocks.exportImage,
}))
vi.mock('./pipeline/preview', () => ({ renderPreview: mocks.renderPreview }))

let images: { resolve: () => void }[]
let frames: Map<number, FrameRequestCallback>
const revoke = vi.fn()

/** Runs the frames the viewer asked for, as the browser would before the next paint. */
function runFrames() {
  const pending = [
    ...frames.values(),
  ]
  frames.clear()
  for (const callback of pending) {
    callback(performance.now())
  }
}

async function flush() {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve()
  }
}

async function finishLoading() {
  images.at(-1)!.resolve()
  await flush()
}

const releasePreview = vi.fn()

const tint = vi.fn()

function preview() {
  return {
    element: {},
    width: 480,
    height: 200,
    tint,
    release: releasePreview,
  }
}

const exported = {
  blob: new Blob(['x'], { type: 'image/jpeg' }),
  width: 250,
  height: 600,
  type: 'image/jpeg',
}

describe('editing', () => {
  let container: HTMLElement
  let pic: PaperPic
  let onChange: Mock<(state: PaperPicState) => void>

  const button = (label: string) => container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!
  const bar = () => container.querySelector<HTMLElement>('.paperpic-edit-bar')!
  const announcement = () => container.querySelector('.paperpic-announcement')!.textContent
  const press = (key: string, options = {}, target: Element = container.querySelector('.paperpic-viewport')!) => target.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  }))

  beforeEach(async () => {
    images = []
    revoke.mockClear()
    mocks.exportImage.mockReset()
    mocks.exportImage.mockResolvedValue(exported)
    mocks.renderPreview.mockReset()
    mocks.renderPreview.mockImplementation(async () => preview())

    vi.stubGlobal('Image', class {
      src = ''
      naturalWidth = 600
      naturalHeight = 250
      decode() {
        return new Promise<void>((resolve) => {
          images.push({ resolve })
        })
      }
    })
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    })
    frames = new Map()
    let nextFrame = 1
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(nextFrame, callback)
      return nextFrame++
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    URL.createObjectURL = () => 'blob:fake'
    URL.revokeObjectURL = revoke
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 300 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 150 })

    container = document.createElement('div')
    document.body.replaceChildren(container)
    pic = new PaperPic(container, { src: '/receipt.jpg' })
    onChange = vi.fn()
    pic.on('change', onChange)
    await finishLoading()
  })

  afterEach(() => {
    pic.destroy()
    vi.unstubAllGlobals()
  })

  it('starts from the pencil, which is hidden while editing', () => {
    expect(button('Edit').hidden).toBe(false)
    expect(bar().hidden).toBe(true)

    button('Edit').click()

    expect(pic.getState().mode).toBe('edit')
    expect(button('Edit').hidden).toBe(true)
    expect(bar().hidden).toBe(false)
    expect(onChange).toHaveBeenCalledOnce()
    expect(announcement()).toBe('Editing')
  })

  it('hides the toolbar while editing, so nothing covers the image', () => {
    const toolbar = () => container.querySelector<HTMLElement>('.paperpic-toolbar')!
    pic.edit()
    expect(toolbar().hidden).toBe(true)
    pic.cancel()
    expect(toolbar().hidden).toBe(false)
  })

  it('has no pencil in a read-only viewer, and cannot start editing', () => {
    pic.setOptions({ editable: false })
    expect(button('Edit').hidden).toBe(true)
    pic.edit()
    expect(pic.getState().mode).toBe('view')
  })

  it('cannot start editing without an image', () => {
    pic.setOptions({ src: undefined })
    expect(button('Edit').hidden).toBe(true)
    pic.edit()
    expect(pic.getState().mode).toBe('view')
  })

  it('rotates at once, undoes and redoes', () => {
    pic.edit()
    expect(pic.getState()).toMatchObject({ canUndo: false, canRedo: false, canApply: false })

    pic.rotate(1)
    expect(pic.getState()).toMatchObject({ rotation: 90, canUndo: true, canApply: true })

    pic.undo()
    expect(pic.getState()).toMatchObject({
      rotation: 0,
      canUndo: false,
      canRedo: true,
      canApply: false,
    })

    pic.redo()
    expect(pic.getState()).toMatchObject({ rotation: 90, canUndo: true, canRedo: false })
  })

  it('offers one rotate button in the bar, to the left, and none in the toolbar', () => {
    pic.edit()
    const rotateLeft = bar().querySelector<HTMLButtonElement>('[aria-label="Rotate left"]')!
    expect(bar().querySelector('[aria-label="Rotate right"]')).toBeNull()
    expect(container.querySelector<HTMLButtonElement>('.paperpic-toolbar [aria-label="Rotate left"]')!.hidden).toBe(true)

    rotateLeft.click()
    expect(pic.getState().rotation).toBe(270)
    rotateLeft.click()
    expect(pic.getState().rotation).toBe(180)
  })

  it('has nothing to apply when the rotations cancel out', () => {
    pic.edit()
    pic.rotate(1)
    pic.rotate(-1)
    expect(pic.getState()).toMatchObject({ canUndo: true, canApply: false })
    expect(button('Apply').getAttribute('aria-disabled')).toBe('true')
  })

  it('does not edit outside the edit mode', () => {
    pic.rotate(1)
    pic.undo()
    pic.redo()
    pic.cancel()
    expect(pic.getState()).toMatchObject({ mode: 'view', rotation: 0, canUndo: false })
  })

  it('applies: emits the image, shows it as the new base and goes back to viewing', async () => {
    const onApply = vi.fn()
    pic.on('apply', onApply)
    pic.edit()
    pic.rotate(1)

    onChange.mockClear()
    const applying = pic.apply()
    expect(pic.getState().busy).toBe(true)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ busy: true }))
    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('Applying changes')

    await flush()
    expect(mocks.exportImage).toHaveBeenCalledOnce()
    expect(mocks.exportImage.mock.calls[0]![0]).toMatchObject({
      width: 600,
      height: 250,
      source: '/receipt.jpg',
      steps: [
        { type: 'rotate', rotation: 90 },
      ],
    })
    await finishLoading()
    await applying

    expect(onApply).toHaveBeenCalledWith(exported)
    expect(pic.getState()).toMatchObject({
      mode: 'view',
      rotation: 0,
      busy: false,
      canUndo: false,
    })
    expect(bar().hidden).toBe(true)
    expect(announcement()).toBe('Changes applied')
  })

  it('keeps the announcement of Apply when a wrapper passes the same options again', async () => {
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    await flush()
    await finishLoading()
    await applying

    // A render passes new arrays and objects with the same contents, and undefined for the options not set
    pic.setOptions({
      src: '/receipt.jpg',
      tools: [...ALL_TOOL_IDS],
      output: undefined,
      labels: undefined,
    })
    expect(announcement()).toBe('Changes applied')

    // Equal contents count, not the same object, so a changed label still reaches the buttons
    pic.setOptions({
      labels: { edit: 'Modify' },
    })
    expect(container.querySelector('[data-paperpic-control="edit"]')!.getAttribute('aria-label')).toBe('Modify')
  })

  it('passes the output options on', async () => {
    pic.setOptions({
      output: { type: 'image/webp', quality: 0.5 },
      maxOutputSize: 1000,
    })
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    await flush()
    expect(mocks.exportImage.mock.calls[0]![0]).toMatchObject({
      output: { type: 'image/webp', quality: 0.5 },
      maxOutputSize: 1000,
    })
    await finishLoading()
    await applying
  })

  it('does not apply without changes', async () => {
    pic.edit()
    await pic.apply()
    expect(mocks.exportImage).not.toHaveBeenCalled()
  })

  it('ignores edits while applying', async () => {
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()

    pic.rotate(1)
    pic.undo()
    pic.cancel()
    expect(pic.getState()).toMatchObject({ mode: 'edit', rotation: 90 })
    expect(button('Undo').getAttribute('aria-disabled')).toBe('true')

    await flush()
    await finishLoading()
    await applying
  })

  it('keeps the edit open and reports the error when applying fails', async () => {
    const onError = vi.fn()
    pic.on('error', onError)
    mocks.exportImage.mockRejectedValue(new Error('too large'))
    pic.edit()
    pic.rotate(1)

    await pic.apply()

    expect(onError.mock.calls[0]![0]).toMatchObject({
      phase: 'apply',
      error: { message: 'too large' },
    })
    expect(pic.getState()).toMatchObject({ mode: 'edit', busy: false, canApply: true })
    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The changes could not be applied')

    pic.undo()
    expect(container.querySelector('.paperpic-status-visible')).toBeNull()
  })

  it('shows the mode and the open tool to CSS, in public data attributes', () => {
    const root = container.querySelector<HTMLElement>('.paperpic')!
    pic.edit()
    expect(root.getAttribute('data-paperpic-mode')).toBe('edit')
    expect(root.hasAttribute('data-paperpic-tool')).toBe(false)

    pic.openTool('adjust')
    expect(root.getAttribute('data-paperpic-tool')).toBe('adjust')
    pic.cancelTool()
    expect(root.hasAttribute('data-paperpic-tool')).toBe(false)

    pic.cancel()
    expect(root.getAttribute('data-paperpic-mode')).toBe('view')
    expect(root.getAttribute('data-paperpic-status')).toBe('ready')
  })

  it('reports a failure as an Error, also when something threw another value', async () => {
    const onError = vi.fn()
    pic.on('error', onError)
    mocks.exportImage.mockRejectedValue('out of memory')
    pic.edit()
    pic.rotate(1)

    await pic.apply()

    const { error } = onError.mock.calls[0]![0]
    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({ message: 'out of memory', cause: 'out of memory' })
  })

  it('keeps a failure on screen while it announces other changes, such as the zoom', async () => {
    mocks.exportImage.mockRejectedValue(new Error('too large'))
    pic.edit()
    pic.rotate(1)
    await pic.apply()

    pic.zoomIn()

    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The changes could not be applied')
    expect(announcement()).toMatch(/^Zoom \d+%$/)
  })

  it('marks only the image busy, so screen readers do not hold back the message about the work', async () => {
    const viewport = container.querySelector<HTMLElement>('.paperpic-viewport')!
    pic.edit()
    pic.rotate(1)

    const applying = pic.apply()
    expect(viewport.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('.paperpic')!.hasAttribute('aria-busy')).toBe(false)
    expect(container.querySelector('[aria-busy="true"] [role="status"]')).toBeNull()

    await flush()
    await finishLoading()
    await applying
    expect(viewport.getAttribute('aria-busy')).toBe('false')
  })

  it('applies when an apply listener throws, because the Apply did not fail', async () => {
    const reportError = vi.fn()
    vi.stubGlobal('reportError', reportError)
    const failure = new Error('the upload failed')
    const onError = vi.fn()
    pic.on('error', onError)
    pic.on('apply', () => {
      throw failure
    })
    pic.edit()
    pic.rotate(1)
    onChange.mockClear()

    const applying = pic.apply()
    await flush()
    await finishLoading()
    await applying

    expect(reportError).toHaveBeenCalledWith(failure)
    expect(onError).not.toHaveBeenCalled()
    expect(pic.getState()).toMatchObject({ mode: 'view', busy: false })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'view', busy: false }))
    expect(container.querySelector('.paperpic-status-visible')).toBeNull()
  })

  describe('cancelling', () => {
    it('leaves at once when there is nothing to lose', () => {
      pic.edit()
      button('Cancel').click()
      expect(pic.getState().mode).toBe('view')
    })

    it('asks first when there are changes', () => {
      pic.edit()
      pic.rotate(1)
      button('Cancel').click()

      expect(pic.getState().mode).toBe('edit')
      expect(container.querySelector('.paperpic-edit-confirmation')!.hasAttribute('hidden')).toBe(false)
      expect(document.activeElement!.textContent).toBe('Keep editing')
    })

    it('keeps the work when the user changes their mind', () => {
      pic.edit()
      pic.rotate(1)
      button('Cancel').click()
      ;[
        ...container.querySelectorAll('button'),
      ].find(element => element.textContent === 'Keep editing')!.click()

      expect(pic.getState()).toMatchObject({ mode: 'edit', rotation: 90 })
      expect(container.querySelector('.paperpic-edit-confirmation')!.hasAttribute('hidden')).toBe(true)
      expect(document.activeElement).toBe(button('Cancel'))
    })

    it('discards when the user confirms, and restores the rotation', () => {
      pic.edit()
      pic.rotate(1)
      button('Cancel').click()
      ;[
        ...container.querySelectorAll('button'),
      ].find(element => element.textContent === 'Discard')!.click()

      expect(pic.getState()).toMatchObject({ mode: 'view', rotation: 0, canUndo: false })
      expect(bar().hidden).toBe(true)
    })

    it('does not ask from the public method, which belongs to custom interfaces', () => {
      pic.edit()
      pic.rotate(1)
      pic.cancel()
      expect(pic.getState().mode).toBe('view')
    })
  })

  describe('with the keyboard', () => {
    beforeEach(() => pic.edit())

    it('undoes and redoes', () => {
      pic.rotate(1)
      press('z', { ctrlKey: true })
      expect(pic.getState().rotation).toBe(0)
      press('z', { ctrlKey: true, shiftKey: true })
      expect(pic.getState().rotation).toBe(90)
    })

    it('asks before Esc loses changes, and a second Esc keeps editing', () => {
      pic.rotate(1)
      press('Escape')
      const keep = [
        ...container.querySelectorAll('button'),
      ].find(element => element.textContent === 'Keep editing')!
      expect(document.activeElement).toBe(keep)

      press('Escape', {}, keep)
      expect(pic.getState().mode).toBe('edit')
      expect(container.querySelector('.paperpic-edit-confirmation')!.hasAttribute('hidden')).toBe(true)
    })

    it('applies with Enter on the viewer, and not on a button', async () => {
      pic.rotate(1)
      press('Enter', {}, button('Undo'))
      expect(mocks.exportImage).not.toHaveBeenCalled()

      press('Enter')
      await flush()
      expect(mocks.exportImage).toHaveBeenCalledOnce()
      await finishLoading()
    })
  })

  it('leaves the browser shortcuts alone outside the edit mode', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('.paperpic-viewport')!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('does not take Esc when a custom interface replaces the bar', () => {
    pic.setOptions({ toolbar: false })
    pic.edit()
    pic.rotate(1)
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    container.querySelector('.paperpic-viewport')!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(pic.getState().mode).toBe('edit')
    expect(bar().hidden).toBe(true)
  })

  it('moves the keyboard focus to the bar and back to the pencil', () => {
    button('Edit').focus()
    pic.edit()
    expect(document.activeElement).toBe(button('Cancel'))
    pic.cancel()
    expect(document.activeElement).toBe(button('Edit'))
  })

  it('does not steal the focus from a custom interface outside the viewer', () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    pic.edit()
    expect(document.activeElement).toBe(outside)
  })

  it('does not apply setOptions as a user action', () => {
    pic.edit()
    onChange.mockClear()
    pic.setOptions({ alt: 'Another' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('discards the edit when the source changes', async () => {
    pic.edit()
    pic.rotate(1)
    pic.setOptions({ src: '/another.jpg' })
    expect(pic.getState()).toMatchObject({ mode: 'view', canUndo: false })
    await finishLoading()
    expect(pic.getState().rotation).toBe(0)
  })

  it('discards the edit when editing stops being available', () => {
    pic.edit()
    pic.rotate(1)
    pic.setOptions({ editable: false })
    expect(pic.getState()).toMatchObject({ mode: 'view', rotation: 0, canUndo: false })
  })

  it('keeps the result when a wrapper sends the same source again', async () => {
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    await flush()
    await finishLoading()
    await applying
    const count = images.length

    pic.setOptions({ src: '/receipt.jpg', alt: 'Same source' })
    expect(images).toHaveLength(count)
  })

  it('brings back the original with reload', async () => {
    const onLoad = vi.fn()
    pic.on('load', onLoad)
    pic.reload()
    await finishLoading()
    expect(onLoad).toHaveBeenCalledOnce()
  })

  it('ignores a result that arrives after a new source', async () => {
    const onApply = vi.fn()
    pic.on('apply', onApply)
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    pic.setOptions({ src: '/another.jpg' })
    await flush()
    images[1]?.resolve()
    await finishLoading()
    await applying
    expect(onApply).not.toHaveBeenCalled()
  })

  it('ignores a result that arrives after editing was turned off, which discarded the edit', async () => {
    const onApply = vi.fn()
    pic.on('apply', onApply)
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    pic.setOptions({ editable: false })
    expect(pic.getState()).toMatchObject({ mode: 'view', busy: false })
    const count = images.length
    await flush()
    await finishLoading()
    await applying

    expect(images).toHaveLength(count + 1)
    expect(onApply).not.toHaveBeenCalled()
    expect(pic.getState()).toMatchObject({
      mode: 'view',
      image: { width: 600, height: 250 },
    })
  })

  it('ignores a failure that arrives after editing was turned off', async () => {
    const onError = vi.fn()
    pic.on('error', onError)
    mocks.exportImage.mockRejectedValue(new Error('too large'))
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    pic.setOptions({ editable: false })
    await applying

    expect(onError).not.toHaveBeenCalled()
    expect(container.querySelector('.paperpic-status-visible')).toBeNull()
  })

  it('ignores a result that arrives after destroy', async () => {
    const onApply = vi.fn()
    pic.on('apply', onApply)
    pic.edit()
    pic.rotate(1)
    const applying = pic.apply()
    pic.destroy()
    await flush()
    await finishLoading()
    await applying
    expect(onApply).not.toHaveBeenCalled()
  })

  describe('with a tool that has its own selection', () => {
    const handles = () => [
      ...container.querySelectorAll('.paperpic-handle'),
    ]
    const crop = () => bar().querySelector<HTMLButtonElement>('[aria-label="Crop"]')!

    beforeEach(() => {
      releasePreview.mockClear()
      pic.edit()
    })

    it('shows the handles and its own controls, and hides the rest', () => {
      crop().click()
      expect(pic.getState().activeTool).toBe('crop')
      expect(handles()).toHaveLength(4)
      expect(button('Done').hidden).toBe(false)
      expect(button('Done').parentElement!.hidden).toBe(false)
      expect(button('Apply').parentElement!.hidden).toBe(true)
      expect(onChange).toHaveBeenCalled()
    })

    it('moves the focus to the first corner, and back to the button of the tool', () => {
      crop().focus()
      crop().click()
      expect(document.activeElement).toBe(handles()[0])
      button('Cancel this tool').click()
      expect(document.activeElement).toBe(crop())
    })

    it('leaves no trace when cancelled', () => {
      crop().click()
      button('Cancel this tool').click()
      expect(pic.getState()).toMatchObject({ activeTool: null, canUndo: false, canApply: false })
      expect(handles()).toHaveLength(0)
      expect(mocks.renderPreview).not.toHaveBeenCalled()
    })

    it('adds the crop on confirm, and shows the preview at the size of the result', async () => {
      crop().click()
      button('Done').click()
      expect(pic.getState()).toMatchObject({ activeTool: null, canUndo: true, canApply: true })
      expect(handles()).toHaveLength(0)
      expect(mocks.renderPreview.mock.calls[0]![1]).toEqual([
        {
          type: 'crop',
          rect: {
            x: 0.1,
            y: 0.1,
            width: expect.any(Number),
            height: 0.8,
          },
        },
      ])

      await flush()
      expect(pic.getState().image).toEqual({ width: 480, height: 200 })
    })

    it('fits the preview in the viewer, like any other image', async () => {
      expect(pic.getState().zoom).toBe(0.5)
      crop().click()
      button('Done').click()
      await flush()
      expect(pic.getState()).toMatchObject({ zoom: 0.625, fit: 'image' })

      pic.undo()
      expect(pic.getState()).toMatchObject({ zoom: 0.5, fit: 'image' })
    })

    it('goes back to the image with Undo, without computing anything', async () => {
      crop().click()
      button('Done').click()
      await flush()

      pic.undo()

      expect(mocks.renderPreview).toHaveBeenCalledOnce()
      expect(pic.getState().image).toEqual({ width: 600, height: 250 })
      expect(releasePreview).toHaveBeenCalledOnce()

      pic.redo()
      expect(mocks.renderPreview).toHaveBeenCalledTimes(2)
    })

    it('does not compute the preview again for a rotation after the crop', async () => {
      crop().click()
      button('Done').click()
      await flush()

      pic.rotate(1)
      expect(pic.getState()).toMatchObject({
        rotation: 90,
        image: { width: 480, height: 200 },
      })
      expect(mocks.renderPreview).toHaveBeenCalledOnce()

      pic.undo()
      expect(pic.getState()).toMatchObject({
        rotation: 0,
        image: { width: 480, height: 200 },
      })
      expect(mocks.renderPreview).toHaveBeenCalledOnce()
    })

    it('bakes an earlier rotation into the preview', async () => {
      pic.rotate(1)
      crop().click()
      button('Done').click()
      expect(mocks.renderPreview.mock.calls[0]![1][0]).toEqual({ type: 'rotate', rotation: 90 })
      await flush()
      expect(pic.getState().rotation).toBe(0)
    })

    it('exports all the edits', async () => {
      crop().click()
      button('Done').click()
      await flush()
      pic.rotate(1)
      const applying = pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        expect.objectContaining({ type: 'crop' }),
        { type: 'rotate', rotation: 90 },
      ])
      await finishLoading()
      await applying
      expect(pic.getState()).toMatchObject({
        mode: 'view',
        rotation: 0,
        image: { width: 600, height: 250 },
      })
      expect(releasePreview).toHaveBeenCalled()
    })

    const moveCorner = (key = 'ArrowRight') => handles()[0]!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))

    it('waits in Straighten until a corner moves, and reports when Done becomes available', () => {
      expect(pic.getState().canConfirm).toBe(false)
      pic.openTool('perspective')
      expect(pic.getState().canConfirm).toBe(false)
      expect(button('Done').getAttribute('aria-disabled')).toBe('true')

      pic.confirmTool()
      expect(pic.getState()).toMatchObject({ activeTool: 'perspective', canUndo: false })
      expect(container.textContent).toContain('Drag each corner to a corner of the document')

      onChange.mockClear()
      moveCorner()
      expect(onChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ canConfirm: true }))
      expect(button('Done').getAttribute('aria-disabled')).toBe('false')
      moveCorner()
      expect(onChange).toHaveBeenCalledOnce()

      pic.confirmTool()
      expect(pic.getState()).toMatchObject({ activeTool: null, canConfirm: false, canUndo: true })
    })

    it.each(['crop', 'redact', 'adjust', 'finish'] as const)('never makes Done wait in %s', (id) => {
      pic.openTool(id)
      expect(pic.getState().canConfirm).toBe(true)
    })

    it('gives the result of Straighten the paper size on its panel, over the proportions the consumer knows', async () => {
      pic.setOptions({ aspectRatio: 0.5 })
      pic.openTool('perspective')
      bar().querySelector<HTMLButtonElement>('[data-paperpic-control="paperA4"]')!.click()
      expect(pic.getState().paper).toEqual({ size: 'a4' })
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
        paper: { size: 'a4' },
      }))
      // A paper size alone says nothing about where the document is
      expect(pic.getState().canConfirm).toBe(false)
      moveCorner()
      pic.confirmTool()

      const [, steps] = mocks.renderPreview.mock.calls[0]!
      expect(steps[0].type).toBe('perspective')
      expect(steps[0].aspectRatio).toBeCloseTo(297 / 210)
    })

    it('starts in the automatic proportions each time Straighten opens', () => {
      pic.openTool('perspective')
      pic.setPaper({ size: 'card' })
      pic.cancelTool()
      expect(pic.getState().paper).toEqual({ size: 'auto' })
      pic.openTool('perspective')
      expect(pic.getState().paper).toEqual({ size: 'auto' })
    })

    it('ignores a paper size out of Straighten or already in use, and rejects one it does not know', () => {
      onChange.mockClear()
      pic.setPaper({ size: 'a4' })
      expect(pic.getState().paper).toEqual({ size: 'auto' })
      pic.openTool('crop')
      onChange.mockClear()
      pic.setPaper({ size: 'a4' })
      pic.cancelTool()
      pic.openTool('perspective')
      onChange.mockClear()
      pic.setPaper({ size: 'auto' })
      pic.setPaper({})
      expect(onChange).not.toHaveBeenCalled()
      expect(() => pic.setPaper({ size: 'a3' as 'a4' })).toThrow(/size must be 'auto', 'a4', 'letter', 'card', got a3/)
    })

    it('straightens with the proportions the consumer knows, and exports them', async () => {
      pic.setOptions({ aspectRatio: 0.5 })
      pic.openTool('perspective')
      expect(pic.getState().activeTool).toBe('perspective')
      moveCorner()
      button('Done').click()
      await flush()

      const applying = pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        expect.objectContaining({ type: 'perspective', aspectRatio: 0.5 }),
      ])
      await finishLoading()
      await applying
    })

    it('tells the user how to use the perspective tool', () => {
      pic.openTool('perspective')
      expect(button('Done').parentElement!.textContent).toContain('Drag each corner to a corner of the document')
    })

    it('zooms from its panel, where the corners are placed', () => {
      crop().click()
      const zoom = pic.getState().zoom
      bar().querySelector<HTMLButtonElement>('.paperpic-edit-tool [aria-label="Zoom in"]')!.click()
      expect(pic.getState().zoom).toBeGreaterThan(zoom)
      bar().querySelector<HTMLButtonElement>('.paperpic-edit-tool [aria-label="Zoom out"]')!.click()
      expect(pic.getState().zoom).toBeCloseTo(zoom)
    })

    it('zooms toward the selected corner, so it stays on screen, and toward the center without one', () => {
      const zoomIn = () => bar().querySelector<HTMLButtonElement>('.paperpic-edit-tool [aria-label="Zoom in"]')!.click()
      const topLeft = () => (handles()[0] as HTMLElement).style.left
      crop().click()
      const before = topLeft()

      ;(handles()[0] as HTMLElement).click()
      zoomIn()
      expect(topLeft()).toBe(before)

      press('Escape', {}, handles()[0]!)
      pic.fit('image')
      zoomIn()
      expect(topLeft()).not.toBe(before)
    })

    it('ignores other edits while it is open', async () => {
      crop().click()
      pic.rotate(1)
      pic.undo()
      await pic.apply()
      expect(pic.getState()).toMatchObject({ activeTool: 'crop', rotation: 0, canUndo: false })
      expect(mocks.exportImage).not.toHaveBeenCalled()
    })

    it('opens from code a tool that the edit bar does not offer, because tools only chooses its buttons', () => {
      pic.setOptions({
        tools: ['rotate'],
      })
      expect(crop().hidden).toBe(true)
      pic.openTool('crop')
      expect(pic.getState().activeTool).toBe('crop')
    })

    it('cannot open while a preview is on its way', async () => {
      crop().click()
      button('Done').click()
      expect(crop().getAttribute('aria-disabled')).toBe('true')
      pic.openTool('crop')
      expect(pic.getState().activeTool).toBeNull()

      await flush()
      expect(crop().getAttribute('aria-disabled')).toBe('false')
      pic.openTool('crop')
      expect(pic.getState().activeTool).toBe('crop')
    })

    it('closes with Esc, without asking to discard the edit', () => {
      pic.rotate(1)
      crop().click()
      press('Escape', {}, handles()[0]!)
      expect(pic.getState()).toMatchObject({ mode: 'edit', activeTool: null, rotation: 90 })
      expect(container.querySelector('.paperpic-edit-confirmation')!.hasAttribute('hidden')).toBe(true)
    })

    describe('placing a corner without dragging', () => {
      const viewport = () => container.querySelector<HTMLElement>('.paperpic-viewport')!
      const hint = () => button('Done').parentElement!.textContent
      const tap = (x: number, y: number, time: number) => {
        for (const type of ['pointerdown', 'pointerup']) {
          const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y })
          Object.defineProperties(event, {
            pointerId: { value: 1 },
            pointerType: { value: 'touch' },
            timeStamp: { value: time },
          })
          viewport().dispatchEvent(event)
        }
      }

      beforeEach(() => {
        HTMLElement.prototype.setPointerCapture = vi.fn()
        crop().click()
      })

      it('moves the selected corner to a tap on the image, and the tap does not zoom', () => {
        const before = handles()[0]!.getAttribute('style')
        ;(handles()[0] as HTMLElement).click()
        expect(hint()).toContain('Top left corner: tap where it goes')

        tap(40, 40, 0)
        tap(40, 40, 100)
        expect(handles()[0]!.getAttribute('style')).not.toBe(before)
        expect(handles()[0]!.getAttribute('aria-pressed')).toBe('false')
        expect(announcement()).toMatch(/^Top left corner: \d+, \d+$/)
        expect(hint()).toContain('Drag the corners')
        expect(pic.getState()).toMatchObject({ activeTool: 'crop', fit: 'image' })
      })

      it('reports the hint in the state, for an interface of its own, and emits change when it changes', () => {
        expect(pic.getState().hint).toBe('Drag the corners')
        onChange.mockClear()

        ;(handles()[0] as HTMLElement).click()
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ hint: 'Top left corner: tap where it goes' }))

        tap(40, 40, 0)
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ hint: 'Drag the corners' }))

        // The close reports the state once, without the hint
        ;(handles()[1] as HTMLElement).click()
        onChange.mockClear()
        button('Cancel this tool').click()
        expect(onChange).toHaveBeenCalledOnce()
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ activeTool: null, hint: null }))
      })

      it('leaves a tap alone when no corner is selected', () => {
        const before = handles().map(handle => handle.getAttribute('style'))
        tap(40, 40, 0)
        expect(handles().map(handle => handle.getAttribute('style'))).toEqual(before)
      })

      it('lets go of the corner with the first Esc, and closes the tool with the second', () => {
        ;(handles()[1] as HTMLElement).click()
        press('Escape', {}, handles()[1]!)
        expect(pic.getState().activeTool).toBe('crop')
        expect(handles()[1]!.getAttribute('aria-pressed')).toBe('false')
        expect(hint()).toContain('Drag the corners')

        press('Escape', {}, handles()[1]!)
        expect(pic.getState().activeTool).toBeNull()
      })
    })

    it('confirms with Enter on a corner or the viewer', () => {
      crop().click()
      press('Enter', {}, handles()[1]!)
      expect(pic.getState()).toMatchObject({ activeTool: null, canApply: true })
    })

    it('closes when the edit ends', () => {
      crop().click()
      pic.cancel()
      expect(pic.getState()).toMatchObject({ mode: 'view', activeTool: null })
      expect(handles()).toHaveLength(0)
    })

    it('closes when the source changes', () => {
      crop().click()
      pic.setOptions({ src: '/another.jpg' })
      expect(pic.getState().activeTool).toBeNull()
      expect(handles()).toHaveLength(0)
    })

    it('ignores a preview that newer edits have replaced', async () => {
      crop().click()
      button('Done').click()
      pic.undo()
      await flush()
      expect(pic.getState().image).toEqual({ width: 600, height: 250 })
      expect(releasePreview).toHaveBeenCalledOnce()
    })

    it('renders only the latest edits after the preview on its way, and skips the ones between', async () => {
      mocks.renderPreview.mockClear()
      pic.flip()
      pic.setFinish({ mode: 'mono' })
      pic.undo()
      expect(mocks.renderPreview).toHaveBeenCalledOnce()

      await flush()
      expect(mocks.renderPreview).toHaveBeenCalledTimes(2)
      expect(mocks.renderPreview.mock.calls[1]!.slice(1, 3)).toEqual([
        [
          { type: 'flip' },
        ],
        null,
      ])
      // The first one arrived after newer edits
      expect(releasePreview).toHaveBeenCalledOnce()
      expect(pic.getState().image).toEqual({ width: 480, height: 200 })
    })

    it('ignores a preview that arrives after destroy', async () => {
      crop().click()
      button('Done').click()
      pic.destroy()
      await flush()
      expect(releasePreview).toHaveBeenCalledOnce()
    })

    it('reports a preview that fails, and the edit stays open', async () => {
      const onError = vi.fn()
      pic.on('error', onError)
      mocks.renderPreview.mockRejectedValue(new Error('too large'))
      crop().click()
      button('Done').click()
      await flush()
      expect(onError.mock.calls[0]![0]).toMatchObject({
        phase: 'preview',
        error: { message: 'too large' },
      })
      expect(pic.getState()).toMatchObject({ mode: 'edit', canUndo: true })
      expect(crop().getAttribute('aria-disabled')).toBe('false')
      // Its own message, because nothing was applied
      expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The changes could not be shown')
    })
  })

  describe('cleaning up the document', () => {
    const cleanUp = () => bar().querySelector<HTMLButtonElement>('.paperpic-edit-tools [aria-label="Clean up"]')!
    const ruler = () => bar().querySelector<HTMLInputElement>('input[aria-label="Sensitivity"]')!
    const finish = (name: string) => bar().querySelector<HTMLButtonElement>(`[data-paperpic-control="${name}"]`)!
    const dot = () => cleanUp().querySelector<HTMLElement>('.paperpic-edit-dot')!
    const move = (value: number, type: 'input' | 'change') => {
      ruler().value = String(value)
      ruler().dispatchEvent(new Event(type, { bubbles: true }))
    }

    beforeEach(() => {
      tint.mockClear()
      releasePreview.mockClear()
      mocks.renderPreview.mockImplementation(async () => ({
        ...preview(),
        width: 600,
        height: 250,
      }))
      pic.edit()
    })

    it('opens a panel in black and white, with a preview, the finishes and a ruler, and no edit yet', () => {
      expect(dot().hidden).toBe(true)

      cleanUp().click()

      expect(pic.getState()).toMatchObject({
        activeTool: 'finish',
        finish: { mode: 'mono', sensitivity: 0.5 },
        canUndo: false,
        canApply: false,
      })
      expect(ruler().closest<HTMLElement>('.paperpic-ruler')!.hidden).toBe(false)
      expect(ruler().value).toBe('50')
      expect(finish('finishMono').getAttribute('aria-pressed')).toBe('true')
      expect(bar().querySelector<HTMLElement>('.paperpic-edit-title')!.hidden).toBe(true)
      expect(button('Apply').parentElement!.hidden).toBe(true)
      expect(mocks.renderPreview.mock.calls[0]!.slice(1, 3)).toEqual([
        [],
        expect.objectContaining({ sensitivity: 0.5, softness: 0.25 }),
      ])
    })

    it('leaves one edit with Done, which its dot marks for everyone', async () => {
      cleanUp().click()
      await flush()
      button('Done').click()

      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'mono', sensitivity: 0.5 },
        canUndo: true,
        canApply: true,
      })
      expect(dot().hidden).toBe(false)
      expect(document.getElementById(cleanUp().getAttribute('aria-describedby')!)!.textContent).toBe('In use')
      expect(mocks.renderPreview).toHaveBeenCalledOnce()

      pic.undo()
      expect(pic.getState().finish.mode).toBe('original')
      expect(dot().hidden).toBe(true)
      expect(cleanUp().hasAttribute('aria-describedby')).toBe(false)
    })

    it('leaves the image as it was with Cancel', async () => {
      cleanUp().click()
      await flush()
      button('Cancel this tool').click()
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'original' },
        canUndo: false,
      })
      expect(releasePreview).toHaveBeenCalledOnce()
    })

    it('shows the ruler live, and keeps its last value as one edit', async () => {
      cleanUp().click()
      await flush()
      onChange.mockClear()
      tint.mockClear()

      move(60, 'input')
      move(70, 'input')
      // The preview repaints once per frame, with the last value
      expect(tint).not.toHaveBeenCalled()
      runFrames()
      expect(tint).toHaveBeenCalledOnce()
      expect(tint).toHaveBeenLastCalledWith({ type: 'threshold', sensitivity: 0.7, softness: 0.25 })
      expect(pic.getState()).toMatchObject({
        finish: { mode: 'mono', sensitivity: 0.7 },
        canUndo: false,
      })
      expect(onChange).toHaveBeenCalledTimes(2)

      move(70, 'change')
      expect(announcement()).toBe('Sensitivity 70%')
      button('Done').click()
      expect(pic.getState()).toMatchObject({
        finish: { mode: 'mono', sensitivity: 0.7 },
        canUndo: true,
      })
      expect(mocks.renderPreview).toHaveBeenCalledOnce()

      pic.undo()
      expect(pic.getState().finish).toEqual({ mode: 'original', sensitivity: 0.5 })
    })

    it('turns gray, and switches between gray and the original by repainting only', async () => {
      cleanUp().click()
      await flush()
      finish('finishGray').click()
      expect(pic.getState().finish.mode).toBe('gray')
      expect(finish('finishGray').getAttribute('aria-pressed')).toBe('true')
      expect(ruler().disabled).toBe(true)
      expect(mocks.renderPreview).toHaveBeenCalledTimes(2)
      expect(mocks.renderPreview.mock.calls[1]![2]).toEqual({
        type: 'adjust',
        brightness: 0,
        contrast: 0,
        gray: true,
      })
      await flush()
      tint.mockClear()

      finish('finishOriginal').click()
      runFrames()
      expect(tint).toHaveBeenLastCalledWith({ type: 'adjust', brightness: 0, contrast: 0 })
      finish('finishGray').click()
      runFrames()
      expect(tint).toHaveBeenLastCalledWith({
        type: 'adjust',
        brightness: 0,
        contrast: 0,
        gray: true,
      })
      expect(mocks.renderPreview).toHaveBeenCalledTimes(2)

      button('Done').click()
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'gray' },
        canUndo: true,
        canApply: true,
      })
      expect(dot().hidden).toBe(false)
    })

    it('keeps its finish when it opens again, and the original turns it off and keeps the edits after it', async () => {
      pic.setFinish({ mode: 'gray' })
      pic.rotate(1)
      await flush()
      cleanUp().click()
      expect(pic.getState().finish.mode).toBe('gray')

      finish('finishOriginal').click()
      expect(finish('finishOriginal').getAttribute('aria-pressed')).toBe('true')
      expect(pic.getState().finish.mode).toBe('original')

      button('Done').click()
      expect(pic.getState()).toMatchObject({
        finish: { mode: 'original' },
        rotation: 90,
        canUndo: true,
        canApply: true,
      })
    })

    it('keeps the arrow keys of the ruler from panning the image, and lets Enter and Esc close the tool', () => {
      cleanUp().click()
      const onKey = vi.fn()
      container.addEventListener('keydown', onKey)
      ruler().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
      expect(onKey).not.toHaveBeenCalled()

      press('Enter', {}, ruler())
      expect(pic.getState()).toMatchObject({ activeTool: null, canUndo: true })

      cleanUp().click()
      press('Escape', {}, ruler())
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'mono' },
      })
      expect(onKey).toHaveBeenCalledTimes(2)
    })

    it('moves the focus to its ruler, or to its finish in gray, and back to its button', () => {
      cleanUp().focus()
      cleanUp().click()
      expect(document.activeElement).toBe(ruler())
      button('Cancel this tool').click()
      expect(document.activeElement).toBe(cleanUp())

      pic.setFinish({ mode: 'gray' })
      cleanUp().focus()
      cleanUp().click()
      expect(document.activeElement).toBe(finish('finishGray'))
    })

    it('keeps the zoom when it changes', async () => {
      pic.zoomTo(2)
      cleanUp().click()
      await flush()
      expect(pic.getState().zoom).toBe(2)
    })

    it('does not compute anything for a rotation', async () => {
      cleanUp().click()
      await flush()
      button('Done').click()
      pic.rotate(1)
      expect(pic.getState().rotation).toBe(90)
      expect(mocks.renderPreview).toHaveBeenCalledOnce()
    })

    it('uses the softness of the option', () => {
      pic.setOptions({ softness: 0 })
      cleanUp().click()
      expect(mocks.renderPreview.mock.calls[0]![2]).toMatchObject({ softness: 0 })
    })

    it('exports with the finish last', async () => {
      cleanUp().click()
      await flush()
      button('Done').click()
      pic.rotate(1)
      const applying = pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        { type: 'rotate', rotation: 90 },
        { type: 'threshold', sensitivity: 0.5, softness: 0.25 },
      ])
      await finishLoading()
      await applying
      expect(pic.getState().finish.mode).toBe('original')
    })

    it('exports gray after brightness and contrast', async () => {
      pic.setAdjustments({ brightness: 0.2 })
      pic.setFinish({ mode: 'gray' })
      void pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        {
          type: 'adjust',
          brightness: 0.2,
          contrast: 0,
          gray: true,
        },
      ])
    })

    it('shows in Crop, so the image keeps its look, but not in Straighten, which needs the edges of the paper', async () => {
      pic.setFinish({ mode: 'mono' })
      await flush()

      pic.openTool('crop')
      expect(pic.getState().activeTool).toBe('crop')
      expect(mocks.renderPreview).toHaveBeenCalledOnce()
      expect(releasePreview).not.toHaveBeenCalled()
      pic.cancelTool()

      pic.openTool('perspective')
      expect(pic.getState().activeTool).toBe('perspective')
      expect(releasePreview).toHaveBeenCalledOnce()

      pic.cancelTool()
      expect(mocks.renderPreview).toHaveBeenCalledTimes(2)
      expect(mocks.renderPreview.mock.calls[1]![2]).toMatchObject({ sensitivity: 0.5 })
    })

    it('shows gray in Straighten, which keeps the edges of the paper', async () => {
      pic.setFinish({ mode: 'gray' })
      await flush()
      pic.openTool('perspective')
      expect(pic.getState().activeTool).toBe('perspective')
      expect(mocks.renderPreview).toHaveBeenCalledOnce()
      expect(releasePreview).not.toHaveBeenCalled()
    })

    it('changes what its open panel shows from setFinish, which confirmTool keeps', () => {
      pic.openTool('finish')
      pic.setFinish({ sensitivity: 0.8 })
      expect(pic.getState()).toMatchObject({
        activeTool: 'finish',
        finish: { mode: 'mono', sensitivity: 0.8 },
        canUndo: false,
      })
      expect(ruler().value).toBe('80')

      pic.setFinish({ mode: 'gray' })
      expect(finish('finishGray').getAttribute('aria-pressed')).toBe('true')

      pic.confirmTool()
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'gray', sensitivity: 0.8 },
        canUndo: true,
      })
    })

    it('does nothing outside the edit mode or while another tool is open', () => {
      pic.openTool('crop')
      pic.setFinish({ mode: 'mono' })
      pic.openTool('finish')
      expect(pic.getState()).toMatchObject({
        activeTool: 'crop',
        finish: { mode: 'original' },
      })
      pic.cancel()
      pic.setFinish({ mode: 'mono' })
      pic.openTool('finish')
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        finish: { mode: 'original' },
      })
    })

    it('works from code when it is not one of the chosen tools', () => {
      pic.setOptions({
        tools: ['crop'],
      })
      pic.setFinish({ mode: 'mono' })
      expect(pic.getState().finish.mode).toBe('mono')
      pic.openTool('finish')
      expect(pic.getState().activeTool).toBe('finish')
    })

    it('explains a finish or a sensitivity out of range', () => {
      expect(() => pic.setFinish({ sensitivity: 2 })).toThrow('between 0 and 1')
      expect(() => pic.setFinish({ mode: 'sepia' as never })).toThrow(`mode must be 'original', 'gray', 'mono', got sepia`)
      expect(pic.getState().finish.mode).toBe('original')
    })
  })

  describe('adjusting brightness and contrast', () => {
    const adjust = () => bar().querySelector<HTMLButtonElement>('.paperpic-edit-tools [aria-label="Adjust"]')!
    const option = (name: string) => [
      ...bar().querySelectorAll<HTMLButtonElement>('.paperpic-edit-option'),
    ].find(element => element.textContent === name)!
    const ruler = (name: string) => bar().querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!
    const shown = (name: string) => !ruler(name).closest<HTMLElement>('.paperpic-ruler')!.hidden
    const dot = (element: HTMLElement) => element.querySelector<HTMLElement>('.paperpic-edit-dot')!
    const move = (name: string, value: number, type: 'input' | 'change') => {
      ruler(name).value = String(value)
      ruler(name).dispatchEvent(new Event(type, { bubbles: true }))
    }

    beforeEach(() => {
      tint.mockClear()
      releasePreview.mockClear()
      mocks.renderPreview.mockImplementation(async () => ({
        ...preview(),
        width: 600,
        height: 250,
      }))
      pic.edit()
    })

    it('opens a panel with the ruler of brightness, and a preview it can repaint', () => {
      adjust().click()

      expect(pic.getState()).toMatchObject({
        activeTool: 'adjust',
        adjustments: { brightness: 0, contrast: 0 },
        canUndo: false,
      })
      expect(shown('Brightness')).toBe(true)
      expect(shown('Contrast')).toBe(false)
      expect(option('Brightness').getAttribute('aria-pressed')).toBe('true')
      expect(ruler('Brightness').value).toBe('0')
      expect(mocks.renderPreview.mock.calls[0]!.slice(1, 3)).toEqual([
        [],
        { type: 'adjust', brightness: 0, contrast: 0 },
      ])
    })

    it('chooses which tone its ruler changes', () => {
      adjust().click()
      option('Contrast').click()
      expect(shown('Contrast')).toBe(true)
      expect(shown('Brightness')).toBe(false)
      expect(option('Contrast').getAttribute('aria-pressed')).toBe('true')
      expect(option('Brightness').getAttribute('aria-pressed')).toBe('false')
    })

    it('shows the ruler live, and leaves one edit with both tones on Done', async () => {
      adjust().click()
      await flush()
      onChange.mockClear()
      tint.mockClear()

      move('Brightness', 20, 'input')
      move('Brightness', 30, 'input')
      runFrames()
      expect(tint).toHaveBeenCalledOnce()
      expect(tint).toHaveBeenLastCalledWith({ type: 'adjust', brightness: 0.3, contrast: 0 })
      expect(pic.getState()).toMatchObject({
        adjustments: { brightness: 0.3, contrast: 0 },
        canUndo: false,
      })
      expect(onChange).toHaveBeenCalledTimes(2)
      move('Brightness', 30, 'change')
      expect(announcement()).toBe('Brightness +30')

      option('Contrast').click()
      move('Contrast', -20, 'change')
      expect(announcement()).toBe('Contrast -20')

      button('Done').click()
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        adjustments: { brightness: 0.3, contrast: -0.2 },
        canUndo: true,
        canApply: true,
      })
      expect(dot(adjust()).hidden).toBe(false)
      expect(mocks.renderPreview).toHaveBeenCalledOnce()

      pic.undo()
      expect(pic.getState().adjustments).toEqual({ brightness: 0, contrast: 0 })
      expect(dot(adjust()).hidden).toBe(true)
    })

    it('catches the ruler at 0', () => {
      adjust().click()
      move('Brightness', 2, 'input')
      expect(ruler('Brightness').value).toBe('0')
      expect(pic.getState().adjustments.brightness).toBe(0)
    })

    it('leaves the image as it was with Cancel', async () => {
      adjust().click()
      await flush()
      move('Brightness', 40, 'input')
      button('Cancel this tool').click()
      expect(pic.getState()).toMatchObject({
        activeTool: null,
        adjustments: { brightness: 0, contrast: 0 },
        canUndo: false,
      })
      expect(releasePreview).toHaveBeenCalledOnce()
    })

    it('is no change when the values go back to 0', () => {
      pic.setAdjustments({ brightness: 0.4 })
      pic.setAdjustments({ brightness: 0 })
      expect(pic.getState()).toMatchObject({ canUndo: true, canApply: false })
    })

    it('cannot open in black and white, which leaves its tones out', async () => {
      pic.setAdjustments({ contrast: 0.5 })
      expect(dot(adjust()).hidden).toBe(false)
      pic.setFinish({ mode: 'mono' })

      expect(adjust().getAttribute('aria-disabled')).toBe('true')
      expect(dot(adjust()).hidden).toBe(true)
      adjust().click()
      pic.openTool('adjust')
      expect(pic.getState().activeTool).toBeNull()
      pic.setAdjustments({ brightness: 0.5 })
      expect(pic.getState().adjustments).toEqual({ brightness: 0, contrast: 0.5 })
      await flush()
      expect(mocks.renderPreview.mock.calls.at(-1)![2]).toMatchObject({ type: 'threshold' })

      pic.setFinish({ mode: 'original' })
      expect(adjust().getAttribute('aria-disabled')).toBe('false')
      await flush()
      expect(mocks.renderPreview.mock.calls.at(-1)![2]).toEqual({ type: 'adjust', brightness: 0, contrast: 0.5 })
    })

    it('shows its tones while Crop is open, without computing the preview again', async () => {
      pic.setAdjustments({ brightness: 0.2 })
      await flush()
      pic.openTool('crop')
      pic.cancelTool()
      expect(mocks.renderPreview).toHaveBeenCalledOnce()
    })

    it('closes when the edit ends', () => {
      adjust().click()
      pic.cancel()
      expect(pic.getState().activeTool).toBeNull()
      pic.edit()
      expect(bar().querySelector<HTMLElement>('.paperpic-edit-tool')!.hidden).toBe(true)
    })

    it('exports with the adjustments last', async () => {
      pic.setAdjustments({ brightness: 0.1, contrast: 0.2 })
      pic.rotate(1)
      const applying = pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        { type: 'rotate', rotation: 90 },
        { type: 'adjust', brightness: 0.1, contrast: 0.2 },
      ])
      await finishLoading()
      await applying
      expect(pic.getState().adjustments).toEqual({ brightness: 0, contrast: 0 })
    })

    it('does nothing outside the edit mode or while another tool is open, and works without its button', () => {
      pic.openTool('crop')
      pic.setAdjustments({ brightness: 0.5 })
      pic.openTool('adjust')
      expect(pic.getState()).toMatchObject({
        activeTool: 'crop',
        adjustments: { brightness: 0 },
      })
      pic.cancelTool()

      pic.setOptions({
        tools: ['crop'],
      })
      pic.setAdjustments({ brightness: 0.5 })
      expect(pic.getState().adjustments.brightness).toBe(0.5)
      pic.openTool('adjust')
      expect(pic.getState().activeTool).toBe('adjust')
      pic.cancelTool()
      pic.setOptions({ tools: undefined })

      pic.cancel()
      pic.setAdjustments({ brightness: 0.5 })
      expect(pic.getState().adjustments.brightness).toBe(0)
    })

    it('explains a value out of range', () => {
      expect(() => pic.setAdjustments({ contrast: -2 })).toThrow('contrast must be between -1 and 1, got -2')
    })
  })

  describe('flipping', () => {
    const flip = () => bar().querySelector<HTMLButtonElement>('[aria-label="Flip"]')!

    beforeEach(() => {
      releasePreview.mockClear()
      mocks.renderPreview.mockImplementation(async () => ({
        ...preview(),
        width: 600,
        height: 250,
      }))
      pic.edit()
    })

    it('mirrors at once from its button, with a preview of the new pixels', () => {
      flip().click()
      expect(pic.getState()).toMatchObject({ canUndo: true, canApply: true })
      expect(mocks.renderPreview.mock.calls[0]!.slice(1, 3)).toEqual([
        [
          { type: 'flip' },
        ],
        null,
      ])
    })

    it('is no change when it runs twice, and goes back to the image', async () => {
      flip().click()
      await flush()
      flip().click()
      expect(pic.getState()).toMatchObject({ canUndo: true, canApply: false })
      expect(releasePreview).toHaveBeenCalledOnce()
    })

    it('mirrors the image as it is on display, after a turn', async () => {
      pic.rotate(1)
      pic.flip()
      await flush()
      // The preview holds the turn now, so the view matrix has none left
      expect(pic.getState().rotation).toBe(0)
      const applying = pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps).toEqual([
        { type: 'flip' },
        { type: 'rotate', rotation: 270 },
      ])
      await finishLoading()
      await applying
    })

    it('does nothing outside the edit mode or while a tool is open, and works without its button', () => {
      pic.openTool('crop')
      pic.flip()
      expect(pic.getState().canUndo).toBe(false)
      pic.cancelTool()

      pic.setOptions({
        tools: ['crop'],
      })
      expect(flip().hidden).toBe(true)
      pic.flip()
      expect(pic.getState().canUndo).toBe(true)
      pic.setOptions({ tools: undefined })

      pic.cancel()
      onChange.mockClear()
      pic.flip()
      expect(pic.getState().mode).toBe('view')
      expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ canUndo: true }))
    })
  })

  describe('redacting', () => {
    const redact = () => bar().querySelector<HTMLButtonElement>('.paperpic-edit-tools [aria-label="Redact"]')!
    const color = (name: string) => bar().querySelector<HTMLButtonElement>(`[data-paperpic-control="${name}"]`)!
    const handles = () => [
      ...container.querySelectorAll('.paperpic-handle'),
    ]

    beforeEach(() => {
      releasePreview.mockClear()
      mocks.renderPreview.mockImplementation(async () => ({
        ...preview(),
        width: 600,
        height: 250,
      }))
      pic.edit()
    })

    it('opens with corners, a hint and the choice of color, and no edit yet', () => {
      redact().click()
      expect(pic.getState()).toMatchObject({
        activeTool: 'redact',
        hint: 'Drag the area over what to hide',
        redaction: { color: 'black' },
        canUndo: false,
      })
      expect(handles()).toHaveLength(5)
      expect(container.querySelector('.paperpic-area[data-paperpic-control="redactArea"]')).not.toBeNull()
      expect(color('redactBlack').getAttribute('aria-pressed')).toBe('true')
      expect(color('redactBlack').parentElement!.hidden).toBe(false)
      expect(bar().querySelector<HTMLElement>('.paperpic-edit-title')!.hidden).toBe(true)
      expect(mocks.renderPreview).not.toHaveBeenCalled()
    })

    it('leaves one area with Done, which the preview covers over the tones', () => {
      redact().click()
      color('redactWhite').click()
      expect(pic.getState().redaction.color).toBe('white')
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
        redaction: { color: 'white' },
      }))
      button('Done').click()

      expect(pic.getState()).toMatchObject({ activeTool: null, canUndo: true, canApply: true })
      const [, steps, tone, redaction] = mocks.renderPreview.mock.calls[0]!
      expect(steps).toEqual([])
      expect(tone).toBeNull()
      expect(redaction).toEqual({
        type: 'redact',
        areas: [
          expect.objectContaining({ color: 'white' }),
        ],
      })
    })

    it('keeps its color for the next area, and goes back to the image with Undo', async () => {
      pic.setRedaction({ color: 'white' })
      pic.openTool('redact')
      expect(color('redactWhite').getAttribute('aria-pressed')).toBe('true')
      pic.confirmTool()
      await flush()

      pic.undo()
      expect(releasePreview).toHaveBeenCalledOnce()
      expect(pic.getState()).toMatchObject({
        canApply: false,
        redaction: { color: 'white' },
      })
    })

    it('exports the areas last, after black and white', async () => {
      pic.openTool('redact')
      pic.confirmTool()
      pic.setFinish({ mode: 'mono' })
      void pic.apply()
      await flush()
      expect(mocks.exportImage.mock.calls[0]![0].steps.map(({ type }: { type: string }) => type)).toEqual(['threshold', 'redact'])
    })

    it('rejects a color it does not know, and reports no change for the same one', () => {
      expect(() => pic.setRedaction({ color: 'red' as 'black' })).toThrow(/color must be 'black' or 'white', got red/)
      onChange.mockClear()
      pic.setRedaction({ color: 'black' })
      pic.setRedaction({})
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('offers only the chosen tools', () => {
    pic.edit()
    pic.setOptions({ tools: [] })
    expect(bar().querySelector<HTMLButtonElement>('[aria-label="Rotate left"]')!.hidden).toBe(true)
    pic.setOptions({ tools: undefined })
    expect(bar().querySelector<HTMLButtonElement>('[aria-label="Rotate left"]')!.hidden).toBe(false)
  })

  describe('downloading', () => {
    let saves: { download: string, href: string }[]

    const toolbarButton = (label: string) => container.querySelector<HTMLButtonElement>(`.paperpic-toolbar [aria-label="${label}"]`)!

    async function applyRotation() {
      pic.edit()
      pic.rotate(1)
      const applying = pic.apply()
      await flush()
      await finishLoading()
      await applying
    }

    beforeEach(() => {
      saves = []
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        saves.push({
          href: this.getAttribute('href')!,
          download: this.download,
        })
      })
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('has no button unless it is chosen', () => {
      expect(toolbarButton('Download').hidden).toBe(true)
      pic.setOptions({ download: true })
      expect(toolbarButton('Download').hidden).toBe(false)
    })

    it('hides the button while editing, because the edits are not applied yet', () => {
      pic.setOptions({ download: true })
      pic.edit()
      expect(toolbarButton('Download').hidden).toBe(true)
      pic.download()
      expect(saves).toEqual([])
    })

    it('saves the source as it is, under its own name', () => {
      pic.setOptions({ download: true })
      toolbarButton('Download').click()
      expect(saves).toEqual([
        { href: '/receipt.jpg', download: 'receipt.jpg' },
      ])
    })

    it('saves the result of the last Apply, with the extension of its format', async () => {
      mocks.exportImage.mockResolvedValue({
        ...exported,
        blob: new Blob(['x'], { type: 'image/png' }),
        type: 'image/png',
      })
      await applyRotation()
      pic.download()
      expect(saves).toEqual([
        { href: 'blob:fake', download: 'receipt.png' },
      ])
    })

    it('uses the chosen name', () => {
      pic.setOptions({ filename: 'invoice-42' })
      pic.download()
      expect(saves[0]!.download).toBe('invoice-42.jpg')
    })

    it('reports the download first, and lets the consumer save it another way', () => {
      const onDownload = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
      pic.on('download', onDownload)
      pic.download()
      expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ source: '/receipt.jpg', filename: 'receipt.jpg' }))
      expect(saves).toEqual([])
    })

    it('frees the address of a saved result when the image changes or the viewer goes away', async () => {
      await applyRotation()
      pic.download()
      revoke.mockClear()
      pic.reload()
      expect(revoke).toHaveBeenCalledWith('blob:fake')

      await finishLoading()
      await applyRotation()
      pic.download()
      revoke.mockClear()
      pic.destroy()
      expect(revoke).toHaveBeenCalledWith('blob:fake')
    })
  })

  it('keeps the menu of the browser away from the image', () => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    container.querySelector('.paperpic-canvas')!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  describe('controls and icons', () => {
    /** The text that names a control: its accessible name, or its text. */
    const nameOf = (control: HTMLElement) => control.getAttribute('aria-label') ?? control.textContent

    it('names every control in data-paperpic-control with the key of its label', () => {
      pic.edit()
      pic.openTool('crop')
      const controls = [
        ...container.querySelectorAll<HTMLElement>('button, input'),
      ]
      expect(controls.length).toBeGreaterThan(20)

      for (const control of controls) {
        const key = control.dataset.paperpicControl as keyof typeof DEFAULT_LABELS
        expect(DEFAULT_LABELS).toHaveProperty(key)
        expect(nameOf(control)).toBe(DEFAULT_LABELS[key])
      }
    })

    it('puts each icon on its buttons, before their text', () => {
      pic.setOptions({
        icons: {
          apply: '<svg data-icon="check"></svg>',
          rotateDocument: '<svg data-icon="turn"></svg>',
        },
      })

      const apply = button('Apply')
      expect(apply.firstElementChild!.getAttribute('data-icon')).toBe('check')
      expect(apply.textContent).toBe('Apply')
      expect(button('Done').querySelector('[data-icon="check"]')).not.toBeNull()
      expect(bar().querySelector('[data-paperpic-control="rotateLeft"] [data-icon="turn"]')).not.toBeNull()
      expect(container.querySelector('.paperpic-toolbar [data-icon="turn"]')).toBeNull()

      pic.setOptions({
        icons: { apply: '' },
      })
      expect(apply.querySelector('.paperpic-icon')).toBeNull()
      expect(apply.textContent).toBe('Apply')
    })
  })
})
