import type { Operation } from '../pipeline/operations'
import type { PhotoFrame } from '../pipeline/photo-frame'
import type { Point } from '../processing/types'
import type { Size, ViewPoint } from '../state/view'
import type { PaperPicLabels } from '../ui/labels'
import type { Lens } from './magnifier'

/**
 * The tools the edit bar can offer. `perspective` is Straighten, and `threshold` is Clean up.
 *
 * @see https://paperpic.dev/reference/options#tools
 */
export type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'

/** What a button of a tool can do to the edit in progress. */
export interface ToolContext {
  addOperation: (operation: Operation) => void
  /** Opens a tool with a selection or a panel of its own, which closes with Done or Cancel. */
  openTool: (id: ToolId) => void
}

/** A button in the edit bar. */
export interface ToolAction {
  /** Its icon, when it is not the one named by `id`. */
  icon?: 'rotateDocument'
  /** Its key in `PaperPicLabels`, which its `data-paperpic-control` also holds, and in `PaperPicIcons`. */
  id: 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotateLeft' | 'threshold'
  run: (context: ToolContext) => void
}

/**
 * What an open tool can use. It works in the frame: the image as the user sees it, turned and at full resolution.
 */
export interface ToolHost {
  announce: (text: string) => void
  /** The proportions the consumer knows for the document, as width divided by height. */
  aspectRatio: () => number | undefined
  frameSize: () => Size
  frameToViewport: (point: Point) => ViewPoint
  labels: () => PaperPicLabels
  /** The layer for the elements of the tool, on top of the image. */
  layer: HTMLElement
  /** Paints a magnified part of the image. */
  paintLens: (context: CanvasRenderingContext2D, lens: Lens) => void
  /** Where the image on display sits in the photo it comes from. */
  photoFrame: () => PhotoFrame
  requestPaint: () => void
  /** Moves the image, if it can, until a point of the frame is on screen. */
  reveal: (point: Point) => void
  /** Replaces the hint of the tool in the edit bar, or brings it back with `null`. */
  setHint: (text: string | null) => void
  viewportToFrame: (point: ViewPoint) => Point
}

/** A tool while it is open. */
export interface ToolSession {
  /** The point of the viewport that the zoom buttons keep in place, such as the corner the user is placing, or `null` for the center. */
  anchor?: () => ViewPoint | null
  /** The edit the user chose, or `null` if it changes nothing. */
  confirm: () => Operation | null
  deactivate: () => void
  /** Paints over the image, in CSS pixels of the viewport. */
  drawOverlay: (context: CanvasRenderingContext2D) => void
  /** Runs on `Esc` before the tool closes. Returns whether it used the key, which then leaves the tool open. */
  escape?: () => boolean
  /** Takes the keyboard focus. */
  focus: () => void
  /** Runs on a tap on the image, at a point of the viewport. Returns whether it used the tap. */
  tap?: (point: ViewPoint) => boolean
  /** Adapts to a new zoom or position of the image. */
  update: () => void
}

/** A tool. Adding one means creating its folder and registering it in `tools/index.ts`. */
export interface Tool {
  actions: readonly ToolAction[]
  /** Only for a tool with a selection of its own, such as corners. */
  activate?: (host: ToolHost) => ToolSession
  /** Tells the user what to do in the tool. */
  hint?: 'cropHint' | 'perspectiveHint'
  id: ToolId
}
