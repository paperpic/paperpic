/** Every text the component shows or announces. */
export interface PaperPicLabels {
  /** Name of the area that shows the image, for screen readers. */
  viewer: string
  /** Name of the toolbar, for screen readers. */
  toolbar: string
  zoomIn: string
  zoomOut: string
  fitWidth: string
  fitHeight: string
  rotateLeft: string
  rotateRight: string
  loading: string
  /** Shown when the image cannot be loaded. */
  loadError: string
  /** Announced after a zoom from the toolbar or the keyboard. */
  zoomLevel: (percent: number) => string
}

export const DEFAULT_LABELS: PaperPicLabels = {
  viewer: 'Image viewer',
  toolbar: 'Image controls',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fitWidth: 'Fit to width',
  fitHeight: 'Fit to height',
  rotateLeft: 'Rotate left',
  rotateRight: 'Rotate right',
  loading: 'Loading image',
  loadError: 'The image could not be loaded',
  zoomLevel: percent => `Zoom ${percent}%`,
}
