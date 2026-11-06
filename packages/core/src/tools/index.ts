import type { Tool, ToolId } from './types'
import { cropTool } from './crop'
import { rotateTool } from './rotate'

/** Every tool, in the order the edit bar shows them. */
export const TOOLS: readonly Tool[] = [cropTool, rotateTool]

/** The tools offered when the consumer does not choose. */
export const ALL_TOOL_IDS: readonly ToolId[] = TOOLS.map(({ id }) => id)
