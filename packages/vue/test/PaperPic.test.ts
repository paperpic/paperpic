import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from '../src'

const core = vi.hoisted(() => ({
  instances: [] as {
    container: HTMLElement
    destroy: ReturnType<typeof vi.fn>
    listeners: Record<string, (payload: unknown) => void>
    options: Record<string, unknown>
    setOptions: ReturnType<typeof vi.fn>
  }[],
}))

vi.mock('@paperpic/core', () => ({
  PaperPic: class {
    container: HTMLElement
    options: Record<string, unknown>
    listeners: Record<string, (payload: unknown) => void> = {}
    setOptions = vi.fn()
    destroy = vi.fn()

    constructor(container: HTMLElement, options: Record<string, unknown>) {
      this.container = container
      this.options = options
      core.instances.push(this)
    }

    on(name: string, listener: (payload: unknown) => void) {
      this.listeners[name] = listener
      return () => {}
    }
  },
}))

describe('paperPic', () => {
  beforeEach(() => {
    core.instances.length = 0
  })

  it('creates one viewer on mount, in its own element', () => {
    const wrapper = mount(PaperPic, {
      props: { src: '/doc.png', alt: 'Document' },
    })

    expect(core.instances).toHaveLength(1)
    expect(core.instances[0]!.container).toBe(wrapper.element)
    expect(core.instances[0]!.options).toMatchObject({ src: '/doc.png', alt: 'Document' })
  })

  it('keeps the defaults of the viewer when a boolean prop is absent', () => {
    mount(PaperPic, {
      props: { src: '/doc.png' },
    })

    expect(core.instances[0]!.options).toMatchObject({ editable: true, toolbar: true, wheelZoom: true })
  })

  it('forwards a prop change', async () => {
    const wrapper = mount(PaperPic, {
      props: { src: '/doc.png' },
    })

    await wrapper.setProps({ editable: false })

    expect(core.instances[0]!.setOptions).toHaveBeenCalledWith(expect.objectContaining({ editable: false, src: '/doc.png' }))
  })

  it('passes the icons to the viewer', () => {
    const icons = { zoomIn: '<svg></svg>' }
    mount(PaperPic, {
      props: { src: '/doc.png', icons },
    })

    expect(core.instances[0]!.options).toMatchObject({ icons })
  })

  it.each([
    'apply',
    'change',
    'download',
    'error',
    'load',
  ])('translates the %s event', (name) => {
    const wrapper = mount(PaperPic, {
      props: { src: '/doc.png' },
    })
    const payload = { some: 'data' }

    core.instances[0]!.listeners[name]!(payload)

    expect(wrapper.emitted(name)).toEqual([
      [payload],
    ])
  })

  it('exposes the viewer while mounted, and destroys it on unmount', () => {
    const wrapper = mount(PaperPic, {
      props: { src: '/doc.png' },
    })
    const pic = core.instances[0]!

    expect((wrapper.vm as unknown as { instance: unknown }).instance).toBe(pic)

    wrapper.unmount()

    expect(pic.destroy).toHaveBeenCalledOnce()
  })
})
