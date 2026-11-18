/**
 * Every text the component shows or announces. The texts with values are functions.
 *
 * @see https://paperpic.dev/reference/labels
 */
export interface PaperPicLabels {
  /** Opens the ruler of brightness and contrast. */
  adjust: string
  /** Announced after moving the ruler of Adjust, with the name of the tone and its value from -100 to 100. */
  adjustmentLevel: (name: string, value: number) => string
  /** Describes Adjust to screen readers while the finish is black and white, which keeps it disabled. */
  adjustUnavailable: string
  /** Announced when the changes are applied. */
  applied: string
  apply: string
  /** Shown when the changes cannot be applied. */
  applyError: string
  /** Chooses brightness in Adjust, and names its ruler. */
  brightness: string
  cancel: string
  /** Closes a tool, discarding its changes. */
  cancelTool: string
  /** Closes a tool, keeping its changes. */
  confirm: string
  /** Chooses contrast in Adjust, and names its ruler. */
  contrast: string
  cornerBottomLeft: string
  cornerBottomRight: string
  /** Describes each corner handle to screen readers: what the keys do, and that Enter finishes. */
  cornerKeys: string
  /** Announced after moving a corner, with its position in image pixels. */
  cornerMoved: (corner: string, x: number, y: number) => string
  /** Shown and announced after pressing a corner, which the next tap on the image moves, with the name of the corner. */
  cornerSelected: (corner: string) => string
  cornerTopLeft: string
  cornerTopRight: string
  crop: string
  /** What to do in the crop tool. */
  cropHint: string
  discard: string
  /** The question before losing changes. */
  discardQuestion: string
  download: string
  edit: string
  /** Name of the edit bar, for screen readers. */
  editBar: string
  /** Announced when the edit mode starts. */
  editing: string
  /** Opens Clean up, and names its choice of finish. */
  finish: string
  /** Chooses gray in Clean up. */
  finishGray: string
  /** Announced after moving the ruler of Clean up, with its value in percent. */
  finishLevel: (percent: number) => string
  /** Chooses black and white in Clean up. */
  finishMono: string
  /** Chooses the original tones in Clean up, which turns it off. */
  finishOriginal: string
  /** Name of the ruler of Clean up, which changes black and white. */
  finishSensitivity: string
  fitHeight: string
  fitWidth: string
  /** Mirrors the image left to right. */
  flip: string
  /** Describes Adjust or Clean up while its setting is in effect. Their dot shows it. */
  inUse: string
  keepEditing: string
  /** Shown when the image cannot be loaded. */
  loadError: string
  loading: string
  perspective: string
  /** What to do in the perspective tool. */
  perspectiveHint: string
  /** Shown when the changes so far cannot be shown on screen. The edit stays open. */
  previewError: string
  /** Shown while applying the changes. */
  processing: string
  redo: string
  rotateLeft: string
  rotateRight: string
  /** Name of the toolbar, for screen readers. */
  toolbar: string
  undo: string
  /** Name of the area that shows the image, for screen readers. */
  viewer: string
  zoomIn: string
  /** Announced after a zoom from the toolbar or the keyboard. */
  zoomLevel: (percent: number) => string
  zoomOut: string
}

/** Writes `+30` and `-20`, so the direction of a change is clear. */
const SIGNED = new Intl.NumberFormat('en-US', { signDisplay: 'exceptZero' })

export const DEFAULT_LABELS: PaperPicLabels = {
  adjust: 'Adjust',
  adjustmentLevel: (name, value) => `${name} ${SIGNED.format(value)}`,
  adjustUnavailable: 'Not available in black and white',
  applied: 'Changes applied',
  apply: 'Apply',
  applyError: 'The changes could not be applied',
  brightness: 'Brightness',
  cancel: 'Cancel',
  cancelTool: 'Cancel this tool',
  confirm: 'Done',
  contrast: 'Contrast',
  cornerBottomLeft: 'Bottom left corner',
  cornerBottomRight: 'Bottom right corner',
  cornerKeys: 'Arrow keys move it, 10 times further with Shift. Enter finishes.',
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: tap where it goes`,
  cornerTopLeft: 'Top left corner',
  cornerTopRight: 'Top right corner',
  crop: 'Crop',
  cropHint: 'Drag the corners',
  discard: 'Discard',
  discardQuestion: 'Discard your changes?',
  download: 'Download',
  edit: 'Edit',
  editBar: 'Editing controls',
  editing: 'Editing',
  finish: 'Clean up',
  finishGray: 'Gray',
  finishLevel: percent => `Sensitivity ${percent}%`,
  finishMono: 'Black and white',
  finishOriginal: 'Original',
  finishSensitivity: 'Sensitivity',
  fitHeight: 'Fit to height',
  fitWidth: 'Fit to width',
  flip: 'Flip',
  inUse: 'In use',
  keepEditing: 'Keep editing',
  loadError: 'The image could not be loaded',
  loading: 'Loading image',
  perspective: 'Straighten',
  perspectiveHint: 'Drag each corner to a corner of the document',
  previewError: 'The changes could not be shown',
  processing: 'Applying changes',
  redo: 'Redo',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  toolbar: 'Image controls',
  undo: 'Undo',
  viewer: 'Image viewer',
  zoomIn: 'Zoom in',
  zoomLevel: percent => `Zoom ${percent}%`,
  zoomOut: 'Zoom out',
}
