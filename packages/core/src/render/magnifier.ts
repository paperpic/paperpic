import type { LoadedImage } from '../pipeline/load-image'
import type { Point, Size } from '../processing/types'
import type { View, ViewPoint } from '../state/view'
import { frameToViewport } from '../state/view'
import { computeTransform } from './transform'

/** What a magnifier shows and where. */
export interface Magnifier {
  /** Where the magnifier goes in the viewport. */
  center: ViewPoint
  /** The point of the frame to magnify. */
  point: Point
  radius: number
}

/** How much larger the magnifier shows the image than the view does. */
const MAGNIFIER_ZOOM = 3

/** Paints the image larger around a point, inside a circle with a cross at its center. */
export function paintMagnifier(
  context: CanvasRenderingContext2D,
  { point, center, radius }: Magnifier,
  { view, image, viewport }: { image: LoadedImage, view: View, viewport: Size },
): void {
  const [a, b, c, d, e, f] = computeTransform(view, image, viewport)
  const target = frameToViewport(view, image, viewport, point)
  context.save()
  context.beginPath()
  context.arc(center.x, center.y, radius, 0, Math.PI * 2)
  context.clip()
  context.fillStyle = '#fff'
  context.fill()
  context.transform(
    a * MAGNIFIER_ZOOM,
    b * MAGNIFIER_ZOOM,
    c * MAGNIFIER_ZOOM,
    d * MAGNIFIER_ZOOM,
    center.x + (e - target.x) * MAGNIFIER_ZOOM,
    center.y + (f - target.y) * MAGNIFIER_ZOOM,
  )
  context.drawImage(image.element, 0, 0, image.width, image.height)
  context.restore()

  context.beginPath()
  context.arc(center.x, center.y, radius, 0, Math.PI * 2)
  context.moveTo(center.x - 8, center.y)
  context.lineTo(center.x + 8, center.y)
  context.moveTo(center.x, center.y - 8)
  context.lineTo(center.x, center.y + 8)
  context.lineWidth = 2
  context.strokeStyle = '#fff'
  context.stroke()
}
