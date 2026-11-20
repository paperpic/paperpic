import type { Tool, ToolId } from './types'
import { adjustTool } from './adjust'
import { cropTool } from './crop'
import { finishTool } from './finish'
import { flipTool } from './flip'
import { perspectiveTool } from './perspective'
import { redactTool } from './redact'
import { rotateTool } from './rotate'

/** Every tool, in the order the edit bar shows them. */
export const TOOLS: readonly Tool[] = [
  cropTool,
  perspectiveTool,
  rotateTool,
  flipTool,
  adjustTool,
  finishTool,
  redactTool,
]

/** The tools offered when the consumer does not choose. */
export const ALL_TOOL_IDS: readonly ToolId[] = TOOLS.map(({ id }) => id)
