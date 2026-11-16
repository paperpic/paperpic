import type { Size, View } from '../state/view'
import type { Lens } from '../tools/magnifier'
import type { LoadedImage } from './load-image'
import { frameToViewport } from '../state/view'
import { computeTransform } from './transform'

/** How much larger the magnifier shows the image than the view does. */
const LENS_ZOOM = 3

/** Paints the image larger around a point, inside a circle with a cross at its center. */
export function paintLens(
  context: CanvasRenderingContext2D,
  { point, center, radius }: Lens,
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
    a * LENS_ZOOM,
    b * LENS_ZOOM,
    c * LENS_ZOOM,
    d * LENS_ZOOM,
    center.x + (e - target.x) * LENS_ZOOM,
    center.y + (f - target.y) * LENS_ZOOM,
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
