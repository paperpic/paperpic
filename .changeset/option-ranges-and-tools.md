---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Fix more problems found in the audit of the viewer.

- An option out of its range now throws a `RangeError` that names it, from the constructor and from `setOptions()`: `softness`, `aspectRatio`, `maxOutputSize`, `output.quality` and `output.type`. Before, it failed later inside an edit, and a `maxOutputSize` of 0 gave a result of one pixel.
- `tools` only chooses the buttons of the edit bar. `flip()`, `openTool()`, `setThreshold()` and `setAdjustments()` now work with a tool that is not in `tools`, as `rotate()` already did.
- With the focus on the viewer, an arrow key that has nothing to move scrolls the page.
- With `wheelZoom: false`, the viewer no longer slows the scroll of the page over it.
- Turning `editable` off during an Apply now discards its result, as it discards the edit.
- `reload()` after `destroy()` no longer loads an image that nothing released.
