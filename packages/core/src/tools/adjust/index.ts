import type { Tool } from '../types'

/**
 * Changes the brightness and contrast. They are a setting that runs after the shape, so its button only shows their sliders.
 * Each slider leaves one edit when the user releases it.
 */
export const adjustTool: Tool = {
  id: 'adjust',
  actions: [
    {
      id: 'adjust',
      run: context => context.toggleAdjustments(),
    },
  ],
}
