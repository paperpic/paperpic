import type { PaperPic, PaperPicEvents, PaperPicOptions } from '@paperpic/core'
import type { CSSProperties, Ref } from 'react'

/** The viewer that `ref` receives, with the methods of `@paperpic/core`, such as `zoomIn()` or `reload()`. */
export type PaperPicInstance = PaperPic

export interface PaperPicProps extends PaperPicOptions {
  /** Classes for the element that holds the viewer, on top of `paperpic-host`. */
  className?: string
  /** Apply finished, from the button, `Enter` or `apply()`. The result is already on display. */
  onApply?: (result: PaperPicEvents['apply']) => void
  /**
   * The user or a method changed the state, such as the zoom or the edit, or Straighten found the document. A loaded
   * image comes with `onLoad`, and a failed Apply with `onError`, instead. A pan and a change of props never call it.
   */
  onChange?: (state: PaperPicEvents['change']) => void
  /** The image is about to be saved. Call `preventDefault()` to save it another way. */
  onDownload?: (download: PaperPicEvents['download']) => void
  /** The image could not be loaded, or an edit could not be shown or applied. */
  onError?: (failure: PaperPicEvents['error']) => void
  /** The image of `src` is ready, also after `reload()`. Apply does not call it. */
  onLoad?: (size: PaperPicEvents['load']) => void
  /** Receives the viewer, for a custom interface. It is `null` until the component mounts. */
  ref?: Ref<PaperPicInstance>
  /** Inline styles for the element that holds the viewer. */
  style?: CSSProperties
}
