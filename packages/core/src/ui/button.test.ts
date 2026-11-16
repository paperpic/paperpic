import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ICON = '<svg viewBox="0 0 24 24"><path d="M0 0h24" /></svg>'

/** Loads the buttons again, because they create their policy once per page. */
async function freshButtons() {
  vi.resetModules()
  return import('./button')
}

describe('icons under Trusted Types', () => {
  const createPolicy = vi.fn()

  beforeEach(() => {
    createPolicy.mockReset()
    vi.stubGlobal('trustedTypes', { createPolicy })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('passes the markup of every icon through one policy named paperpic', async () => {
    const createHTML = vi.fn((markup: string) => markup)
    createPolicy.mockReturnValue({ createHTML })
    const { createButton, setIcon } = await freshButtons()
    const first = createButton('zoomIn', () => {})
    const second = createButton('zoomOut', () => {})

    setIcon(first, ICON)
    setIcon(second, ICON)

    expect(createPolicy).toHaveBeenCalledOnce()
    expect(createPolicy.mock.calls[0]![0]).toBe('paperpic')
    expect(createPolicy.mock.calls[0]![1].createHTML(ICON)).toBe(ICON)
    expect(createHTML).toHaveBeenCalledTimes(2)
    expect(first.querySelector('.paperpic-icon')).not.toBeNull()
    expect(second.querySelector('.paperpic-icon')).not.toBeNull()
  })

  it('uses the markup as it is where the page does not allow the policy', async () => {
    createPolicy.mockImplementation(() => {
      throw new TypeError('Policy "paperpic" disallowed.')
    })
    const { createButton, setIcon } = await freshButtons()
    const button = createButton('zoomIn', () => {})

    setIcon(button, ICON)
    setIcon(button, '')

    expect(createPolicy).toHaveBeenCalledOnce()
    expect(button.querySelector('.paperpic-icon')).toBeNull()
  })

  it('needs no Trusted Types, which some browsers lack', async () => {
    vi.unstubAllGlobals()
    const { createButton, setIcon } = await freshButtons()
    const button = createButton('zoomIn', () => {})

    setIcon(button, ICON)

    expect(button.querySelector('.paperpic-icon')).not.toBeNull()
  })
})
