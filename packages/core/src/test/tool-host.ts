import type { Size } from '../processing/types'
import type { ToolHost } from '../tools/types'
import { DEFAULT_LABELS } from '../ui/labels'

/**
 * What the viewer gives an open tool, for a frame of this size shown at 100% from its top left corner. Each part does
 * nothing unless `overrides` replaces it, such as with a `vi.fn()` to check what the tool announces.
 */
export function toolHost(frame: Size, overrides: Partial<ToolHost> = {}): ToolHost {
  return {
    layer: document.createElement('div'),
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
    redactColor: () => 'black',
    paintMagnifier: () => {},
    ...overrides,
  }
}
