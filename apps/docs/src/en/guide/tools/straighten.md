---
title: Straighten
description: How the Straighten tool of PaperPic turns a photo of a document taken at an angle into a flat page, how it estimates the proportions and when to set aspectRatio, with a live demo.
---

# Straighten

A document photographed at an angle looks like a trapezoid: the far edge is shorter and the text leans. Straighten turns it back into a flat, rectangular page, as if it had been scanned. Its id in the API is `perspective`.

<Demo src="/samples/receipt.jpg" alt="A receipt" :tools="['perspective']" />

## Use it

1. Press Edit, then Straighten. A handle appears for each corner.
2. Drag each handle onto a corner of the document. Zoom in to place them precisely.
3. Press Done, or `Enter`. The viewer shows the page flat, cut to the four corners.

The handles work as in [Crop](./crop): a magnifier on touch screens, and Tab and the arrow keys on the keyboard. The four corners always keep a convex shape, so the page can always be flattened.

## Proportions

A photo does not tell the real shape of the page, so Straighten estimates its proportions from where the corners sit in the photo. The estimate suits photos taken from a normal distance, but it cannot be exact.

The estimate uses the original photo, even after a crop or a rotation in the same edit. Once the user applies, the result counts as the new photo, so straighten before applying.

When you know the document, set [`aspectRatio`](../../reference/options#aspectratio) to its width divided by its height, and the result takes those proportions:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Document                  | `aspectRatio`  |
| ------------------------- | -------------- |
| A4 sheet, portrait        | `210 / 297`    |
| US Letter sheet, portrait | `8.5 / 11`     |
| ID card, landscape        | `85.6 / 53.98` |

For a sheet in landscape, swap the numbers, such as `297 / 210`.

## Corners cut off by the photo

Sometimes a corner of the document falls outside the photo. The handles stay inside the image, so place that handle on the border of the photo, along the edge of the document that keeps the content. The last rows lean slightly and the estimated proportions suffer, which [`aspectRatio`](../../reference/options#aspectratio) can fix.

The [playground](../../playground) has a sample receipt with a cut-off corner to try it.

## From code

Straighten opens with [`openTool('perspective')`](../../reference/methods#opentool) and closes with [`confirmTool()`](../../reference/methods#confirmtool) or [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')

// Later, from a button of your own
pic.confirmTool()
```
