import type { CanvasMocks } from '../test/canvas'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubCanvas } from '../test/canvas'
import { pixelsToCanvas, readPixels, releaseCanvas } from './pixels'

const plan = {
  region: {
    x: 10,
    y: 20,
    width: 400,
    height: 200,
  },
  width: 100,
  height: 50,
  steps: [],
}

describe('pixels', () => {
  let drawImage: CanvasMocks['drawImage']
  let getImageData: CanvasMocks['getImageData']
  let putImageData: CanvasMocks['putImageData']
  const canvases: HTMLCanvasElement[] = []

  beforeEach(() => {
    canvases.length = 0
    const canvas = stubCanvas()
    drawImage = canvas.drawImage
    getImageData = canvas.getImageData
    putImageData = canvas.putImageData
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((name: string) => {
      const element = createElement(name)
      if (element instanceof HTMLCanvasElement) {
        canvases.push(element)
      }
      return element
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('readPixels', () => {
    const image = {} as CanvasImageSource

    it('reads the region of the plan at the size of the plan, and frees its canvas', () => {
      const pixels = readPixels(image, plan)
      expect(drawImage).toHaveBeenCalledWith(image, 10, 20, 400, 200, 0, 0, 100, 50)
      expect(pixels).toMatchObject({ width: 100, height: 50 })
      expect(pixels.data).toHaveLength(100 * 50 * 4)
      expect(canvases.map(({ width, height }) => [width, height])).toEqual([
        [0, 0],
      ])
    })

    it('explains what to do when the canvas is too large to have a context', () => {
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
      expect(() => readPixels(image, plan)).toThrow('The browser could not read an image of 100×50. Set maxOutputSize to a smaller value.')
      expect(canvases[0]!.width).toBe(0)
    })

    it('explains what to do with an image from another origin', () => {
      getImageData.mockImplementation(() => {
        throw Object.assign(new Error('tainted'), { name: 'SecurityError' })
      })
      expect(() => readPixels(image, plan)).toThrow('Serve it from the same origin, or pass it as a Blob or a File.')
    })

    it('blames the size for any other failure, and keeps the cause', () => {
      const cause = new RangeError('Out of memory')
      getImageData.mockImplementation(() => {
        throw cause
      })
      expect(() => readPixels(image, plan)).toThrow(expect.objectContaining({
        message: expect.stringContaining('maxOutputSize'),
        cause,
      }))
      expect(canvases[0]!.width).toBe(0)
    })
  })

  describe('pixelsToCanvas', () => {
    it('puts the pixels on a canvas of their size', () => {
      const data = new Uint8ClampedArray(2 * 3 * 4)
      const canvas = pixelsToCanvas({ data, width: 2, height: 3 })
      expect([canvas.width, canvas.height]).toEqual([2, 3])
      expect(putImageData).toHaveBeenCalledWith(expect.objectContaining({ data, width: 2, height: 3 }), 0, 0)
    })
  })

  describe('releaseCanvas', () => {
    it('leaves the canvas with no pixels', () => {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      releaseCanvas(canvas)
      expect([canvas.width, canvas.height]).toEqual([0, 0])
    })
  })
})
