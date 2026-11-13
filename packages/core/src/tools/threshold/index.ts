import type { Tool } from '../types'

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
