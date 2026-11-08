import type { Tool } from '../types'

/** Cleans up a document. It is a setting that always runs last, so its button only turns it on and off. */
export const thresholdTool: Tool = {
  id: 'threshold',
  actions: [
    {
      id: 'threshold',
      run: context => context.toggleThreshold(),
    },
  ],
}
