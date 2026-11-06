---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the edit mode. With `editable`, on by default, the toolbar shows a pencil that opens an edit bar with Cancel, Rotate, Undo, Redo and Apply. Apply replaces the image on display with the result and emits `apply` with `{ blob, width, height, type }`.

`PaperPic` in `@paperpic/core` adds the `tools`, `output` and `maxOutputSize` options, the `edit()`, `undo()`, `redo()`, `apply()`, `cancel()` and `reload()` methods, and `mode`, `canUndo`, `canRedo`, `canApply` and `busy` in `getState()`. `@paperpic/vue` adds the same options as props and the `apply` event.

`rotate()` is now a permanent edit while editing, and does nothing in View mode unless `editable` is `false`. Passing the same `src` again no longer reloads the image: use `reload()`.

Processing runs in a web worker, shipped as `worker.js`. If the worker cannot start, such as under a Content Security Policy without `worker-src 'self'`, it runs on the main thread.
