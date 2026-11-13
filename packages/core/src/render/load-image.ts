/** An image ready to paint. */
export interface LoadedImage {
  element: CanvasImageSource
  height: number
  /** Frees the memory the image holds. */
  release: () => void
  width: number
}

/**
 * Loads an image from a URL or a file. It uses an image element, which respects the EXIF orientation and accepts every format the browser can show.
 *
 * @throws {Error} If the browser cannot load or decode the image.
 */
export async function loadImage(source: string | Blob): Promise<LoadedImage> {
  const objectUrl = typeof source === 'string'
    ? null
    : URL.createObjectURL(source)
  const release = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const element = new Image()
  element.src = objectUrl ?? (source as string)
  try {
    await element.decode()
  }
  catch (cause) {
    release()
    const name = typeof source === 'string'
      ? `"${source}"`
      : 'the given file'
    throw new Error(`Could not load the image from ${name}. Check that it exists and that it is an image format the browser supports.`, { cause })
  }

  if (element.naturalWidth === 0 || element.naturalHeight === 0) {
    release()
    throw new Error('The image has no size. If it is an SVG, give it width and height attributes.')
  }

  return {
    element,
    width: element.naturalWidth,
    height: element.naturalHeight,
    release,
  }
}
