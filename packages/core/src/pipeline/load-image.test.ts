import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadImage } from './load-image'

class FakeImage {
  static next: { fail?: Error, height?: number, width?: number } = {}
  src = ''
  naturalWidth = 0
  naturalHeight = 0

  async decode(): Promise<void> {
    const { fail, width = 800, height = 600 } = FakeImage.next
    if (fail) {
      throw fail
    }
    this.naturalWidth = width
    this.naturalHeight = height
  }
}

describe('loadImage', () => {
  const createObjectURL = vi.fn(() => 'blob:file')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    FakeImage.next = {}
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    vi.stubGlobal('Image', FakeImage)
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads a URL at its natural size', async () => {
    const image = await loadImage('/receipt.jpg')
    expect(image).toMatchObject({ width: 800, height: 600 })
    expect((image.element as unknown as FakeImage).src).toBe('/receipt.jpg')
    image.release()
    expect(createObjectURL).not.toHaveBeenCalled()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })

  it('loads a file through an object URL, which release frees', async () => {
    const file = new Blob(['x'], { type: 'image/png' })
    const image = await loadImage(file)
    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect((image.element as unknown as FakeImage).src).toBe('blob:file')
    expect(revokeObjectURL).not.toHaveBeenCalled()
    image.release()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file')
  })

  it('names the URL that failed, keeps the cause and frees the object URL', async () => {
    const cause = new Error('EncodingError')
    FakeImage.next = { fail: cause }
    await expect(loadImage('/missing.jpg')).rejects.toThrow(expect.objectContaining({
      message: expect.stringContaining('Could not load the image from "/missing.jpg"'),
      cause,
    }))
    await expect(loadImage(new Blob())).rejects.toThrow('Could not load the image from the given file')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file')
  })

  it('explains what to do with an image without a size, such as an SVG', async () => {
    FakeImage.next = { width: 0 }
    await expect(loadImage(new Blob())).rejects.toThrow('give it width and height attributes')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file')
  })
})
