---
title: Adjust
description: How the Adjust tool of PaperPic changes the brightness and the contrast of a document image with two live sliders, and how to set them from code.
---

# Adjust

Photos taken in poor light come out dark or gray. Adjust changes the brightness and the contrast and keeps the colors, for documents that should not become black and white, such as colored forms or photos.

## Use it

1. Press Edit, then Adjust. Two sliders appear in the edit bar: Brightness and Contrast.
2. Drag a slider. The preview changes while you drag, and releasing the slider leaves one edit, which Undo removes.
3. Press Adjust again to hide the sliders.

The middle of each slider leaves the image as it is, and a slider moved back to the middle is no change. Screen readers announce the value from -100 to 100, such as "Brightness +30".

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

In the [`tools`](../../reference/options#tools) option, Adjust is `'adjust'`.
