# @paperpic/react

## 0.3.0

### Minor Changes

- [#77](https://github.com/paperpic/paperpic/pull/77) [`3022355`](https://github.com/paperpic/paperpic/commit/3022355b3531dd60d9f904e92463d8c8d60f5be6) Thanks [@Unlooper](https://github.com/Unlooper)! - Tell failures apart, and do less work on each render and edit.
  
  - `error` now carries a `phase`: `'load'`, `'preview'` or `'apply'`. A preview that fails, such as one of an image too large for the browser, also emits `error`, and the edit stays open.
  - `setOptions()` and the props of the components change nothing when the options have the same values as before. An inline `tools` or `output` with the same contents no longer sets the labels, icons and tools again on every render, nor clears the announcement of Apply for screen readers. A function in `labels` still counts as new on every render.
  - The sliders of Adjust and Clean up repaint the image once per frame, with their latest value, instead of once per move.
  - A quick run of Undo, Redo or Flip computes the preview of the first and the last state only, instead of one per press.

- [#76](https://github.com/paperpic/paperpic/pull/76) [`e6fcbf9`](https://github.com/paperpic/paperpic/commit/e6fcbf90f90307a5c42b0f7cf19b518e26358920) Thanks [@Unlooper](https://github.com/Unlooper)! - Fix more problems found in the audit of the viewer.
  
  - An option out of its range now throws a `RangeError` that names it, from the constructor and from `setOptions()`: `softness`, `aspectRatio`, `maxOutputSize`, `output.quality` and `output.type`. Before, it failed later inside an edit, and a `maxOutputSize` of 0 gave a result of one pixel.
  - `tools` only chooses the buttons of the edit bar. `flip()`, `openTool()`, `setThreshold()` and `setAdjustments()` now work with a tool that is not in `tools`, as `rotate()` already did.
  - With the focus on the viewer, an arrow key that has nothing to move scrolls the page.
  - With `wheelZoom: false`, the viewer no longer slows the scroll of the page over it.
  - Turning `editable` off during an Apply now discards its result, as it discards the edit.
  - `reload()` after `destroy()` no longer loads an image that nothing released.

### Patch Changes

- [#82](https://github.com/paperpic/paperpic/pull/82) [`10bd91e`](https://github.com/paperpic/paperpic/commit/10bd91eb867a9cf926e49c15bc8062a4a9ad276e) Thanks [@Unlooper](https://github.com/Unlooper)! - Reorganize the internal modules of the viewer. Nothing changes in its behavior or its public API.

- [#74](https://github.com/paperpic/paperpic/pull/74) [`06d6f5f`](https://github.com/paperpic/paperpic/commit/06d6f5f64707bfddada8b1b35ac1a54aa4b6727a) Thanks [@Unlooper](https://github.com/Unlooper)! - Fix several problems found in an audit of the viewer.
  
  - A listener of `on()` that throws no longer looks like a failure of the viewer. An error inside an `apply` listener left "The changes could not be applied" over the applied image, and one inside a `load` listener discarded the image. The page now gets the error as any uncaught one, and the other listeners still run.
  - `change` no longer fires while the user pans. The state does not hold the position of the image, so it carried the same state on every move of the pointer.
  - The viewer now works under a Content Security Policy that requires Trusted Types. Its icons go through a policy named `paperpic`, so a policy that restricts them needs `trusted-types paperpic`. The worker starts there only if the page has a `default` policy that accepts its URL, and otherwise the editing runs on the main thread, as before.
  - Apply and the previews free the memory of their canvases at once, which Safari on iOS limits.
  - An image too large for the browser to read no longer reports that it comes from another origin. The error says to set `maxOutputSize`.

- [#78](https://github.com/paperpic/paperpic/pull/78) [`16657db`](https://github.com/paperpic/paperpic/commit/16657db4d961b17c646639e25b5f72cbad041641) Thanks [@Unlooper](https://github.com/Unlooper)! - Describe the packages on npm as viewers and editors of any document image, such as phone photos, scans and images with text.

- [#81](https://github.com/paperpic/paperpic/pull/81) [`9345b05`](https://github.com/paperpic/paperpic/commit/9345b0562c424cf246aad55766b457de4671c222) Thanks [@Unlooper](https://github.com/Unlooper)! - The viewer no longer flashes a blank frame when its size changes, such as when the window or the layout around it resizes. A pan or a zoom now updates only the controls that depend on the view.
- Updated dependencies [[`10bd91e`](https://github.com/paperpic/paperpic/commit/10bd91eb867a9cf926e49c15bc8062a4a9ad276e), [`3022355`](https://github.com/paperpic/paperpic/commit/3022355b3531dd60d9f904e92463d8c8d60f5be6), [`06d6f5f`](https://github.com/paperpic/paperpic/commit/06d6f5f64707bfddada8b1b35ac1a54aa4b6727a), [`e6fcbf9`](https://github.com/paperpic/paperpic/commit/e6fcbf90f90307a5c42b0f7cf19b518e26358920), [`16657db`](https://github.com/paperpic/paperpic/commit/16657db4d961b17c646639e25b5f72cbad041641), [`9345b05`](https://github.com/paperpic/paperpic/commit/9345b0562c424cf246aad55766b457de4671c222)]:
  - @paperpic/core@0.3.0

## 0.2.0

### Minor Changes

- [#71](https://github.com/paperpic/paperpic/pull/71) [`9431e42`](https://github.com/paperpic/paperpic/commit/9431e42e564207b6151f18cf23adcf9e2d9738bc) Thanks [@Unlooper](https://github.com/Unlooper)! - Export every type of `@paperpic/core`, so you never need to install it to type your code. The new ones are `Fit`, `PaperPicOptions`, `PaperPicSource`, `Rotation`, `Size` and `ViewPoint`. `@paperpic/vue` also exports `PaperPicInstance`, the type of the `instance` that the component exposes.

### Patch Changes

- Updated dependencies [[`9431e42`](https://github.com/paperpic/paperpic/commit/9431e42e564207b6151f18cf23adcf9e2d9738bc)]:
  - @paperpic/core@0.2.0

## 0.1.0

### Minor Changes

- [#65](https://github.com/paperpic/paperpic/pull/65) [`cd559ef`](https://github.com/paperpic/paperpic/commit/cd559ef89ef57945f7c28be264ae3ff04c5536d8) Thanks [@Unlooper](https://github.com/Unlooper)! - Initial release.

### Patch Changes

- Updated dependencies [[`cd559ef`](https://github.com/paperpic/paperpic/commit/cd559ef89ef57945f7c28be264ae3ff04c5536d8)]:
  - @paperpic/core@0.1.0
