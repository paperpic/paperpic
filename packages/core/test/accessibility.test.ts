import type { AxeResults } from 'axe-core'
import axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PaperPic } from '../src'

const mocks = vi.hoisted(() => ({
  exportImage: vi.fn(),
  renderPreview: vi.fn(),
}))

vi.mock('../src/pipeline/export', async importOriginal => ({
  ...await importOriginal<typeof import('../src/pipeline/export')>(),
  exportImage: mocks.exportImage,
}))
vi.mock('../src/pipeline/preview', () => ({ renderPreview: mocks.renderPreview }))

let images: { resolve: () => void }[]

async function flush() {
  for (let i = 0; i < 6; i++) {
    await Promise.resolve()
  }
}

async function finishLoading() {
  images.at(-1)!.resolve()
  await flush()
}

/** One line per broken rule and element, so a failure says what to fix. */
function describeViolations(results: AxeResults): string[] {
  return results.violations.flatMap(violation => violation.nodes.map(node => `${violation.id}: ${node.target.join(' ')}`))
}

describe('accessibility', () => {
  let container: HTMLElement
  let pic: PaperPic

  const audit = async () => describeViolations(await axe.run(container, {
    rules: {
      // Needs layout and painting, which happy-dom lacks. The spec lists the contrast of the tokens, checked by hand
      'color-contrast': { enabled: false },
      // Landmarks belong to the page that hosts the component
      'region': { enabled: false },
    },
  }))

  const button = (label: string) => container.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!

  beforeEach(async () => {
    images = []
    mocks.exportImage.mockReset()
    mocks.renderPreview.mockReset()
    mocks.renderPreview.mockImplementation(async () => ({
      element: {},
      width: 600,
      height: 250,
      tint: vi.fn(),
      release: vi.fn(),
    }))

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
    URL.revokeObjectURL = () => {}
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 300 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 150 })

    container = document.createElement('div')
    document.body.replaceChildren(container)
    pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Receipt from 5 November', download: true })
  })

  afterEach(() => {
    pic.destroy()
    vi.unstubAllGlobals()
  })

  it('has no violations while the image loads', async () => {
    expect(await audit()).toEqual([])
  })

  it('has no violations in the viewer', async () => {
    await finishLoading()
    expect(await audit()).toEqual([])
  })

  it('has no violations without a description of the image', async () => {
    await finishLoading()
    pic.setOptions({ alt: undefined })
    expect(await audit()).toEqual([])
  })

  it('has no violations in a read-only viewer', async () => {
    await finishLoading()
    pic.setOptions({ editable: false })
    expect(await audit()).toEqual([])
  })

  it('has no violations in the edit mode', async () => {
    await finishLoading()
    pic.edit()
    expect(await audit()).toEqual([])
  })

  it.each(['crop', 'perspective'] as const)('has no violations with the corner handles of %s', async (tool) => {
    await finishLoading()
    pic.edit()
    pic.openTool(tool)
    expect(await audit()).toEqual([])
  })

  it('has no violations with a selected corner', async () => {
    await finishLoading()
    pic.edit()
    pic.openTool('crop')
    container.querySelector<HTMLButtonElement>('.paperpic-handle')!.click()
    expect(container.querySelector('[aria-pressed="true"].paperpic-handle')).not.toBeNull()
    expect(await audit()).toEqual([])
  })

  it('has no violations with the ruler of Clean up', async () => {
    await finishLoading()
    pic.edit()
    button('Clean up').click()
    await flush()
    expect(await audit()).toEqual([])
  })

  it('has no violations with the switch of Clean up, which shows once it is an edit', async () => {
    await finishLoading()
    pic.edit()
    pic.setThreshold({ enabled: true })
    await flush()
    button('Clean up').click()
    expect(container.querySelector<HTMLElement>('[role="switch"]')!.hidden).toBe(false)
    expect(await audit()).toEqual([])
  })

  it('has no violations with the ruler and the choice of Adjust', async () => {
    await finishLoading()
    pic.edit()
    button('Adjust').click()
    await flush()
    expect(await audit()).toEqual([])
  })

  it('has no violations with a tool in use, whose dot has a description', async () => {
    await finishLoading()
    pic.edit()
    pic.setThreshold({ enabled: true })
    await flush()
    expect(button('Clean up').getAttribute('aria-describedby')).not.toBeNull()
    expect(await audit()).toEqual([])
  })

  it('has no violations while asking to discard the changes', async () => {
    await finishLoading()
    pic.edit()
    pic.rotate(1)
    button('Cancel').click()
    expect(container.querySelector('.paperpic-edit-confirmation')!.hasAttribute('hidden')).toBe(false)
    expect(await audit()).toEqual([])
  })
})
