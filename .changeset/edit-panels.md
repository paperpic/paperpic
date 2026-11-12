---
"@paperpic/core": minor
"@paperpic/react": minor
"@paperpic/vue": minor
---

Redesign the edit bar. It is now a card at the bottom with two rows of fixed height, or one row from 28rem wide, so the image keeps its place when a tool opens. Crop, Straighten, Adjust and Clean up all open a panel with Cancel this tool and Done, and Done leaves one edit. Adjust shows one ruler with a choice between brightness and contrast, and Clean up turns on as it opens and shows its ruler. Once Clean up is an edit, opening it again also shows a switch that turns it off without undoing the edits after it. A dot marks Adjust and Clean up while their setting is in effect. The toolbar hides while editing, so it never covers a corner, and the panels of Crop and Straighten carry zoom in and zoom out, which zoom toward the selected corner. Crop shows the image cleaned up, as it will be, and only Straighten shows it without Clean up.

`openTool()` also opens `'adjust'` and `'threshold'`. While one of them is open, `setAdjustments()` or `setThreshold()` change what it shows instead of adding an edit, `getState()` reports those values, and `confirmTool()` keeps them as one edit. `PaperPicIcons` adds `brightness` and `contrast`, and `threshold` has a new icon. `PaperPicLabels` adds `inUse`.

The hover of the buttons only shows with a pointer that hovers, so a tap on a phone leaves nothing lit. The `aria-expanded` state of Adjust and the `aria-pressed` state of Clean up are gone.
