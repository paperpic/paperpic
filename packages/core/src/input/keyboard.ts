/** What a key asks the viewer to do. */
export type KeyCommand
  = | { type: 'zoomIn' | 'zoomOut' | 'fit' | 'undo' | 'redo' | 'cancel' | 'apply' }
    | { type: 'pan', deltaX: number, deltaY: number }

const PAN_STEP = 40

const COMMANDS: Record<string, KeyCommand> = {
  '+': { type: 'zoomIn' },
  '=': { type: 'zoomIn' },
  '-': { type: 'zoomOut' },
  '_': { type: 'zoomOut' },
  '0': { type: 'fit' },
  'ArrowLeft': { type: 'pan', deltaX: PAN_STEP, deltaY: 0 },
  'ArrowRight': { type: 'pan', deltaX: -PAN_STEP, deltaY: 0 },
  'ArrowUp': { type: 'pan', deltaX: 0, deltaY: PAN_STEP },
  'ArrowDown': { type: 'pan', deltaX: 0, deltaY: -PAN_STEP },
  'Escape': { type: 'cancel' },
  'Enter': { type: 'apply' },
}

/** Finds the command for a key, leaving browser shortcuts such as Ctrl and + alone. */
export function keyToCommand(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>): KeyCommand | null {
  if (event.altKey) {
    return null
  }
  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase()
    if (key === 'z') {
      return {
        type: event.shiftKey ? 'redo' : 'undo',
      }
    }
    return key === 'y'
      ? { type: 'redo' }
      : null
  }
  return COMMANDS[event.key] ?? null
}
