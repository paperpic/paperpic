import type { ToolContext, ToolHost } from './types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LABELS } from '../ui/labels'
import { cropTool } from './crop'

const frame = { width: 1000, height: 500 }

describe('crop tool', () => {
  let host: ToolHost

  const handles = () => [
    ...host.layer.querySelectorAll<HTMLButtonElement>('.paperpic-handle'),
  ]
  const press = (handle: Element, key: string) => {
    handle.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }))
  }

  beforeEach(() => {
    const layer = document.createElement('div')
    document.body.replaceChildren(layer)
    host = {
      layer,
      frameSize: () => frame,
      frameToViewport: point => point,
      viewportToFrame: point => point,
      reveal: () => {},
      requestPaint: () => {},
      setHint: () => {},
      announce: () => {},
      labels: () => DEFAULT_LABELS,
      photoFrame: () => ({
        photo: frame,
        origin: { x: 0, y: 0 },
      }),
      aspectRatio: () => undefined,
      paintMagnifier: () => {},
    }
  })

  it('opens itself from its button', () => {
    const context = {
      openTool: vi.fn(),
    } as unknown as ToolContext
    cropTool.actions[0]!.run(context)
    expect(context.openTool).toHaveBeenCalledWith('crop')
  })

  it('gives a rectangle as fractions of the image', () => {
    const session = cropTool.activate!(host)
    expect(session.confirm()).toEqual({
      type: 'crop',
      rect: {
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.8,
      },
    })
  })

  it('gives nothing when the selection is the whole image', () => {
    const session = cropTool.activate!(host)
    for (const [index, [x, y]] of [
      [0, 0],
      [1000, 0],
      [1000, 500],
      [0, 500],
    ].entries()) {
      for (let times = 0; times < 20; times++) {
        press(handles()[index]!, x === 0
          ? 'ArrowLeft'
          : 'ArrowRight')
        press(handles()[index]!, y === 0
          ? 'ArrowUp'
          : 'ArrowDown')
      }
    }
    expect(session.confirm()).toBeNull()
  })
})
