import type { Mock } from 'vitest'
import { vi } from 'vitest'

/** The mocks of the 2D context that `stubCanvas` gives every canvas. */
export interface CanvasMocks {
  drawImage: Mock<CanvasRenderingContext2D['drawImage']>
  getImageData: Mock<(x: number, y: number, width: number, height: number) => { data: Uint8ClampedArray }>
  putImageData: Mock<(image: ImageData, x: number, y: number) => void>
}

/**
 * Replaces the 2D context of every canvas, which happy-dom lacks, and `ImageData`. `read` gives the pixels that
 * `getImageData` returns, transparent black by default. Restore it with `vi.restoreAllMocks()` and `vi.unstubAllGlobals()`.
 */
export function stubCanvas(read = (width: number, height: number) => new Uint8ClampedArray(width * height * 4)): CanvasMocks {
  const context: CanvasMocks = {
    drawImage: vi.fn(),
    getImageData: vi.fn((_x: number, _y: number, width: number, height: number) => ({
      data: read(width, height),
    })),
    putImageData: vi.fn(),
  }
  vi.stubGlobal('ImageData', class {
    constructor(readonly data: Uint8ClampedArray, readonly width: number, readonly height: number) {}
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  return context
}
