import type { Operation } from '../pipeline/operations'
import type { CleanUpSetting, Tool } from './types'
import { thresholdSetting } from '../pipeline/operations'

type ThresholdEdit = Extract<Operation, { type: 'threshold' }>

/**
 * Cleans up a document. It is a setting that always runs last, so its button opens a panel with a switch and the
 * ruler of its sensitivity, and Done leaves one edit.
 */
export const thresholdTool: Tool = {
  id: 'threshold',
  actions: [
    {
      id: 'threshold',
      run: context => context.openTool('threshold'),
    },
  ],
}

/** What Clean up shows when it opens: turned on, so the preview shows what it does, with the sensitivity of the edits. */
export function openCleanUp(operations: readonly Operation[]): CleanUpSetting {
  return { enabled: true, sensitivity: thresholdSetting(operations).sensitivity }
}

/** The edit of a setting of Clean up. `softness` is the option, which wins over the softness of the edits. */
export function thresholdOperation(setting: CleanUpSetting, operations: readonly Operation[], softness: number | undefined): ThresholdEdit {
  return {
    type: 'threshold',
    ...setting,
    softness: softness ?? thresholdSetting(operations).softness,
  }
}

/** The edit that leaves Clean up at `setting`, or `null` if it already is. */
export function thresholdEdit(setting: CleanUpSetting, operations: readonly Operation[], softness: number | undefined): Operation | null {
  const current = thresholdSetting(operations)
  return setting.enabled !== current.enabled || setting.sensitivity !== current.sensitivity
    ? thresholdOperation(setting, operations, softness)
    : null
}

/**
 * The edit that Done leaves in Clean up. A sensitivity that changes while Clean up stays off changes nothing on
 * display, so it leaves none.
 */
export function confirmCleanUp(setting: CleanUpSetting, operations: readonly Operation[], softness: number | undefined): Operation | null {
  return !setting.enabled && !thresholdSetting(operations).enabled
    ? null
    : thresholdEdit(setting, operations, softness)
}
