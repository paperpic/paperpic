import type { Operation } from '../pipeline/operations'
import type { Point } from '../processing/types'
import type { Size, ViewPoint } from '../state/view'
import type { PaperPicLabels } from '../ui/labels'
import type { Lens } from './magnifier'

/** The tools the edit bar can offer. */
export type ToolId = 'crop' | 'rotate'

/** What a button of a tool can do to the edit in progress. */
export interface ToolContext {
  addOperation: (operation: Operation) => void
  openTool: (id: ToolId) => void
}

/** A button in the edit bar. */
export interface ToolAction {
  /** Its key in `PaperPicLabels` and in the icons. */
  id: 'crop' | 'rotateLeft' | 'rotateRight'
  run: (context: ToolContext) => void
}

/**
 * What an open tool can use. It works in the frame: the image as the user sees it, turned and at full resolution.
 */
export interface ToolHost {
  /** The layer for the elements of the tool, on top of the image. */
  layer: HTMLElement
  frameSize: () => Size
  frameToViewport: (point: Point) => ViewPoint
  viewportToFrame: (point: ViewPoint) => Point
  /** The bottom left corner of the toolbar over the image, or `null` if there is none. */
  toolbarCorner: () => ViewPoint | null
  /** Moves the image, if it can, until a point of the frame is on screen. */
  reveal: (point: Point) => void
  requestPaint: () => void
  announce: (text: string) => void
  labels: () => PaperPicLabels
  /** Paints a magnified part of the image. */
  paintLens: (context: CanvasRenderingContext2D, lens: Lens) => void
}

/** A tool while it is open. */
export interface ToolSession {
  /** Takes the keyboard focus. */
  focus: () => void
  /** Adapts to a new zoom or position of the image. */
  update: () => void
  /** Paints over the image, in CSS pixels of the viewport. */
  drawOverlay: (context: CanvasRenderingContext2D) => void
  /** The edit the user chose, or `null` if it changes nothing. */
  confirm: () => Operation | null
  deactivate: () => void
}

/** A tool. Adding one means creating its folder and registering it in `tools/index.ts`. */
export interface Tool {
  id: ToolId
  actions: readonly ToolAction[]
  /** Only for a tool with its own selection and confirmation. */
  activate?: (host: ToolHost) => ToolSession
  /** Tells the user what to do in the tool. */
  hint?: 'cropHint'
}
