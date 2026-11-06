/** A list of edits, with what can be redone. It never changes in place. */
export interface History<Item> {
  done: readonly Item[]
  undone: readonly Item[]
}

/** An empty history. */
export function createHistory<Item>(): History<Item> {
  return { done: [], undone: [] }
}

/** Adds an edit. What could be redone is lost, as in any editor. */
export function addToHistory<Item>({ done }: History<Item>, item: Item): History<Item> {
  return {
    done: [...done, item],
    undone: [],
  }
}

/** Moves the last edit to what can be redone. */
export function undoHistory<Item>(history: History<Item>): History<Item> {
  const last = history.done.at(-1)
  return last === undefined
    ? history
    : {
        done: history.done.slice(0, -1),
        undone: [...history.undone, last],
      }
}

/** Brings back the last edit undone. */
export function redoHistory<Item>(history: History<Item>): History<Item> {
  const last = history.undone.at(-1)
  return last === undefined
    ? history
    : {
        done: [...history.done, last],
        undone: history.undone.slice(0, -1),
      }
}
