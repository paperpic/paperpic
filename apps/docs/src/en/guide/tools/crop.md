---
title: Crop
description: How the Crop tool of PaperPic keeps the part of a photo that holds the document, with corner handles, a magnifier on touch screens and the keyboard.
---

# Crop

A photo of a document often shows the table, a hand or other papers around it. Crop keeps the rectangle that holds the document and drops the rest.

## Use it

1. Press Edit, then Crop. A rectangle appears inside the image, with a handle at each corner.
2. Drag the corners until the rectangle frames the document. The zoom buttons stay available, so you can zoom in to place them precisely.
3. Press Done, or `Enter`, to add the crop to the edits. Cancel this tool, or `Esc`, closes Crop without changing anything.

The crop is an edit like any other: Undo removes it, and Apply makes it permanent.

## Corner handles

- The handles stay inside the image, and the rectangle never turns inside out.
- On a touch screen, a magnifier shows the area under the finger while it drags a corner, so the finger does not hide where the corner lands.
- With the keyboard, Tab moves between the handles, and the arrow keys move the focused handle 1 screen pixel, or 10 with Shift. Screen readers announce each move.

## Crop or Straighten?

Crop keeps a rectangle as it is. In a photo taken at an angle, the document looks like a trapezoid, and no rectangle fits it. Use [Straighten](./straighten) for those: it moves each corner on its own and flattens the page.

## From code

Crop is in the edit bar by default, with the id `'crop'` in [`tools`](../../reference/options#tools). With `toolbar: false`, open it with [`openTool()`](../../reference/methods#opentool), and close it with [`confirmTool()`](../../reference/methods#confirmtool) or [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('crop')

// Later, from a button of your own
pic.confirmTool()
```
