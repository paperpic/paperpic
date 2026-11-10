import type { PaperPic, PaperPicEvents, PaperPicOptions } from '@paperpic/core'
import type { CSSProperties, Ref } from 'react'

/** The viewer that `ref` receives, with the methods of `@paperpic/core`, such as `zoomIn()` or `reload()`. */
export type PaperPicInstance = PaperPic

export interface PaperPicProps extends PaperPicOptions {
  /** Classes for the element that holds the viewer, on top of `paperpic-host`. */
  className?: string
  /** The user applied the changes. The result is already on display. */
  onApply?: (result: PaperPicEvents['apply']) => void
  /** The user changed the view or the edit. A change of props never calls it. */
  onChange?: (state: PaperPicEvents['change']) => void
  /** The image is about to be saved. Call `preventDefault()` to save it another way. */
  onDownload?: (download: PaperPicEvents['download']) => void
  /** The image could not be loaded, or the changes could not be applied. */
  onError?: (failure: PaperPicEvents['error']) => void
  /** The image is ready. */
  onLoad?: (size: PaperPicEvents['load']) => void
  /** Receives the viewer, for a custom interface. It is `null` until the component mounts. */
  ref?: Ref<PaperPicInstance>
  /** Inline styles for the element that holds the viewer. */
  style?: CSSProperties
}
