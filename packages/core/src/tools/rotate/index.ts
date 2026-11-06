import type { Tool } from '../types'

/** Turns the image a quarter turn, at once. */
export const rotateTool: Tool = {
  id: 'rotate',
  actions: [
    {
      id: 'rotateLeft',
      run: context => context.addOperation({ type: 'rotate', direction: -1 }),
    },
    {
      id: 'rotateRight',
      run: context => context.addOperation({ type: 'rotate', direction: 1 }),
    },
  ],
}
