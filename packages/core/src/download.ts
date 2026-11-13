import { typeFromUrl } from './pipeline/export'

/** What the `download` event carries. */
export interface PaperPicDownload {
  /** The name of the file, with the extension of its format. */
  filename: string
  /** Stops the browser from saving the file, so you can save it another way. */
  preventDefault: () => void
  /** The image to save: the result of the last Apply, or else the `src`. */
  source: string | Blob
}

const DEFAULT_NAME = 'image'
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|gif|avif|bmp|svg)$/i
const SAVABLE_TYPE = /^image\/(jpeg|png|webp|gif|avif|bmp)$/

/** The last part of a URL, or nothing for a URL that holds the data itself. */
function nameInUrl(url: string): string {
  if (/^(?:data|blob):/i.test(url)) {
    return ''
  }
  const name = url.split(/[?#]/)[0]!.split('/').pop()!
  try {
    return decodeURIComponent(name)
  }
  catch {
    return name
  }
}

/**
 * Chooses the name of a saved file: the one given, or the name of the file or the URL that was loaded, or `image`.
 * When the format of the image is known, the name ends in its extension, so a cleaned up `receipt.jpg` saves as `receipt.png`.
 *
 * @param image What gets saved: a URL or the result of an edit.
 * @param source What was loaded, which gives the name.
 * @param filename The name the consumer chose.
 */
export function downloadName(image: string | Blob, source: string | Blob | undefined, filename?: string): string {
  const original = source instanceof File
    ? source.name
    : typeof source === 'string'
      ? nameInUrl(source)
      : ''
  const name = filename || original || DEFAULT_NAME
  const type = typeof image === 'string'
    ? typeFromUrl(image)
    : image.type
  const subtype = type && SAVABLE_TYPE.exec(type)?.[1]
  if (!subtype) {
    return name
  }
  const extension = subtype === 'jpeg'
    ? 'jpg'
    : subtype
  return `${name.replace(IMAGE_EXTENSION, '') || DEFAULT_NAME}.${extension}`
}

/** Makes the browser save a file, as a link with `download` would. */
export function saveFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
