---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add a download button. With `download: true` the toolbar saves the image on display, which is the result of the last Apply or else the source, and `download()` does the same from code. The file keeps the name of the source, or takes the one in `filename`, with the extension of its format. The new `download` event comes first, and `preventDefault()` on it lets your app save the image another way.

The menu of the browser no longer opens over the image. It only offered to save the view on screen, not the image.

`PaperPicLabels` has a new `download` text. If you pass a full set of labels typed as `PaperPicLabels`, add it.
