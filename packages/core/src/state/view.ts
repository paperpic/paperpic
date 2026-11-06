import type { Rotation } from '../rotation'
import { normalizeRotation } from '../rotation'

/** A size in CSS pixels. */
export interface Size {
  width: number
  height: number
}

/** A position in CSS pixels, relative to the top left corner of the viewport. */
export interface ViewPoint {
  x: number
  y: number
}

/** How the image adapts to the viewport: the whole image, its width or its height. */
export type Fit = 'image' | 'width' | 'height'

/** What the viewport shows. */
export interface View {
  /** Screen pixels per image pixel. */
  zoom: number
  /** Distance from the center of the viewport to the center of the image. */
  panX: number
  panY: number
  rotation: Rotation
  /** The fit in effect, or `null` once the user has zoomed by hand. */
  fit: Fit | null
}

const MAX_ZOOM = 8

/** A view of the whole image that nothing has measured yet. */
export function createView(): View {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    fit: 'image',
  }
}

function displayedSize(image: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270
    ? { width: image.height, height: image.width }
    : image
}

function fitZoom(fit: Fit, image: Size, viewport: Size, rotation: Rotation): number {
  const { width, height } = displayedSize(image, rotation)
  const byWidth = viewport.width / width
  const byHeight = viewport.height / height
  switch (fit) {
    case 'width':
      return byWidth
    case 'height':
      return byHeight
    case 'image':
      return Math.min(byWidth, byHeight)
  }
}

/** The zoom range for an image. Fitting a very small image can go over the usual maximum. */
export function zoomLimits(image: Size, viewport: Size, rotation: Rotation): { min: number, max: number } {
  return {
    min: Math.min(fitZoom('image', image, viewport, rotation), 1),
    max: Math.max(MAX_ZOOM, fitZoom('width', image, viewport, rotation), fitZoom('height', image, viewport, rotation)),
  }
}

/**
 * Keeps the image from leaving the viewport, and centers it along any side where it fits.
 * `sideMargin` is how far an image that overflows can go past its sides, so a toolbar over it never hides a part for good.
 */
export function clampPan(view: View, image: Size, viewport: Size, sideMargin = 0): View {
  const { width, height } = displayedSize(image, view.rotation)
  const margin = overflows(view, image, viewport)
    ? sideMargin
    : 0
  const limitX = Math.max(0, (width * view.zoom - viewport.width) / 2) + margin
  const limitY = Math.max(0, (height * view.zoom - viewport.height) / 2)
  return {
    ...view,
    panX: Math.min(limitX, Math.max(-limitX, view.panX)),
    panY: Math.min(limitY, Math.max(-limitY, view.panY)),
  }
}

/** Applies a fit. When the image overflows, it starts from its top left corner, where reading starts. */
export function fitView(view: View, fit: Fit, image: Size, viewport: Size): View {
  const zoom = fitZoom(fit, image, viewport, view.rotation)
  return clampPan(
    {
      ...view,
      zoom,
      fit,
      panX: Number.POSITIVE_INFINITY,
      panY: Number.POSITIVE_INFINITY,
    },
    image,
    viewport,
  )
}

/**
 * Sets the zoom and keeps the image point under `point` in place.
 * A value out of range is clamped to the zoom limits.
 */
export function zoomTo(view: View, zoom: number, point: ViewPoint, image: Size, viewport: Size, sideMargin = 0): View {
  const { min, max } = zoomLimits(image, viewport, view.rotation)
  const next = Math.min(max, Math.max(min, zoom))
  const scale = next / view.zoom
  const fromCenterX = point.x - viewport.width / 2
  const fromCenterY = point.y - viewport.height / 2
  return clampPan(
    {
      ...view,
      zoom: next,
      fit: null,
      panX: fromCenterX - (fromCenterX - view.panX) * scale,
      panY: fromCenterY - (fromCenterY - view.panY) * scale,
    },
    image,
    viewport,
    sideMargin,
  )
}

/** Moves the image by a distance in CSS pixels. */
export function panBy(view: View, deltaX: number, deltaY: number, image: Size, viewport: Size, sideMargin = 0): View {
  return clampPan({ ...view, panX: view.panX + deltaX, panY: view.panY + deltaY }, image, viewport, sideMargin)
}

/** Sets the rotation, keeping the fit in effect if there is one. */
export function setRotation(view: View, rotation: Rotation, image: Size, viewport: Size): View {
  if (rotation === view.rotation) {
    return view
  }
  const rotated: View = {
    ...view,
    rotation,
    panX: 0,
    panY: 0,
  }
  return view.fit
    ? fitView(rotated, view.fit, image, viewport)
    : clampPan(rotated, image, viewport)
}

/** Turns the view by a quarter turn. */
export function rotateView(view: View, direction: 1 | -1, image: Size, viewport: Size): View {
  return setRotation(view, normalizeRotation(view.rotation + 90 * direction), image, viewport)
}

/** Adapts the view to a new viewport size. */
export function resizeView(view: View, image: Size, viewport: Size): View {
  return view.fit
    ? fitView(view, view.fit, image, viewport)
    : clampPan(view, image, viewport)
}

/** Whether the image is larger than the viewport, so there is something to pan. */
export function overflows(view: View, image: Size, viewport: Size): boolean {
  const { width, height } = displayedSize(image, view.rotation)
  const tolerance = 0.5
  return width * view.zoom > viewport.width + tolerance || height * view.zoom > viewport.height + tolerance
}
