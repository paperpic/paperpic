import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('warnWithoutStyles', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // A fresh module, so each test starts before the warning of the page
    vi.resetModules()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    document.head.replaceChildren()
    document.body.replaceChildren()
  })

  afterEach(() => {
    warn.mockRestore()
  })

  function root() {
    const element = document.createElement('div')
    element.className = 'paperpic'
    document.body.append(element)
    return element
  }

  it('explains how to import the missing stylesheet, once per page', async () => {
    const { warnWithoutStyles } = await import('../src/ui/styles-check')

    warnWithoutStyles(root())
    warnWithoutStyles(root())

    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]![0]).toMatch(/@paperpic\/core\/style\.css/)
  })

  it('stays quiet when the stylesheet applies', async () => {
    const { warnWithoutStyles } = await import('../src/ui/styles-check')
    const style = document.createElement('style')
    style.textContent = '.paperpic { display: flex }'
    document.head.append(style)

    warnWithoutStyles(root())

    expect(warn).not.toHaveBeenCalled()
  })

  it('waits for a viewer outside the page', async () => {
    const { warnWithoutStyles } = await import('../src/ui/styles-check')

    warnWithoutStyles(document.createElement('div'))

    expect(warn).not.toHaveBeenCalled()
  })
})
