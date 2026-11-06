---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the Crop tool. The edit bar offers it by default, and the user adjusts the rectangle by its 4 corners, with a magnifier on touch screens and with the arrow keys. `PaperPic` adds the `openTool()`, `confirmTool()` and `cancelTool()` methods, and `activeTool` in `getState()`, whose `image` now reports the size of the image with the edits so far.

`maxOutputSize` now limits the longest side of the result, instead of the side of the source image.
