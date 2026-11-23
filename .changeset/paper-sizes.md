---
"@paperpic/core": minor
"@paperpic/vue": minor
"@paperpic/react": minor
---

Add paper sizes to Straighten. Its panel offers Auto, A4, Letter and Card, and a size gives the result the exact proportions of that paper, in portrait or in landscape as the corners are. `setPaper({ size })` chooses it while Straighten is open, `getState().paper` reports it, and the new type `PaperSize` names it. Auto keeps the proportions of `aspectRatio`, or else the estimate.

Done now waits in Straighten until a corner moves, so it no longer cuts the image by accident, and `confirmTool()` does nothing until then. The new `canConfirm` of the state reports it, so an interface of your own can disable its Done button.

Fix the choices of Clean up covering Cancel and Done in a narrow viewer: they now scroll. The edit bar fits on one row from 38rem wide instead of 28rem.
