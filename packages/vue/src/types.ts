import type { PaperPicLabels } from '@paperpic/core'

export interface PaperPicProps {
  /** The image to show: a URL from the same origin, or a file attached on the client. */
  src?: string | Blob
  /** Describes the image for screen readers. */
  alt?: string
  /** Whether the image can be edited. With `false` it is a read-only viewer, whose toolbar can also rotate the image. */
  editable?: boolean
  /** Whether to show the built-in toolbar. Without it, build your own with the methods of `instance`. */
  toolbar?: boolean
  /** Whether the wheel zooms. Turn it off when the viewer sits in a long page. */
  wheelZoom?: boolean
  /** Replaces any of the texts, which are in English by default. */
  labels?: Partial<PaperPicLabels>
}
