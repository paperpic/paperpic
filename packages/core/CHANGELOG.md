# @paperpic/core

## 0.1.0

### Minor Changes

- [#26](https://github.com/paperpic/paperpic/pull/26) [`f9b3b1a`](https://github.com/paperpic/paperpic/commit/f9b3b1aa702993fb11302eff57414be4bc416971) Thanks [@Unlooper](https://github.com/Unlooper)! - Add the Crop tool. The edit bar offers it by default, and the user adjusts the rectangle by its 4 corners, with a magnifier on touch screens and with the arrow keys. `PaperPic` adds the `openTool()`, `confirmTool()` and `cancelTool()` methods, and `activeTool` in `getState()`, whose `image` now reports the size of the image with the edits so far.
  
  `maxOutputSize` now limits the longest side of the result, instead of the side of the source image.

- [#22](https://github.com/paperpic/paperpic/pull/22) [`51c1caa`](https://github.com/paperpic/paperpic/commit/51c1caa73a95b40d1371bce7ea603532620ac58e) Thanks [@Unlooper](https://github.com/Unlooper)! - Add theming tokens as `--paperpic-*` custom properties. `@paperpic/core` now ships a `style.css`, and `@paperpic/vue` includes the same tokens in its own `style.css`. `@paperpic/vue` now depends on the exact matching version of `@paperpic/core`.

- [#24](https://github.com/paperpic/paperpic/pull/24) [`7adaa0b`](https://github.com/paperpic/paperpic/commit/7adaa0b11aed3e4ed690b5c193b68e924896ce51) Thanks [@Unlooper](https://github.com/Unlooper)! - Add the document image viewer. `@paperpic/core` now exports the `PaperPic` class, with zoom, pan, fit to width or height, keyboard and touch gestures, and a built-in toolbar. With `editable: false`, the toolbar can also rotate the image.
  
  `PaperPic` in `@paperpic/vue` is now a wrapper around it, and takes `src`, `alt`, `editable`, `toolbar`, `wheelZoom` and `labels`. The `rotation` prop is gone: use the rotate buttons with `editable: false`, or `instance.rotate()`. The viewer fills its parent, which needs a height.

- [#25](https://github.com/paperpic/paperpic/pull/25) [`b09be51`](https://github.com/paperpic/paperpic/commit/b09be5142db900dbea6c1627d5b8066bf3a11a58) Thanks [@Unlooper](https://github.com/Unlooper)! - Add the edit mode. With `editable`, on by default, the toolbar shows a pencil that opens an edit bar with Cancel, Rotate, Undo, Redo and Apply. Apply replaces the image on display with the result and emits `apply` with `{ blob, width, height, type }`.
  
  `PaperPic` in `@paperpic/core` adds the `tools`, `output` and `maxOutputSize` options, the `edit()`, `undo()`, `redo()`, `apply()`, `cancel()` and `reload()` methods, and `mode`, `canUndo`, `canRedo`, `canApply` and `busy` in `getState()`. `@paperpic/vue` adds the same options as props and the `apply` event.
  
  `rotate()` is now a permanent edit while editing, and does nothing in View mode unless `editable` is `false`. Passing the same `src` again no longer reloads the image: use `reload()`.
  
  Processing runs in a web worker, shipped as `worker.js`. If the worker cannot start, such as under a Content Security Policy without `worker-src 'self'`, it runs on the main thread.

- [#27](https://github.com/paperpic/paperpic/pull/27) [`357ba04`](https://github.com/paperpic/paperpic/commit/357ba04e3d281e515800134c21bbee98eac8f4ef) Thanks [@Unlooper](https://github.com/Unlooper)! - Add the Straighten tool, which corrects the perspective of a document from its 4 corners. The edit bar offers it by default, as `perspective` in `tools`, and it opens with `openTool('perspective')`. It estimates the proportions of the document, and the new `aspectRatio` option fixes them when they are known, as width divided by height.

- [#19](https://github.com/paperpic/paperpic/pull/19) [`87eb6c0`](https://github.com/paperpic/paperpic/commit/87eb6c0d694779d7dbcb7cd3a565747c0f750bb4) Thanks [@Unlooper](https://github.com/Unlooper)! - Target Baseline Widely Available browsers. In `@paperpic/vue`, move the styles into the `paperpic` cascade layer and add the `--paperpic-transition-duration` custom property.
