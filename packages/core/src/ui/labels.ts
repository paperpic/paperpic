/** Every text the component shows or announces. */
export interface PaperPicLabels {
  /** Announced when the changes are applied. */
  applied: string
  apply: string
  /** Shown when the changes cannot be applied. */
  applyError: string
  cancel: string
  /** Closes a tool, discarding its selection. */
  cancelTool: string
  /** Closes a tool, keeping its selection. */
  confirm: string
  cornerBottomLeft: string
  cornerBottomRight: string
  /** Announced after moving a corner, with its position in image pixels. */
  cornerMoved: (corner: string, x: number, y: number) => string
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
  fitHeight: string
  fitWidth: string
  keepEditing: string
  /** Shown when the image cannot be loaded. */
  loadError: string
  loading: string
  perspective: string
  /** What to do in the perspective tool. */
  perspectiveHint: string
  /** Shown while applying the changes. */
  processing: string
  redo: string
  rotateLeft: string
  rotateRight: string
  threshold: string
  /** Announced after changing the slider of the threshold. */
  thresholdLevel: (percent: number) => string
  /** Name of the slider of the threshold. */
  thresholdSensitivity: string
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

export const DEFAULT_LABELS: PaperPicLabels = {
  applied: 'Changes applied',
  apply: 'Apply',
  applyError: 'The changes could not be applied',
  cancel: 'Cancel',
  cancelTool: 'Cancel this tool',
  confirm: 'Done',
  cornerBottomLeft: 'Bottom left corner',
  cornerBottomRight: 'Bottom right corner',
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
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
  fitHeight: 'Fit to height',
  fitWidth: 'Fit to width',
  keepEditing: 'Keep editing',
  loadError: 'The image could not be loaded',
  loading: 'Loading image',
  perspective: 'Straighten',
  perspectiveHint: 'Drag each corner to a corner of the document',
  processing: 'Applying changes',
  redo: 'Redo',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  threshold: 'Clean up',
  thresholdLevel: percent => `Sensitivity ${percent}%`,
  thresholdSensitivity: 'Sensitivity',
  toolbar: 'Image controls',
  undo: 'Undo',
  viewer: 'Image viewer',
  zoomIn: 'Zoom in',
  zoomLevel: percent => `Zoom ${percent}%`,
  zoomOut: 'Zoom out',
}
