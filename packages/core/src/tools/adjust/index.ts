import type { Tool } from '../types'

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
