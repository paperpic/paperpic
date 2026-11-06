import type { PaperPicLabels, PaperPicOutput, ToolId } from '@paperpic/core'

export interface PaperPicProps {
  /** The image to show: a URL from the same origin, or a file attached on the client. */
  src?: string | Blob
  /** Describes the image for screen readers. */
  alt?: string
  /** Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image. */
  editable?: boolean
  /** Whether to show the built-in toolbar and edit bar. Without them, build your own with the methods of `instance`. */
  toolbar?: boolean
  /** Which tools the edit bar offers. By default, all of them. */
  tools?: readonly ToolId[]
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
  /** The format of the edited image. By default, the format of the source. */
  output?: PaperPicOutput
  /** The longest side of the edited image, in pixels. By default, it keeps the full resolution. */
  maxOutputSize?: number
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
}
