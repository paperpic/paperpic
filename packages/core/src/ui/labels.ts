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
