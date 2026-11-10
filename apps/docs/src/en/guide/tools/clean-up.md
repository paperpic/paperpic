---
title: Clean up
description: How the Clean up tool of PaperPic turns a photo of a document into crisp black and white without shadows, and how sensitivity and softness change the result, with a live demo.
---

# Clean up

Text on paper reads best in black and white, but a photo has shadows, uneven light and gray paper. Clean up compares each pixel with its surroundings to decide whether it is ink or paper, so shadows and uneven light disappear and the text stays sharp. Its id in the API is `threshold`.

<Demo src="/samples/receipt.jpg" alt="A receipt" :tools="['perspective', 'threshold']" />

Straighten the receipt first, then clean it up.

## Use it

1. Press Edit, then Clean up. The preview turns black and white, and a Sensitivity slider appears.
2. Drag the slider. Higher sensitivity darkens more pixels, which recovers faint or worn text. Lower sensitivity gives a cleaner page, without the print that shows through from the back. Releasing the slider leaves one edit.
3. Press Clean up again to turn it off.

Clean up always runs after the other edits. Crop and Straighten show the image without it, because the edges of the paper are hard to find on a cleaned up page.

## Softness

[`softness`](../../reference/options#softness) sets how much gray Clean up keeps at the edges of the letters, from 0 to 1, with 0.25 by default. A little gray smooths the edges and makes small text easier to read. Use `0` for strict black and white, which gives smaller files but breaks thin strokes.

## Format of the result

A cleaned up image is PNG, because JPEG would add artifacts around its sharp edges. The [`output`](../../reference/options#output) option can choose another format.

## From code

[`setThreshold()`](../../reference/methods#setthreshold) turns Clean up on or off and sets its sensitivity, from 0 to 1, with 0.5 by default. [`getState()`](../../reference/methods#getstate) returns both in `threshold`:

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```
