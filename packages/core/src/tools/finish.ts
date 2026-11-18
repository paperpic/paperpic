import type { FinishSetting, Operation } from '../pipeline/operations'
import type { FinishPanelSetting, Tool } from './types'
import { finishSetting } from '../pipeline/operations'

/**
 * Chooses the finish of the image: original, gray or black and white. It is a setting that always runs last, so its
 * button opens a panel with the finishes and the ruler of black and white, and Done leaves one edit.
 */
export const finishTool: Tool = {
  id: 'finish',
  actions: [
    {
      id: 'finish',
      run: context => context.openTool('finish'),
    },
  ],
}

/**
 * What Clean up shows when it opens: the finish of the edits, or black and white if they keep the original, so the
 * preview shows what the tool does.
 */
export function openFinish(operations: readonly Operation[]): FinishPanelSetting {
  const { mode, sensitivity } = finishSetting(operations)
  return {
    mode: mode === 'original'
      ? 'mono'
      : mode,
    sensitivity,
  }
}

/** The edit of a setting of Clean up. `softness` is the option, which wins over the softness of the edits. */
export function finishOperation(setting: FinishPanelSetting, operations: readonly Operation[], softness: number | undefined): FinishSetting & { type: 'finish' } {
  return {
    type: 'finish',
    ...setting,
    softness: softness ?? finishSetting(operations).softness,
  }
}

/** The edit that leaves Clean up at `setting`, or `null` if it already is. */
export function finishEdit(setting: FinishPanelSetting, operations: readonly Operation[], softness: number | undefined): Operation | null {
  const current = finishSetting(operations)
  return setting.mode !== current.mode || setting.sensitivity !== current.sensitivity
    ? finishOperation(setting, operations, softness)
    : null
}

/**
 * The edit that Done leaves in Clean up. The sensitivity only changes black and white, so a finish that stays another
 * one leaves none.
 */
export function confirmFinish(setting: FinishPanelSetting, operations: readonly Operation[], softness: number | undefined): Operation | null {
  return setting.mode !== 'mono' && setting.mode === finishSetting(operations).mode
    ? null
    : finishEdit(setting, operations, softness)
}
