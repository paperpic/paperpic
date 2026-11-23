import type { PixelBuffer, Quad } from '../processing/types'
import type { CanvasMocks } from '../test/canvas'
import type { PipelineStep } from './steps'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { rectangleCorners } from '../processing/homography'
import { stubCanvas } from '../test/canvas'
import { loadedImage } from '../test/images'
import { findDocument } from './detection'

const corners = rectangleCorners(0.1, 0.2, 0.8, 0.9)
const wanted = () => true

describe('findDocument', () => {
  let canvas: CanvasMocks
  const runner = {
    detect: vi.fn<(source: PixelBuffer, steps: readonly PipelineStep[], wanted: () => boolean) => Promise<Quad | null>>(),
  }

  beforeEach(() => {
    canvas = stubCanvas()
    runner.detect.mockReset()
    runner.detect.mockResolvedValue(corners)
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      callback()
      return 1
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('looks at a small copy of the image, and gives the corners that the search finds', async () => {
    await expect(findDocument(loadedImage(4000, 3000), [], runner, wanted)).resolves.toBe(corners)
    expect(canvas.drawImage.mock.calls[0]!.slice(1)).toEqual([0, 0, 4000, 3000, 0, 0, 800, 600])
    expect(runner.detect).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ width: 800, height: 600 }), [], wanted)
  })

  it('looks at the image as the edits leave it', async () => {
    await findDocument(loadedImage(4000, 3000), [
      {
        type: 'crop',
        rect: {
          x: 0.5,
          y: 0,
          width: 0.5,
          height: 0.5,
        },
      },
      { type: 'rotate', rotation: 90 },
    ], runner, wanted)
    expect(canvas.drawImage.mock.calls[0]!.slice(1)).toEqual([2000, 0, 2000, 1500, 0, 0, 800, 600])
    expect(runner.detect.mock.calls[0]![1]).toEqual([
      { type: 'rotate', rotation: 90 },
    ])
  })

  it('reads a limited area of a large photo, even when a crop after a perspective change leaves a small result', async () => {
    await findDocument(loadedImage(8000, 6000), [
      {
        type: 'perspective',
        quad: rectangleCorners(0, 0, 1, 1),
        aspectRatio: 4 / 3,
      },
      {
        type: 'crop',
        rect: {
          x: 0.4,
          y: 0.4,
          width: 0.05,
          height: 0.05,
        },
      },
    ], runner, wanted)
    const { width, height } = runner.detect.mock.calls[0]![0]
    expect(width * height).toBeLessThan(2_010_000)
  })

  it('does not read the image once nobody wants the result', async () => {
    await expect(findDocument(loadedImage(400, 300), [], runner, () => false)).resolves.toBeNull()
    expect(canvas.drawImage).not.toHaveBeenCalled()
    expect(runner.detect).not.toHaveBeenCalled()
  })

  it('lets the browser paint the open tool before it reads the image', async () => {
    let paint: (() => void) | undefined
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      paint = callback
      return 1
    })
    const search = findDocument(loadedImage(400, 300), [], runner, wanted)
    expect(canvas.drawImage).not.toHaveBeenCalled()
    paint!()
    await search
    expect(canvas.drawImage).toHaveBeenCalledOnce()
  })

  it('finds nothing when the search finds nothing', async () => {
    runner.detect.mockResolvedValue(null)
    await expect(findDocument(loadedImage(400, 300), [], runner, wanted)).resolves.toBeNull()
  })

  it('finds nothing when the search fails, because the user can place the corners', async () => {
    runner.detect.mockRejectedValue(new Error('The viewer was destroyed while processing.'))
    await expect(findDocument(loadedImage(400, 300), [], runner, wanted)).resolves.toBeNull()
  })

  it('finds nothing in an image that cannot be read, such as one from another origin', async () => {
    canvas.getImageData.mockImplementation(() => {
      throw Object.assign(new Error('tainted'), { name: 'SecurityError' })
    })
    await expect(findDocument(loadedImage(400, 300), [], runner, wanted)).resolves.toBeNull()
    expect(runner.detect).not.toHaveBeenCalled()
  })
})
