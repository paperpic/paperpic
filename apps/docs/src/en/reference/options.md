---
title: Options
description: Every option of PaperPic, with its type, its default and what it changes, for the constructor, setOptions() and the props of the Vue and React components.
---

# Options

Options set what the viewer shows and what the user can do with it. Pass them when you create the viewer, or change them later with [`setOptions()`](./methods#setoptions). The Vue and React components take them as props with the same names.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'A receipt' })

pic.setOptions({ editable: false })
```

`setOptions()` changes only the options you pass, and `undefined` brings an option back to its default. It never emits `change`.

## Image

### `src`

- **Type:** `string | Blob`
- **Default:** none

The image to show: a URL from the same origin, or a `File` or `Blob` attached on the client.

Passing the same value again does not reload the image, so the result of an edit stays on display. Call [`reload()`](./methods#reload) to bring back the original. A new value while editing discards the edits.

### `alt`

- **Type:** `string`
- **Default:** `''`

Describes the image for screen readers. Without it, screen readers skip the image, as they skip an `<img>` with an empty `alt`.

## Interface

### `editable`

- **Type:** `boolean`
- **Default:** `true`

Whether the user can edit the image. With `false`, it is a read-only viewer, and its toolbar adds buttons to rotate the image. That rotation only changes the display. Changing this option while editing discards the edits.

### `toolbar`

- **Type:** `boolean`
- **Default:** `true`

Whether to show the built-in toolbar and edit bar. Without them, build your own controls with the [methods](./methods).

### `tools`

- **Type:** `readonly ToolId[]`
- **Default:** every tool

The tools the edit bar offers. They keep the order of this table, whatever the order of the array.

| Id              | Button                              |
| --------------- | ----------------------------------- |
| `'crop'`        | Crop                                |
| `'perspective'` | Straighten                          |
| `'rotate'`      | Rotate left                         |
| `'flip'`        | Flip                                |
| `'adjust'`      | Adjust, for brightness and contrast |
| `'threshold'`   | Clean up                            |

### `wheelZoom`

- **Type:** `boolean`
- **Default:** `true`

Whether the wheel zooms the image. Turn it off when the viewer sits in a long page, so the wheel scrolls the page.

### `download`

- **Type:** `boolean`
- **Default:** `false`

Whether the toolbar has a button that saves the image on display: the result of the last Apply, or else the source. The button is hidden while editing. The [`download`](./events#download) event lets you save the file another way.

### `labels`

- **Type:** `Partial<PaperPicLabels>`
- **Default:** the English texts

Replaces any of the texts that the component shows or announces. [Labels](./labels) lists every key.

### `icons`

- **Type:** `Partial<PaperPicIcons>`
- **Default:** the built-in icons

Replaces any of the icons with your own markup of one element, such as an `<svg>`. The markup goes into the page as HTML, so pass only markup you trust. An empty string leaves the buttons of that icon without one. [Styling](../guide/styling#icons) shows an example.

Each key names an icon, and some icons appear on two buttons:

| Key              | Button                                             |
| ---------------- | -------------------------------------------------- |
| `adjust`         | Adjust                                             |
| `apply`          | Apply, and Done in Crop and Straighten             |
| `cancel`         | Cancel, and Cancel this tool                       |
| `crop`           | Crop                                               |
| `download`       | Download                                           |
| `edit`           | Edit                                               |
| `fitHeight`      | Fit to height                                      |
| `fitWidth`       | Fit to width                                       |
| `flip`           | Flip                                               |
| `perspective`    | Straighten                                         |
| `redo`           | Redo                                               |
| `rotateDocument` | Rotate left, in the edit bar                       |
| `rotateLeft`     | Rotate left, in the toolbar of a read-only viewer  |
| `rotateRight`    | Rotate right, in the toolbar of a read-only viewer |
| `threshold`      | Clean up                                           |
| `undo`           | Undo                                               |
| `zoomIn`         | Zoom in                                            |
| `zoomOut`        | Zoom out                                           |

## Result

### `output`

- **Type:** `{ type?: string, quality?: number }`
- **Default:** the format of the source

The format of the edited image. `type` is `'image/jpeg'`, `'image/png'` or `'image/webp'`, and `quality` goes from 0 to 1 for JPEG and WebP, with `0.92` by default.

Without a `type`, a cleaned up image is PNG, because JPEG would damage its sharp edges, and any other image keeps the format of the source. A format that the browser cannot encode gives PNG.

### `maxOutputSize`

- **Type:** `number`
- **Default:** the full resolution

The longest side of the edited image, in pixels. A larger result is scaled down.

### `filename`

- **Type:** `string`
- **Default:** the name of the source

The name of the saved file. Its extension follows the format of the image, so a cleaned up `receipt.jpg` saves as `receipt.png`. When the source has no name, such as a `Blob`, the file is called `image`.

## Tools

### `aspectRatio`

- **Type:** `number`
- **Default:** estimated

The real proportions of the document, as width divided by height, such as `210 / 297` for an A4 sheet. Straighten gives its result these proportions. Without them, it estimates them from the photo.

### `softness`

- **Type:** `number`, from 0 to 1
- **Default:** `0.25`

How much gray Clean up keeps at the edges of the letters, which makes them easier to read. Use `0` for strict black and white, which gives smaller files but breaks thin strokes.
