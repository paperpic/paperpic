---
title: Adjust
description: How the Adjust tool of PaperPic changes the brightness and the contrast of a document image with a live ruler, and how to set them from code.
---

# Adjust

Photos taken in poor light come out dark or gray. Adjust changes the brightness and the contrast and keeps the colors, for documents that should not become black and white, such as colored forms or photos.

## Use it

1. Press Edit, then Adjust. Its panel takes the place of the tools: a ruler, and Brightness and Contrast to choose which tone it changes.
2. Drag the ruler. The preview changes while you drag. Choose Contrast to change the other tone with the same ruler.
3. Press Done to keep both tones as one edit, which Undo removes. Cancel this tool leaves the image as it was.

The middle of the ruler leaves the image as it is, and the needle catches there, so no change is easy to find again. Screen readers announce the value from -100 to 100, such as "Brightness +30". A dot on Adjust, and on each tone inside its panel, marks a value that is not 0.

Adjust runs after the other edits, so Crop and Straighten show the image with it.

## Adjust or Clean up?

| Adjust                               | [Clean up](./clean-up)                  |
| ------------------------------------ | --------------------------------------- |
| Keeps the colors and the grays       | Turns the document into black and white |
| For colored forms, stamps and photos | For text on paper                       |
| Keeps the format of the source       | Gives PNG                               |

While Clean up is on, Adjust is disabled, because a cleaned up document has tones of its own.

## From code

[`setAdjustments()`](../../reference/methods#setadjustments) takes values from -1 to 1, where 0 is no change, and [`getState()`](../../reference/methods#getstate) returns them in `adjustments`:

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

While Adjust is open, `setAdjustments()` changes what its panel shows, and [`confirmTool()`](../../reference/methods#confirmtool) keeps it as one edit.

In the [`tools`](../../reference/options#tools) option, Adjust is `'adjust'`.
