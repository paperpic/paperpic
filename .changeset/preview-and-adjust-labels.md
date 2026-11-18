---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

`labels` has two new keys. `previewError`, "The changes could not be shown", is the message when an edit cannot be shown, which showed `applyError` before although nothing was applied. `adjustUnavailable`, "Not available while Clean up is on", tells screen readers why Adjust is disabled while Clean up is on. If your app translates the labels, add both.
