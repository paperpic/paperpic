import type { AdjustSetting, Operation } from '../pipeline/operations'
import type { Tool } from './types'
import { adjustSetting, thresholdSetting } from '../pipeline/operations'

/**
 * Changes the brightness and contrast. They are a setting that runs after the shape, so its button opens a panel that
 * chooses between them, with one ruler, and Done leaves one edit with both.
 */
export const adjustTool: Tool = {
  id: 'adjust',
  actions: [
    {
      id: 'adjust',
      run: context => context.openTool('adjust'),
    },
  ],
}

/** Whether the brightness and contrast can change. A cleaned document has tones of its own, so they cannot. */
export function canAdjust(operations: readonly Operation[]): boolean {
  return !thresholdSetting(operations).enabled
}

/** The edit that leaves the brightness and contrast at `setting`, or `null` if they already are. */
export function adjustEdit(setting: AdjustSetting, operations: readonly Operation[]): Operation | null {
  const current = adjustSetting(operations)
  return setting.brightness !== current.brightness || setting.contrast !== current.contrast
    ? { type: 'adjust', ...setting }
    : null
}
