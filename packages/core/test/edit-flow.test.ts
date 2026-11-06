import type { Mock } from 'vitest'
import type { PaperPicState } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from '../src'

const mocks = vi.hoisted(() => ({
  exportImage: vi.fn(),
  renderPreview: vi.fn(),
}))

vi.mock('../src/pipeline/export', () => ({ exportImage: mocks.exportImage }))
vi.mock('../src/pipeline/preview', () => ({ renderPreview: mocks.renderPreview }))

let images: { resolve: () => void }[]
const revoke = vi.fn()

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

function preview() {
  return {
    element: {},
    width: 480,
    height: 200,
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
    vi.stubGlobal('requestAnimationFrame', () => 1)
    vi.stubGlobal('cancelAnimationFrame', () => {})
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
    expect(container.querySelector('[role="status"]')!.textContent).toBe('Editing')
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

  it('offers two rotate buttons in the bar, and not in the toolbar', () => {
    pic.edit()
    const rotateRight = bar().querySelector<HTMLButtonElement>('[aria-label="Rotate right"]')!
    const rotateLeft = bar().querySelector<HTMLButtonElement>('[aria-label="Rotate left"]')!
    expect(container.querySelector<HTMLButtonElement>('.paperpic-toolbar [aria-label="Rotate right"]')!.hidden).toBe(true)

    rotateRight.click()
    expect(pic.getState().rotation).toBe(90)
    rotateLeft.click()
    rotateLeft.click()
    expect(pic.getState().rotation).toBe(270)
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

    const applying = pic.apply()
    expect(pic.getState().busy).toBe(true)
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
    expect(container.querySelector('[role="status"]')!.textContent).toBe('Changes applied')
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

    expect(onError.mock.calls[0]![0].error.message).toBe('too large')
    expect(pic.getState()).toMatchObject({ mode: 'edit', busy: false, canApply: true })
    expect(container.querySelector('.paperpic-status-visible')!.textContent).toBe('The changes could not be applied')

    pic.undo()
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

    it('ignores other edits while it is open', async () => {
      crop().click()
      pic.rotate(1)
      pic.undo()
      await pic.apply()
      expect(pic.getState()).toMatchObject({ activeTool: 'crop', rotation: 0, canUndo: false })
      expect(mocks.exportImage).not.toHaveBeenCalled()
    })

    it('cannot open a tool that was not chosen', () => {
      pic.setOptions({
        tools: ['rotate'],
      })
      pic.openTool('crop')
      expect(pic.getState().activeTool).toBeNull()
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
      expect(onError.mock.calls[0]![0].error.message).toBe('too large')
      expect(pic.getState()).toMatchObject({ mode: 'edit', canUndo: true })
      expect(crop().getAttribute('aria-disabled')).toBe('false')
    })
  })

  it('offers only the chosen tools', () => {
    pic.edit()
    pic.setOptions({ tools: [] })
    expect(bar().querySelector<HTMLButtonElement>('[aria-label="Rotate right"]')!.hidden).toBe(true)
    pic.setOptions({ tools: undefined })
    expect(bar().querySelector<HTMLButtonElement>('[aria-label="Rotate right"]')!.hidden).toBe(false)
  })
})
