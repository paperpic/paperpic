import { describe, expect, it } from 'vitest'
import { downloadName } from '../src/download'

const png = new Blob(['x'], { type: 'image/png' })
const jpeg = new Blob(['x'], { type: 'image/jpeg' })

describe('downloadName', () => {
  it('keeps the name of a URL that is saved as it is', () => {
    expect(downloadName('/samples/receipt.jpg', '/samples/receipt.jpg')).toBe('receipt.jpg')
    expect(downloadName('/a/My%20receipt.webp?v=2#top', '/a/My%20receipt.webp?v=2#top')).toBe('My receipt.webp')
  })

  it('keeps the name of an attached file', () => {
    const file = new File(['x'], 'scan.jpeg', { type: 'image/jpeg' })
    expect(downloadName(file, file)).toBe('scan.jpg')
  })

  it('follows the format of an edited image', () => {
    expect(downloadName(png, '/samples/receipt.jpg')).toBe('receipt.png')
    expect(downloadName(png, new File(['x'], 'scan.JPG', { type: 'image/jpeg' }))).toBe('scan.png')
  })

  it('uses the name the consumer chose, with the right extension', () => {
    expect(downloadName(png, '/receipt.jpg', 'invoice-42')).toBe('invoice-42.png')
    expect(downloadName(png, '/receipt.jpg', 'invoice-42.jpg')).toBe('invoice-42.png')
    expect(downloadName(jpeg, undefined, 'invoice.v2')).toBe('invoice.v2.jpg')
  })

  it('falls back to image when nothing gives a name', () => {
    expect(downloadName(jpeg, jpeg)).toBe('image.jpg')
    expect(downloadName(png, 'data:image/png;base64,eA==')).toBe('image.png')
    expect(downloadName(png, 'blob:https://example.com/1234')).toBe('image.png')
    expect(downloadName(png, '/images/')).toBe('image.png')
  })

  it('leaves the name alone when the format is unknown', () => {
    expect(downloadName('/api/images/42', '/api/images/42')).toBe('42')
    expect(downloadName(new Blob(['x'], { type: 'image/tiff' }), new File(['x'], 'scan.tif'))).toBe('scan.tif')
  })

  it('keeps a name with a broken escape', () => {
    expect(downloadName('/100%.png', '/100%.png')).toBe('100%.png')
  })
})
