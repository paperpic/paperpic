import adjust from './icons/adjust.svg?raw'
import apply from './icons/apply.svg?raw'
import brightness from './icons/brightness.svg?raw'
import cancel from './icons/cancel.svg?raw'
import contrast from './icons/contrast.svg?raw'
import crop from './icons/crop.svg?raw'
import download from './icons/download.svg?raw'
import edit from './icons/edit.svg?raw'
import fitHeight from './icons/fit-height.svg?raw'
import fitWidth from './icons/fit-width.svg?raw'
import flip from './icons/flip.svg?raw'
import perspective from './icons/perspective.svg?raw'
import redo from './icons/redo.svg?raw'
import rotateDocument from './icons/rotate-document.svg?raw'
import rotateLeft from './icons/rotate-left.svg?raw'
import rotateRight from './icons/rotate-right.svg?raw'
import threshold from './icons/threshold.svg?raw'
import undo from './icons/undo.svg?raw'
import zoomIn from './icons/zoom-in.svg?raw'
import zoomOut from './icons/zoom-out.svg?raw'

/**
 * Every icon of the interface, as the markup of one element, such as an `<svg>`. One icon can appear on several buttons.
 *
 * @see https://paperpic.dev/reference/options#icons
 */
export interface PaperPicIcons {
  /** Adjust, which opens the ruler of brightness and contrast. */
  adjust: string
  /** Apply, and Done in every tool. */
  apply: string
  /** The choice of brightness in Adjust. */
  brightness: string
  /** Cancel, and the button that closes a tool without its changes. */
  cancel: string
  /** The choice of contrast in Adjust. */
  contrast: string
  crop: string
  download: string
  /** The Edit pencil. */
  edit: string
  fitHeight: string
  fitWidth: string
  flip: string
  /** Straighten. */
  perspective: string
  redo: string
  /** Rotate left in the edit bar, which turns the image itself. */
  rotateDocument: string
  /** Rotate left in the toolbar of a read-only viewer, which only turns the display. */
  rotateLeft: string
  /** Rotate right in the toolbar of a read-only viewer. */
  rotateRight: string
  /** Clean up. */
  threshold: string
  undo: string
  zoomIn: string
  zoomOut: string
}

/** The built-in icons, inlined in the bundle so consumers serve no files. */
export const DEFAULT_ICONS: PaperPicIcons = {
  adjust,
  apply,
  brightness,
  cancel,
  contrast,
  crop,
  download,
  edit,
  fitHeight,
  fitWidth,
  flip,
  perspective,
  redo,
  rotateDocument,
  rotateLeft,
  rotateRight,
  threshold,
  undo,
  zoomIn,
  zoomOut,
}
