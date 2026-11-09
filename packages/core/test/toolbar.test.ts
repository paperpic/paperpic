import type { ToolbarState } from '../src/ui/toolbar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LABELS } from '../src/ui/labels'
import { Toolbar } from '../src/ui/toolbar'

const state: ToolbarState = {
  fit: 'image',
  canEdit: false,
  canZoomIn: true,
  canZoomOut: true,
  canRotate: true,
  canDownload: false,
}

describe('toolbar', () => {
  const commands = {
    edit: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    fit: vi.fn(),
    rotate: vi.fn(),
    download: vi.fn(),
  }
  let toolbar: Toolbar

  const button = (label: string) => toolbar.element.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!

  beforeEach(() => {
    vi.clearAllMocks()
    toolbar = new Toolbar(commands, DEFAULT_LABELS)
    document.body.replaceChildren(toolbar.element)
    toolbar.update(state)
  })

  it('names every button, because they only have icons', () => {
    for (const element of toolbar.element.querySelectorAll('button')) {
      expect(element.getAttribute('aria-label')).toBeTruthy()
      expect(element.title).toBeTruthy()
    }
    expect(toolbar.element.getAttribute('role')).toBe('toolbar')
    expect(toolbar.element.getAttribute('aria-label')).toBe(DEFAULT_LABELS.toolbar)
  })

  it('runs the commands', () => {
    button('Zoom in').click()
    button('Zoom out').click()
    button('Fit to width').click()
    button('Fit to height').click()
    button('Rotate left').click()
    button('Rotate right').click()

    expect(commands.zoomIn).toHaveBeenCalledOnce()
    expect(commands.zoomOut).toHaveBeenCalledOnce()
    expect(commands.fit.mock.calls).toEqual([
      ['width'],
      ['height'],
    ])
    expect(commands.rotate.mock.calls).toEqual([
      [-1],
      [1],
    ])
  })

  it('shows the Edit pencil first, only when editing is available', () => {
    expect(button('Edit').hidden).toBe(true)
    toolbar.update({ ...state, canEdit: true })
    expect(button('Edit').hidden).toBe(false)
    expect(toolbar.element.firstElementChild).toBe(button('Edit'))

    button('Edit').click()
    expect(commands.edit).toHaveBeenCalledOnce()
  })

  it('moves the focus to the pencil, or to zoom when the pencil is hidden', () => {
    toolbar.focus()
    expect(document.activeElement).toBe(button('Zoom in'))
    toolbar.update({ ...state, canEdit: true })
    toolbar.focus()
    expect(document.activeElement).toBe(button('Edit'))
  })

  it('hides rotation when it is not available', () => {
    toolbar.update({ ...state, canRotate: false })
    expect(button('Rotate left').hidden).toBe(true)
    expect(button('Rotate right').hidden).toBe(true)
  })

  it('shows the download button last, only when it is chosen', () => {
    expect(button('Download').hidden).toBe(true)
    toolbar.update({ ...state, canDownload: true })
    expect(button('Download').hidden).toBe(false)
    expect(toolbar.element.lastElementChild).toBe(button('Download'))

    button('Download').click()
    expect(commands.download).toHaveBeenCalledOnce()
  })

  it('marks the fit in effect', () => {
    toolbar.update({ ...state, fit: 'width' })
    expect(button('Fit to width').getAttribute('aria-pressed')).toBe('true')
    expect(button('Fit to height').getAttribute('aria-pressed')).toBe('false')
  })

  it('keeps a button at its limit focusable, and it does nothing', () => {
    toolbar.update({ ...state, canZoomIn: false })
    const zoomIn = button('Zoom in')

    expect(zoomIn.getAttribute('aria-disabled')).toBe('true')
    expect(zoomIn.disabled).toBe(false)

    zoomIn.click()
    expect(commands.zoomIn).not.toHaveBeenCalled()
  })

  it('moves through the buttons with the arrow keys, leaving one in the tab order', () => {
    const zoomIn = button('Zoom in')
    zoomIn.focus()
    zoomIn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

    expect(document.activeElement).toBe(button('Zoom out'))
    expect(button('Zoom out').tabIndex).toBe(0)
    expect(zoomIn.tabIndex).toBe(-1)

    button('Zoom out').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(button('Rotate right'))

    button('Rotate right').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(zoomIn)
  })

  it('skips hidden buttons, and leaves the tab order on a visible one', () => {
    button('Rotate left').focus()
    toolbar.update({ ...state, canRotate: false })
    expect(button('Zoom in').tabIndex).toBe(0)

    button('Zoom in').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    expect(document.activeElement).toBe(button('Fit to height'))
  })

  it('keeps the arrow keys from panning the image behind it', () => {
    const outer = vi.fn()
    toolbar.element.parentElement!.addEventListener('keydown', outer)
    button('Zoom in').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(outer).not.toHaveBeenCalled()
  })

  it('updates its texts', () => {
    toolbar.setLabels({ ...DEFAULT_LABELS, zoomIn: 'Acercar' })
    expect(button('Acercar')).not.toBeNull()
  })
})
