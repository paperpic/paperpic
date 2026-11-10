---
title: Rotate and flip
description: How to rotate and flip a document image in PaperPic, in the edit mode, in a read-only viewer and from code.
---

# Rotate and flip

Phones often save a photo of a document sideways or upside down, and some scans come out mirrored. Rotate left and Flip fix the orientation and leave the rest of the image as it is.

## Rotate

In the edit bar, Rotate left turns the image a quarter turn counterclockwise, as in photo galleries. Press it twice for a half turn, or three times for a quarter turn clockwise.

A rotation is an edit: Undo removes it, and Apply makes it permanent. Four rotations bring the image back to where it was, and then there is nothing to apply.

From code, [`rotate()`](../../reference/methods#rotate) turns clockwise with `1`, and counterclockwise with `-1`:

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Flip

Flip mirrors the image left to right, as it is on display, so after a quarter turn it still mirrors left to right on the screen. To turn an image upside down, flip it and rotate it twice.

Flips and rotations that cancel out leave nothing to apply. From code, call [`flip()`](../../reference/methods#flip).

## In a read-only viewer

With [`editable: false`](../viewer#read-only), the toolbar has Rotate left and Rotate right buttons. They only turn the image on display: nothing is saved, and the `apply` event never fires. [`rotate()`](../../reference/methods#rotate) does the same from code. A read-only viewer has no Flip.

## Ids

In the [`tools`](../../reference/options#tools) option, Rotate left is `'rotate'` and Flip is `'flip'`.
