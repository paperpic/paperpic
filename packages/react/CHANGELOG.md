# @paperpic/react

## 0.7.0

### Minor Changes

- [#118](https://github.com/paperpic/paperpic/pull/118) [`7d4f7e8`](https://github.com/paperpic/paperpic/commit/7d4f7e8e3f0f7398e346af6848be6a331d3fd3d4) Thanks [@Unlooper](https://github.com/Unlooper)! - Redact draws its area with a drag on the image, also over the band that it opens with. Once the area is drawn, moved, turned or resized, a drag on the rest of the image pans it again. A second finger cancels the drawing and zooms, and the keyboard and the taps work as before. The default of the label `redactHint` is now "Draw an area over what to hide".

### Patch Changes

- Updated dependencies [[`7d4f7e8`](https://github.com/paperpic/paperpic/commit/7d4f7e8e3f0f7398e346af6848be6a331d3fd3d4)]:
  - @paperpic/core@0.7.0

## 0.6.1

### Patch Changes

- [#109](https://github.com/paperpic/paperpic/pull/109) [`6697ece`](https://github.com/paperpic/paperpic/commit/6697eceab4b13563dcc20802db0860f38201f201) Thanks [@Unlooper](https://github.com/Unlooper)! - Straighten now finds documents with a hard shadow over them, such as that of the hand that holds the phone. It often found nothing there before, or placed the corners wrong.
- Updated dependencies [[`6697ece`](https://github.com/paperpic/paperpic/commit/6697eceab4b13563dcc20802db0860f38201f201)]:
  - @paperpic/core@0.6.1

## 0.6.0

### Minor Changes

- [#107](https://github.com/paperpic/paperpic/pull/107) [`5e21499`](https://github.com/paperpic/paperpic/commit/5e21499a7938262c984635d8c52f694cc4d1ddbe) Thanks [@Unlooper](https://github.com/Unlooper)! - Straighten now finds the document. As it opens, it looks for the document in the photo and places the four corners on it, so Done is ready without a drag. The corners slide there, unless the user prefers less motion. When it is not sure, the corners start inside the image and Done waits for a move, as before. It never moves a corner that the user has already touched.
  
  The search runs in the worker, on a small copy of the photo, without dependencies or requests. The new label `perspectiveFound` says on screen and to screen readers that the document was found, and the `canConfirm` of the state turns `true`, with a `change`.
  
  Fix the magnifier leaving the screen in a short viewer, where neither above nor below the finger has room for it. It now goes to its side.
  
  Fix a viewer destroyed while it starts to process an image leaving a worker behind.

- [#105](https://github.com/paperpic/paperpic/pull/105) [`bd3f295`](https://github.com/paperpic/paperpic/commit/bd3f295d8ba7be847fbc0e6daf3b3006eb5a84d1) Thanks [@Unlooper](https://github.com/Unlooper)! - Add paper sizes to Straighten. Its panel offers Auto, A4, Letter and Card, and a size gives the result the exact proportions of that paper, in portrait or in landscape as the corners are. `setPaper({ size })` chooses it while Straighten is open, `getState().paper` reports it, and the new type `PaperSize` names it. Auto keeps the proportions of `aspectRatio`, or else the estimate.
  
  Done now waits in Straighten until a corner moves, so it no longer cuts the image by accident, and `confirmTool()` does nothing until then. The new `canConfirm` of the state reports it, so an interface of your own can disable its Done button.
  
  Fix the choices of Clean up covering Cancel and Done in a narrow viewer: they now scroll. The edit bar fits on one row from 38rem wide instead of 28rem.

### Patch Changes

- Updated dependencies [[`5e21499`](https://github.com/paperpic/paperpic/commit/5e21499a7938262c984635d8c52f694cc4d1ddbe), [`bd3f295`](https://github.com/paperpic/paperpic/commit/bd3f295d8ba7be847fbc0e6daf3b3006eb5a84d1)]:
  - @paperpic/core@0.6.0

## 0.5.0

### Minor Changes

- [#101](https://github.com/paperpic/paperpic/pull/101) [`8035456`](https://github.com/paperpic/paperpic/commit/8035456714aab681e3d2805e6293d923d14f8008) Thanks [@Unlooper](https://github.com/Unlooper)! - Clean up now chooses a finish: the original, gray or black and white. Gray keeps brightness and contrast, so Adjust is disabled only in black and white. This release renames the API of Clean up, so code that uses it needs these changes:
  
  - `setThreshold({ enabled, sensitivity })` is now `setFinish({ mode, sensitivity })`, where `mode` is `'original'`, `'gray'` or `'mono'`. Replace `enabled: true` with `mode: 'mono'`, and `enabled: false` with `mode: 'original'`.
  - `getState().threshold` is now `getState().finish`, with `{ mode, sensitivity }` in place of `{ enabled, sensitivity }`.
  - The tool id `'threshold'` is now `'finish'`, in `tools`, `openTool()` and `getState().activeTool`, and in the `data-paperpic-tool` attribute of the root.
  - The `labels` keys `threshold`, `thresholdLevel` and `thresholdSensitivity` are now `finish`, `finishLevel` and `finishSensitivity`, with three new keys for the finishes: `finishOriginal`, `finishGray` and `finishMono`. The `data-paperpic-control` values follow them.
  - The `icons` key `threshold` is now `finish`.
  - The switch of Clean up is gone, and the original finish turns it off. Its classes, `paperpic-edit-switch`, `paperpic-edit-switch-track` and `paperpic-edit-switch-thumb`, are gone too.
  
  The `FinishMode` type names the finishes.

- [#103](https://github.com/paperpic/paperpic/pull/103) [`721d632`](https://github.com/paperpic/paperpic/commit/721d632ddb12ba6d0e2b872aac3666469def0416) Thanks [@Unlooper](https://github.com/Unlooper)! - Add Redact, a tool that covers an area with solid black or white, such as an account number or a signature. The area is a rectangle that moves as a whole, turns by a handle to lean with a line of text, and resizes by its corners. Each Done leaves one area, which follows the edits after it and runs after Adjust and Clean up, and Apply writes it into the pixels of the result. `setRedaction({ color })` chooses the color, `getState().redaction` reports it, and the new type `RedactColor` names it. The tool id is `'redact'`, and it joins the edit bar by default: pass `tools` without it to leave it out.

### Patch Changes

- Updated dependencies [[`8035456`](https://github.com/paperpic/paperpic/commit/8035456714aab681e3d2805e6293d923d14f8008), [`721d632`](https://github.com/paperpic/paperpic/commit/721d632ddb12ba6d0e2b872aac3666469def0416)]:
  - @paperpic/core@0.5.0

## 0.4.0

### Minor Changes

- [#98](https://github.com/paperpic/paperpic/pull/98) [`17f7186`](https://github.com/paperpic/paperpic/commit/17f71869e4fd3de861f5575259965a038578f681) Thanks [@Unlooper](https://github.com/Unlooper)! - Screen readers now hear how to move a corner handle of Crop and Straighten with the keyboard. The new label `cornerKeys`, "Arrow keys move it, 10 times further with Shift. Enter finishes.", describes each handle. If your app translates the labels, add it.

- [#99](https://github.com/paperpic/paperpic/pull/99) [`b3c0aa6`](https://github.com/paperpic/paperpic/commit/b3c0aa6a39ecfb9d8eb6feddf0eea04e1bc25ef7) Thanks [@Unlooper](https://github.com/Unlooper)! - `PaperPicState` has a new `hint`: what the open tool asks of the user, as the edit bar shows it, such as "Drag the corners", or `null`. With `toolbar: false`, show it in your own interface. A new hint, such as after pressing a corner handle, emits `change`.

- [#96](https://github.com/paperpic/paperpic/pull/96) [`16d9d8a`](https://github.com/paperpic/paperpic/commit/16d9d8a317fdb1e22e08fb9fcd5a9a99367a81b5) Thanks [@Unlooper](https://github.com/Unlooper)! - Three new tokens restyle what the viewer paints over the image: `--paperpic-color-dim` darkens the image around a selection, `--paperpic-color-line` colors the outline, the corner handles and the cross of the magnifier, and `--paperpic-color-line-shadow` the shadow that keeps those lines visible. The root `.paperpic` also carries `data-paperpic-status`, `data-paperpic-mode` and `data-paperpic-tool`, so CSS can follow the load status, the edit mode and the open tool.

- [#95](https://github.com/paperpic/paperpic/pull/95) [`360e6f7`](https://github.com/paperpic/paperpic/commit/360e6f7c1c2c4d7090b3cc3adbfaadd2d75349c1) Thanks [@Unlooper](https://github.com/Unlooper)! - `labels` has two new keys. `previewError`, "The changes could not be shown", is the message when an edit cannot be shown, which showed `applyError` before although nothing was applied. `adjustUnavailable`, "Not available while Clean up is on", tells screen readers why Adjust is disabled while Clean up is on. If your app translates the labels, add both.

### Patch Changes

- [#93](https://github.com/paperpic/paperpic/pull/93) [`d70ee01`](https://github.com/paperpic/paperpic/commit/d70ee01b53676ef5aa6185a8ede7b48eb98f41f8) Thanks [@Unlooper](https://github.com/Unlooper)! - A message in the middle of the viewer, such as the one of a failed Apply, now stays on screen when the viewer announces another change, such as the zoom. Only the image is marked busy now, so screen readers no longer risk holding back "Applying changes" and "Loading image". `zoomTo()` throws a `RangeError` for a zoom of `NaN`, which left the viewer blank, and the cross and the ring of the magnifier have a dark outline, so they show on white paper.

- [#94](https://github.com/paperpic/paperpic/pull/94) [`d2b98ab`](https://github.com/paperpic/paperpic/commit/d2b98aba86007ce9dad7e69e7e0aa7265fa51fa2) Thanks [@Unlooper](https://github.com/Unlooper)! - A long message in the middle of the viewer, such as a translated failure, now wraps instead of being cut off, and stays centered on pages written right to left. Buttons and corner handles measure 44 pixels on any device with a touch screen, also on a laptop whose main pointer is a trackpad. Closing a tool whose button `tools` hides no longer loses the keyboard focus, and screen readers hear the question before discarding the changes as a group named by it, not as a dialog. The `error` event always carries an `Error`, the canvas stays sharp when the window moves to a screen of another density, and a pan no longer measures the toolbar on every move.

- [#91](https://github.com/paperpic/paperpic/pull/91) [`8f1e793`](https://github.com/paperpic/paperpic/commit/8f1e793593305ece4fc27f6a1c9eedbdf2587b1e) Thanks [@Unlooper](https://github.com/Unlooper)! - Show the features, a before and after image and links to the docs and playground on the npm page of each package, and add search keywords. Nothing changes in the code you install.

- [#96](https://github.com/paperpic/paperpic/pull/96) [`16d9d8a`](https://github.com/paperpic/paperpic/commit/16d9d8a317fdb1e22e08fb9fcd5a9a99367a81b5) Thanks [@Unlooper](https://github.com/Unlooper)! - The viewer no longer makes the browser report "ResizeObserver loop completed with undelivered notifications", which it could do on load since it also watched the size of its toolbar.
- Updated dependencies [[`d70ee01`](https://github.com/paperpic/paperpic/commit/d70ee01b53676ef5aa6185a8ede7b48eb98f41f8), [`17f7186`](https://github.com/paperpic/paperpic/commit/17f71869e4fd3de861f5575259965a038578f681), [`d2b98ab`](https://github.com/paperpic/paperpic/commit/d2b98aba86007ce9dad7e69e7e0aa7265fa51fa2), [`b3c0aa6`](https://github.com/paperpic/paperpic/commit/b3c0aa6a39ecfb9d8eb6feddf0eea04e1bc25ef7), [`8f1e793`](https://github.com/paperpic/paperpic/commit/8f1e793593305ece4fc27f6a1c9eedbdf2587b1e), [`16d9d8a`](https://github.com/paperpic/paperpic/commit/16d9d8a317fdb1e22e08fb9fcd5a9a99367a81b5), [`360e6f7`](https://github.com/paperpic/paperpic/commit/360e6f7c1c2c4d7090b3cc3adbfaadd2d75349c1), [`16d9d8a`](https://github.com/paperpic/paperpic/commit/16d9d8a317fdb1e22e08fb9fcd5a9a99367a81b5)]:
  - @paperpic/core@0.4.0

## 0.3.1

### Patch Changes

- [#86](https://github.com/paperpic/paperpic/pull/86) [`bc2c194`](https://github.com/paperpic/paperpic/commit/bc2c19498f5f946e89f39c1545b5fd29ed699b6d) Thanks [@Unlooper](https://github.com/Unlooper)! - Correct the descriptions that editors show for the events and the state. `change` also comes from the methods, `load` does not follow Apply, `apply()` resolves even when Apply fails, and `image` in the state leaves out the turn of `rotation`.
- Updated dependencies [[`bc2c194`](https://github.com/paperpic/paperpic/commit/bc2c19498f5f946e89f39c1545b5fd29ed699b6d)]:
  - @paperpic/core@0.3.1

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
