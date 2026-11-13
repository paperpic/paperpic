import type { Tool } from '../types'

/** Mirrors the image left to right, at once. A vertical flip is a flip and a half turn. */
export const flipTool: Tool = {
  id: 'flip',
  actions: [
    {
      id: 'flip',
      run: context => context.addOperation({ type: 'flip' }),
    },
  ],
}
