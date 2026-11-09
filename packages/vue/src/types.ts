import type { PaperPicLabels, PaperPicOutput, ToolId } from '@paperpic/core'

export interface PaperPicProps {
  /** Describes the image for screen readers. */
  alt?: string
  /** The real proportions of the document, as width divided by height, such as `210 / 297` for A4. Without it, straightening estimates them. */
  aspectRatio?: number
  /** Whether the toolbar has a button that saves the image on display, which is the result of the last Apply or else the source. */
  download?: boolean
  /** Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image. */
  editable?: boolean
  /** The name of the saved file. By default, the name of the source. The extension follows the format of the image. */
  filename?: string
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
  /** The longest side of the edited image, in pixels. By default, it keeps the full resolution. */
  maxOutputSize?: number
  /** The format of the edited image. By default, the format of the source. */
  output?: PaperPicOutput
  /**
   * From 0 to 1. How much gray cleaning up a document keeps, which makes letters easier to read. By default, 0.25.
   * Use 0 for strict black and white, which gives smaller files but breaks thin strokes.
   */
  softness?: number
  /** The image to show: a URL from the same origin, or a file attached on the client. */
  src?: string | Blob
  /** Whether to show the built-in toolbar and edit bar. Without them, build your own with the methods of `instance`. */
  toolbar?: boolean
  /** Which tools the edit bar offers. By default, all of them. */
  tools?: readonly ToolId[]
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
}
