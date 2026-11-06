import type { Tool, ToolId } from './types'
import { cropTool } from './crop'
import { perspectiveTool } from './perspective'
import { rotateTool } from './rotate'

/** Every tool, in the order the edit bar shows them. */
export const TOOLS: readonly Tool[] = [cropTool, perspectiveTool, rotateTool]

/** The tools offered when the consumer does not choose. */
export const ALL_TOOL_IDS: readonly ToolId[] = TOOLS.map(({ id }) => id)
