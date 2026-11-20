import type { PixelBuffer } from '../processing/types'
import type { CanvasMocks } from '../test/canvas'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubCanvas } from '../test/canvas'
import { exportImage, resolveOutputType } from './export'

const steps = [
  { type: 'rotate', rotation: 90 },
] as const

describe('resolveOutputType', () => {
  it('uses the type requested', () => {
    expect(resolveOutputType('/a.jpg', { type: 'image/webp' })).toBe('image/webp')
  })

  it('uses the type of a Blob', () => {
    expect(resolveOutputType(new Blob([], { type: 'image/jpeg' }))).toBe('image/jpeg')
  })

  it.each([
    ['/receipt.jpg', 'image/jpeg'],
    ['/receipt.JPEG?v=2', 'image/jpeg'],
    ['/receipt.webp#top', 'image/webp'],
    ['/receipt.png', 'image/png'],
  ])('reads the extension of %s', (url, type) => {
    expect(resolveOutputType(url)).toBe(type)
  })

  it('falls back to PNG for anything else', () => {
    expect(resolveOutputType('/image')).toBe('image/png')
    expect(resolveOutputType('/image.gif')).toBe('image/png')
    expect(resolveOutputType(new Blob([], { type: 'image/svg+xml' }))).toBe('image/png')
    expect(resolveOutputType(undefined)).toBe('image/png')
    expect(resolveOutputType('/a.jpg', { type: 'image/tiff' })).toBe('image/png')
  })
})

describe('exportImage with a crop', () => {
  it('reads only that part, and has nothing left to run', async () => {
    const { drawImage } = stubCanvas()
    HTMLCanvasElement.prototype.toBlob = (done, type) => done(new Blob(['x'], { type }))
    const image = {} as CanvasImageSource
    const run = vi.fn()

    const result = await exportImage({
      image,
      width: 400,
      height: 200,
      steps: [
        {
          type: 'crop',
          rect: {
            x: 0.5,
            y: 0.5,
            width: 0.5,
            height: 0.5,
          },
        },
      ],
      run,
      source: '/a.png',
    })

    expect(drawImage).toHaveBeenCalledWith(image, 200, 100, 200, 100, 0, 0, 200, 100)
    expect(run).not.toHaveBeenCalled()
    expect(result).toMatchObject({ width: 200, height: 100, type: 'image/png' })
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })
})

describe('exportImage', () => {
  let drawImage: CanvasMocks['drawImage']
  let getImageData: CanvasMocks['getImageData']
  const toBlob = vi.fn()
  const image = {} as CanvasImageSource
  const run = vi.fn()

  beforeEach(() => {
    run.mockReset()
    toBlob.mockReset()
    toBlob.mockImplementation((done: (blob: Blob) => void, type: string) => done(new Blob(['x'], { type })))
    run.mockImplementation(async ({ width, height }: PixelBuffer) => ({
      data: new Uint8ClampedArray(width * height * 4),
      width: height,
      height: width,
    }))
    const canvas = stubCanvas()
    drawImage = canvas.drawImage
    getImageData = canvas.getImageData
    HTMLCanvasElement.prototype.toBlob = toBlob
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const request = {
    image,
    width: 400,
    height: 200,
    steps,
    run,
    source: '/receipt.jpg',
  }

  it('runs the steps and reports the size of the result', async () => {
    const result = await exportImage(request)
    expect(run.mock.calls[0]![1]).toEqual(steps)
    expect(result).toMatchObject({ width: 200, height: 400, type: 'image/jpeg' })
    expect(result.blob.type).toBe('image/jpeg')
  })

  it('reads the image at the limited size', async () => {
    await exportImage({ ...request, maxOutputSize: 100 })
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 400, 200, 0, 0, 100, 50)
    expect(run.mock.calls[0]![0]).toMatchObject({ width: 100, height: 50 })
  })

  it('uses the format and quality requested', async () => {
    await exportImage({
      ...request,
      output: { type: 'image/webp', quality: 0.5 },
    })
    expect(toBlob.mock.calls[0]!.slice(1)).toEqual(['image/webp', 0.5])
  })

  it('reports the format the browser really gave', async () => {
    toBlob.mockImplementation((done: (blob: Blob) => void) => done(new Blob(['x'], { type: 'image/png' })))
    await expect(exportImage({
      ...request,
      output: { type: 'image/webp' },
    })).resolves.toMatchObject({ type: 'image/png' })
  })

  it('explains what to do with an image from another origin', async () => {
    getImageData.mockImplementation(() => {
      throw Object.assign(new Error('tainted'), { name: 'SecurityError' })
    })
    await expect(exportImage(request)).rejects.toThrow('same origin')
    expect(run).not.toHaveBeenCalled()
  })

  it('explains what to do when the browser cannot hold the pixels, and does not blame the origin', async () => {
    getImageData.mockImplementation(() => {
      throw new RangeError('Out of memory')
    })
    await expect(exportImage(request)).rejects.toThrow('maxOutputSize')
    expect(run).not.toHaveBeenCalled()
  })

  it('frees the canvases it used, whether it succeeds or fails', async () => {
    const canvases: HTMLCanvasElement[] = []
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((name: string) => {
      const element = createElement(name)
      if (element instanceof HTMLCanvasElement) {
        canvases.push(element)
      }
      return element
    })

    await exportImage(request)
    expect(canvases).toHaveLength(2)

    getImageData.mockImplementation(() => {
      throw new RangeError('Out of memory')
    })
    await expect(exportImage(request)).rejects.toThrow()
    expect(canvases).toHaveLength(3)
    expect(canvases.map(({ width, height }) => [width, height])).toEqual(Array.from({ length: 3 }, () => [0, 0]))
  })

  it('explains what to do when the image does not fit in a canvas', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    await expect(exportImage(request)).rejects.toThrow('maxOutputSize')
  })

  it('explains what to do when the browser cannot encode the image', async () => {
    toBlob.mockImplementation((done: (blob: Blob | null) => void) => done(null))
    await expect(exportImage(request)).rejects.toThrow('maxOutputSize')
  })
})
