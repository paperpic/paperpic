import type { Operation } from '../pipeline/operations'
import type { PhotoFrame } from '../pipeline/photo-frame'
import type { Point } from '../processing/types'
import type { Size, ViewPoint } from '../state/view'
import type { PaperPicLabels } from '../ui/labels'
import type { Lens } from './magnifier'

/** The tools the edit bar can offer. */
export type ToolId = 'adjust' | 'crop' | 'flip' | 'perspective' | 'rotate' | 'threshold'

/** What a button of a tool can do to the edit in progress. */
export interface ToolContext {
  addOperation: (operation: Operation) => void
  openTool: (id: ToolId) => void
  /** Opens or closes the sliders of brightness and contrast. */
  toggleAdjustments: () => void
  toggleThreshold: () => void
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
  /** The bottom left corner of the toolbar over the image, or `null` if there is none. */
  toolbarCorner: () => ViewPoint | null
  viewportToFrame: (point: ViewPoint) => Point
}

/** A tool while it is open. */
export interface ToolSession {
  /** The edit the user chose, or `null` if it changes nothing. */
  confirm: () => Operation | null
  deactivate: () => void
  /** Paints over the image, in CSS pixels of the viewport. */
  drawOverlay: (context: CanvasRenderingContext2D) => void
  /** Takes the keyboard focus. */
  focus: () => void
  /** Adapts to a new zoom or position of the image. */
  update: () => void
}

/** A tool. Adding one means creating its folder and registering it in `tools/index.ts`. */
export interface Tool {
  actions: readonly ToolAction[]
  /** Only for a tool with its own selection and confirmation. */
  activate?: (host: ToolHost) => ToolSession
  /** Tells the user what to do in the tool. */
  hint?: 'cropHint' | 'perspectiveHint'
  id: ToolId
}
