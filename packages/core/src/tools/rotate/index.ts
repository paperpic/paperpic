import type { Tool } from '../types'

/** Turns the image a quarter turn to the left, at once, as photo galleries do. Four presses cover every turn. */
export const rotateTool: Tool = {
  id: 'rotate',
  actions: [
    {
      id: 'rotateLeft',
      icon: 'rotateDocument',
      run: context => context.addOperation({ type: 'rotate', direction: -1 }),
    },
  ],
}
