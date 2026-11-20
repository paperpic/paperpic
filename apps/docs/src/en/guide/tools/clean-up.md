---
title: Clean up
description: How the Clean up tool of PaperPic turns a photo of a document gray, or into crisp black and white without shadows, and how sensitivity and softness change the result, with a live demo.
---

# Clean up

Clean up chooses the finish of the image: the original tones, gray, or black and white. Its id in the API is `finish`.

Text on paper reads best in black and white, but a photo has shadows, uneven light and gray paper. Black and white compares each pixel with its surroundings to decide whether it is ink or paper, so shadows and uneven light disappear and the text stays sharp. Gray keeps every tone and only removes the color, for documents with photos or stamps that black and white would lose.

<Demo src="/samples/receipt.jpg" alt="A receipt" :tools="['perspective', 'finish']" />

Straighten the receipt first, then clean it up.

## Use it

1. Press Edit, then Clean up. Its panel takes the place of the tools, with three finishes: Original, Gray and Black and white. It opens in black and white, so the preview turns black and white and the Sensitivity ruler works.
2. Drag the ruler. Higher sensitivity darkens more pixels, which recovers faint or worn text. Lower sensitivity gives a cleaner page, without the print that shows through from the back.
3. Choose Gray instead for a gray image, or Original for the tones of the photo. The ruler only works in black and white.
4. Press Done to keep it as one edit, or Cancel this tool to leave the image as it was.

Once Clean up is an edit, it opens again with its finish. To turn it off, choose Original: the edits that came after it stay. Undo, instead, would also remove those edits.

Clean up always runs after the other edits. Crop shows the image with its finish, as it will be. Straighten shows it without black and white, because the edges of the paper are hard to find on a cleaned up page, and keeps gray.

[Adjust](./adjust) works with gray, which comes after it, and is disabled in black and white, which has tones of its own.

## Softness

[`softness`](../../reference/options#softness) sets how much gray black and white keeps at the edges of the letters, from 0 to 1, with 0.25 by default. A little gray smooths the edges and makes small text easier to read. Use `0` for strict black and white, which gives smaller files but breaks thin strokes.

## Format of the result

An image in black and white is PNG, because JPEG would add artifacts around its sharp edges. A gray image keeps the format of the source. The [`output`](../../reference/options#output) option can choose another format.

## From code

[`setFinish()`](../../reference/methods#setfinish) chooses the finish, `'original'`, `'gray'` or `'mono'` for black and white, and sets the sensitivity of black and white, from 0 to 1, with 0.5 by default. [`getState()`](../../reference/methods#getstate) returns both in `finish`:

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

While Clean up is open, `setFinish()` changes what its panel shows, and [`confirmTool()`](../../reference/methods#confirmtool) keeps it as one edit.
