---
title: Redact
description: How the Redact tool of PaperPic covers part of a photo with solid black or white, such as an account number or a signature, so the result no longer holds it.
---

# Redact

A photo of a document can show more than it should: an account number, a signature, a face in the background. Redact covers a rectangle, level or leaning, with solid black or white, and the result no longer holds what was under it.

<Demo src="/samples/receipt.jpg" alt="A receipt" :tools="['redact']" />

## Use it

1. Press Edit, then Redact. A band appears across the middle of the image, with a handle at each corner.
2. Draw the area over what to hide: drag from one corner of it to the opposite one, anywhere on the image, the band included. Then drag the area to move it, turn it by the handle above it, so it leans with a line of text, and drag its corners to resize it. The area shows its color, still see-through, so you can place it over the right words.
3. Choose Black or White in the panel.
4. Press Done, or `Enter`, to add the area to the edits. Cancel this tool, or `Esc`, closes Redact without changing anything.

You can only draw until you place the area. Once you draw, move, turn or resize it, a drag on the rest of the image pans again, so nothing replaces the area by accident. Before that, pan a zoomed image with two fingers, or with the arrow keys while the focus is on the image. Without dragging, the band is the area: move it with the keyboard, or press it and then tap where it goes.

Each Done adds one area, so open Redact again to cover another part. Undo removes the last area, and the color stays for the next one. The corner handles work as in [Crop](./crop): drag them, press one and then tap where it goes, or move them with the keyboard. On the handle above the area, the arrow keys turn it 1 degree, or 10 with Shift. Dragged, it snaps to level.

## What it guarantees {#guarantees}

- The areas are covered after every other edit, so Adjust and Clean up never wash out their black or white.
- An area follows the edits after it: a turn, a flip or a crop moves it with the image, and Straighten bends it with the page.
- It covers every pixel that its edges touch, even in part, and it is opaque in a transparent PNG too.
- Apply writes solid pixels into the result, so the file keeps nothing of what they cover.

Until Apply, the viewer keeps the source, so Undo brings back what an area covers. Share the result of Apply, never the source.

## From code

Redact is in the edit bar by default, with the id `'redact'` in [`tools`](../../reference/options#tools). With `toolbar: false`, open it with [`openTool()`](../../reference/methods#opentool), choose the color with [`setRedaction()`](../../reference/methods#setredaction), and close it with [`confirmTool()`](../../reference/methods#confirmtool) or [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Later, from a button of your own
pic.confirmTool()
```

The `redaction` of the [state](../../reference/state) holds the color in use.
