import type { ReactNode } from 'react'
import type { PaperPicInstance } from '../src'
import { act, createRef, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from '../src'

const core = vi.hoisted(() => ({
  instances: [] as {
    container: HTMLElement
    destroy: ReturnType<typeof vi.fn>
    listeners: Record<string, (payload: unknown) => void>
    setOptions: ReturnType<typeof vi.fn>
  }[],
}))

vi.mock('@paperpic/core', () => ({
  PaperPic: class {
    container: HTMLElement
    listeners: Record<string, (payload: unknown) => void> = {}
    setOptions = vi.fn()
    destroy = vi.fn()

    constructor(container: HTMLElement) {
      this.container = container
      core.instances.push(this)
    }

    on(name: string, listener: (payload: unknown) => void) {
      this.listeners[name] = listener
      return () => {}
    }
  },
}))

// Tells React that the tests wrap updates in act()
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

function render(element: ReactNode) {
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => root.render(element))
  return {
    container,
    rerender: (next: ReactNode) => act(() => root.render(next)),
    unmount: () => act(() => root.unmount()),
  }
}

describe('paperPic', () => {
  beforeEach(() => {
    core.instances.length = 0
  })

  it('creates one viewer on mount, in its own element, and passes the options', () => {
    const { container } = render(<PaperPic src="/doc.png" alt="Document" className="receipt" />)

    expect(core.instances).toHaveLength(1)
    expect(core.instances[0]!.container).toBe(container.firstElementChild)
    expect(container.firstElementChild!.className).toBe('paperpic-host receipt')
    expect(core.instances[0]!.setOptions).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ src: '/doc.png', alt: 'Document' }))
  })

  it('forwards a prop change', () => {
    const { rerender } = render(<PaperPic src="/doc.png" />)

    rerender(<PaperPic src="/doc.png" editable={false} />)

    expect(core.instances[0]!.setOptions).toHaveBeenLastCalledWith(expect.objectContaining({ editable: false, src: '/doc.png' }))
  })

  it('passes the icons to the viewer', () => {
    const icons = { zoomIn: '<svg></svg>' }
    render(<PaperPic src="/doc.png" icons={icons} />)

    expect(core.instances[0]!.setOptions).toHaveBeenCalledWith(expect.objectContaining({ icons }))
  })

  it('passes a removed prop as undefined, so the viewer goes back to its default', () => {
    const { rerender } = render(<PaperPic src="/doc.png" editable={false} />)

    rerender(<PaperPic src="/doc.png" />)

    const options = core.instances[0]!.setOptions.mock.lastCall![0] as object
    expect(options).toHaveProperty('editable', undefined)
  })

  it('does not forward the options again when only a handler changes', () => {
    const { rerender } = render(<PaperPic src="/doc.png" onApply={() => {}} />)

    rerender(<PaperPic src="/doc.png" onApply={() => {}} />)

    expect(core.instances).toHaveLength(1)
    expect(core.instances[0]!.setOptions).toHaveBeenCalledOnce()
  })

  it.each([
    ['apply', 'onApply'],
    ['change', 'onChange'],
    ['download', 'onDownload'],
    ['error', 'onError'],
    ['load', 'onLoad'],
  ])('translates the %s event to the latest %s', (name, prop) => {
    const first = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(<PaperPic src="/doc.png" {...{ [prop]: first }} />)
    rerender(<PaperPic src="/doc.png" {...{ [prop]: latest }} />)
    const payload = { some: 'data' }

    core.instances[0]!.listeners[name]!(payload)

    expect(first).not.toHaveBeenCalled()
    expect(latest).toHaveBeenCalledExactlyOnceWith(payload)
  })

  it('passes the viewer to ref while mounted, and destroys it on unmount', () => {
    const ref = createRef<PaperPicInstance>()
    const { unmount } = render(<PaperPic ref={ref} src="/doc.png" />)
    const pic = core.instances[0]!

    expect(ref.current).toBe(pic)

    unmount()

    expect(pic.destroy).toHaveBeenCalledOnce()
    expect(ref.current).toBeNull()
  })

  it('survives a second mount in strict mode, with one live viewer that has the options', () => {
    const ref = createRef<PaperPicInstance>()
    render(
      <StrictMode>
        <PaperPic ref={ref} src="/doc.png" />
      </StrictMode>,
    )
    const [first, second] = core.instances

    expect(core.instances).toHaveLength(2)
    expect(first!.destroy).toHaveBeenCalledOnce()
    expect(second!.destroy).not.toHaveBeenCalled()
    expect(second!.setOptions).toHaveBeenCalledWith(expect.objectContaining({ src: '/doc.png' }))
    expect(ref.current).toBe(second)
  })
})
