# @paperpic/core

Clean, readable document images, right in the browser. Straighten, crop and clean up a phone photo, a scan or any image with text.

**[Docs](https://paperpic.dev) · [Playground](https://paperpic.dev/playground) · [GitHub](https://github.com/paperpic/paperpic)**

![A photo of a receipt taken at an angle, next to the straight black and white document that PaperPic made from it](https://paperpic.dev/og-image.jpg)

Framework-agnostic document image viewer and editor, for use with plain JavaScript or through a PaperPic wrapper such as [`@paperpic/vue`](https://www.npmjs.com/package/@paperpic/vue) or [`@paperpic/react`](https://www.npmjs.com/package/@paperpic/react).

## Features

- **Nothing leaves the browser**: no server and no requests of its own, so the image stays on the device until your code sends it
- **Straighten** photos taken at an angle, whose document the viewer finds, to the proportions of A4, Letter or a card, **crop**, **rotate** in 90° steps and **flip**
- **Clean up** into gray, or into crisp black and white without shadows, and adjust **brightness and contrast**
- **Redact** what must not be shared with solid black or white, written into the pixels of the result
- **Undo and redo** every edit until you apply, then get the result as a `Blob`
- **Off the main thread**: image processing runs in a Web Worker
- **Keyboard and screen readers**, dark mode that follows `color-scheme`, and CSS tokens for your own theme
- **No runtime dependencies**

## Installation

```sh
pnpm add @paperpic/core
```

## Usage

The viewer fills its container, so give the container a height:

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'A receipt',
})

pic.on('apply', ({ blob }) => upload(blob))
```

The pencil opens the edit mode. When the user applies the changes, the result replaces the image on display and the `apply` event carries it. With `editable: false` it is a read-only viewer.

## Documentation

[paperpic.dev](https://paperpic.dev) has the [guide](https://paperpic.dev/guide/introduction), every [option](https://paperpic.dev/reference/options), [method](https://paperpic.dev/reference/methods) and [event](https://paperpic.dev/reference/events), and a [playground](https://paperpic.dev/playground).

The package also ships these docs in English, for the version you install, in `dist/docs`. AI coding tools can read them in `node_modules` without the network.
