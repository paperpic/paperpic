import type { Size, View } from '../state/view'
import { computeTransform } from './transform'

/** What one frame shows. */
export interface Scene {
  image: CanvasImageSource
  imageSize: Size
  view: View
  viewport: Size
  /** Paints over the image, in CSS pixels of the viewport. */
  drawOverlay?: (context: CanvasRenderingContext2D) => void
}

/** Paints scenes on a canvas and on the overlay above it. It decides nothing, and paints at most once per frame. */
export class Renderer {
  private readonly canvas: HTMLCanvasElement
  private readonly overlay: HTMLCanvasElement
  private readonly getScene: () => Scene | null
  private frame: number | null = null
  private pixelRatio = 1
  private viewport: Size = { width: 0, height: 0 }

  constructor(canvas: HTMLCanvasElement, overlay: HTMLCanvasElement, getScene: () => Scene | null) {
    this.canvas = canvas
    this.overlay = overlay
    this.getScene = getScene
  }

  /** Sizes the canvases in device pixels, so they stay sharp on high density screens. */
  resize(viewport: Size, pixelRatio: number): void {
    this.viewport = viewport
    this.pixelRatio = pixelRatio
    for (const canvas of [this.canvas, this.overlay]) {
      canvas.width = Math.round(viewport.width * pixelRatio)
      canvas.height = Math.round(viewport.height * pixelRatio)
    }
    this.requestPaint()
  }

  /** Schedules a paint for the next frame. Several calls in one frame paint once. */
  requestPaint(): void {
    this.frame ??= requestAnimationFrame(() => {
      this.frame = null
      this.paint()
    })
  }

  /** Cancels a pending paint. */
  destroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame)
      this.frame = null
    }
  }

  private paint(): void {
    const scene = this.getScene()
    this.paintImage(scene)
    this.paintOverlay(scene)
  }

  private paintImage(scene: Scene | null): void {
    const context = this.canvas.getContext('2d')
    if (!context) {
      return
    }
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (!scene) {
      return
    }
    const [a, b, c, d, e, f] = computeTransform(scene.view, scene.imageSize, this.viewport)
    const ratio = this.pixelRatio
    context.setTransform(a * ratio, b * ratio, c * ratio, d * ratio, e * ratio, f * ratio)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(scene.image, 0, 0, scene.imageSize.width, scene.imageSize.height)
  }

  private paintOverlay(scene: Scene | null): void {
    const context = this.overlay.getContext('2d')
    if (!context) {
      return
    }
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.clearRect(0, 0, this.overlay.width, this.overlay.height)
    if (scene?.drawOverlay) {
      context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0)
      scene.drawOverlay(context)
    }
  }
}
