---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Tell failures apart, and do less work on each render and edit.

- `error` now carries a `phase`: `'load'`, `'preview'` or `'apply'`. A preview that fails, such as one of an image too large for the browser, also emits `error`, and the edit stays open.
- `setOptions()` and the props of the components change nothing when the options have the same values as before. An inline `tools` or `output` with the same contents no longer sets the labels, icons and tools again on every render, nor clears the announcement of Apply for screen readers. A function in `labels` still counts as new on every render.
- The sliders of Adjust and Clean up repaint the image once per frame, with their latest value, instead of once per move.
- A quick run of Undo, Redo or Flip computes the preview of the first and the last state only, instead of one per press.
