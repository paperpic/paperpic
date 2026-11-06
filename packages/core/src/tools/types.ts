import type { Operation } from '../pipeline/operations'

/** What a tool can do to the edit in progress. */
export interface ToolContext {
  addOperation: (operation: Operation) => void
}

/** A button in the edit bar. */
export interface ToolAction {
  /** Its key in `PaperPicLabels` and in the icons. */
  id: 'rotateLeft' | 'rotateRight'
  run: (context: ToolContext) => void
}

/** The tools the edit bar can offer. */
export type ToolId = 'rotate'

/** A tool. Adding one means creating its folder and registering it in `tools/index.ts`. */
export interface Tool {
  id: ToolId
  actions: readonly ToolAction[]
}
