import adjust from '../assets/icons/adjust.svg?raw'
import apply from '../assets/icons/apply.svg?raw'
import cancel from '../assets/icons/cancel.svg?raw'
import crop from '../assets/icons/crop.svg?raw'
import download from '../assets/icons/download.svg?raw'
import edit from '../assets/icons/edit.svg?raw'
import fitHeight from '../assets/icons/fit-height.svg?raw'
import fitWidth from '../assets/icons/fit-width.svg?raw'
import flip from '../assets/icons/flip.svg?raw'
import perspective from '../assets/icons/perspective.svg?raw'
import redo from '../assets/icons/redo.svg?raw'
import rotateDocument from '../assets/icons/rotate-document.svg?raw'
import rotateLeft from '../assets/icons/rotate-left.svg?raw'
import rotateRight from '../assets/icons/rotate-right.svg?raw'
import threshold from '../assets/icons/threshold.svg?raw'
import undo from '../assets/icons/undo.svg?raw'
import zoomIn from '../assets/icons/zoom-in.svg?raw'
import zoomOut from '../assets/icons/zoom-out.svg?raw'

/** Every icon of the interface, as the markup of one element, such as an `<svg>`. One icon can appear on several buttons. */
export interface PaperPicIcons {
  /** Adjust, which shows the sliders of brightness and contrast. */
  adjust: string
  /** Apply, and Done in Crop and Straighten. */
  apply: string
  /** Cancel, and the button that closes Crop and Straighten. */
  cancel: string
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
  cancel,
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
