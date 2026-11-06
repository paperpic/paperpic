---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the document image viewer. `@paperpic/core` now exports the `PaperPic` class, with zoom, pan, fit to width or height, keyboard and touch gestures, and a built-in toolbar. With `editable: false`, the toolbar can also rotate the image.

`PaperPic` in `@paperpic/vue` is now a wrapper around it, and takes `src`, `alt`, `editable`, `toolbar`, `wheelZoom` and `labels`. The `rotation` prop is gone: use the rotate buttons with `editable: false`, or `instance.rotate()`. The viewer fills its parent, which needs a height.
