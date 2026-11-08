---
"@paperpic/core": minor
"@paperpic/vue": minor
---

Add the Clean up tool, an adaptive threshold that always runs after the other edits. The edit bar offers it by default, as `threshold` in `tools`, with a slider for its sensitivity, and `setThreshold({ enabled, sensitivity })` controls it from code. The new `softness` option sets how much gray it keeps, and 0 gives strict black and white. The result is a PNG unless `output` says otherwise.

`change` now also fires when Apply starts, with `busy: true`, so an app can show its own progress.

`@paperpic/vue` now exports the types of the props and events, such as `PaperPicLabels`, so apps with strict installs can use them.
