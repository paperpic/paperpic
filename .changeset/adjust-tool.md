---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the Adjust tool for brightness and contrast. The edit bar offers it by default, and its button shows two sliders that repaint the preview while they move. Cleaning up the document leaves them out. `PaperPic` adds the `setAdjustments()` method and `adjustments` in `getState()`. `PaperPicLabels` adds `adjust`, `brightness`, `contrast` and `adjustmentLevel`.
