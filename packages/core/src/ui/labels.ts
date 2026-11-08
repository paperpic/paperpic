/** Every text the component shows or announces. */
export interface PaperPicLabels {
  /** Name of the area that shows the image, for screen readers. */
  viewer: string
  /** Name of the toolbar, for screen readers. */
  toolbar: string
  /** Name of the edit bar, for screen readers. */
  editBar: string
  edit: string
  zoomIn: string
  zoomOut: string
  fitWidth: string
  fitHeight: string
  rotateLeft: string
  rotateRight: string
  crop: string
  /** What to do in the crop tool. */
  cropHint: string
  perspective: string
  /** What to do in the perspective tool. */
  perspectiveHint: string
  threshold: string
  /** Name of the slider of the threshold. */
  thresholdSensitivity: string
  /** Announced after changing the slider of the threshold. */
  thresholdLevel: (percent: number) => string
  /** Closes a tool, keeping its selection. */
  confirm: string
  /** Closes a tool, discarding its selection. */
  cancelTool: string
  cornerTopLeft: string
  cornerTopRight: string
  cornerBottomRight: string
  cornerBottomLeft: string
  /** Announced after moving a corner, with its position in image pixels. */
  cornerMoved: (corner: string, x: number, y: number) => string
  cancel: string
  undo: string
  redo: string
  apply: string
  /** The question before losing changes. */
  discardQuestion: string
  discard: string
  keepEditing: string
  /** Announced when the edit mode starts. */
  editing: string
  /** Shown while applying the changes. */
  processing: string
  /** Announced when the changes are applied. */
  applied: string
  /** Shown when the changes cannot be applied. */
  applyError: string
  loading: string
  /** Shown when the image cannot be loaded. */
  loadError: string
  /** Announced after a zoom from the toolbar or the keyboard. */
  zoomLevel: (percent: number) => string
}

export const DEFAULT_LABELS: PaperPicLabels = {
  viewer: 'Image viewer',
  toolbar: 'Image controls',
  editBar: 'Editing controls',
  edit: 'Edit',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fitWidth: 'Fit to width',
  fitHeight: 'Fit to height',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  crop: 'Crop',
  cropHint: 'Drag the corners',
  perspective: 'Straighten',
  perspectiveHint: 'Drag each corner to a corner of the document',
  threshold: 'Clean up',
  thresholdSensitivity: 'Sensitivity',
  thresholdLevel: percent => `Sensitivity ${percent}%`,
  confirm: 'Done',
  cancelTool: 'Cancel this tool',
  cornerTopLeft: 'Top left corner',
  cornerTopRight: 'Top right corner',
  cornerBottomRight: 'Bottom right corner',
  cornerBottomLeft: 'Bottom left corner',
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cancel: 'Cancel',
  undo: 'Undo',
  redo: 'Redo',
  apply: 'Apply',
  discardQuestion: 'Discard your changes?',
  discard: 'Discard',
  keepEditing: 'Keep editing',
  editing: 'Editing',
  processing: 'Applying changes',
  applied: 'Changes applied',
  applyError: 'The changes could not be applied',
  loading: 'Loading image',
  loadError: 'The image could not be loaded',
  zoomLevel: percent => `Zoom ${percent}%`,
}
