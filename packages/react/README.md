# @paperpic/react

Clean, readable document images, right in the browser. Straighten, crop and clean up a phone photo, a scan or any image with text.

**[Docs](https://paperpic.dev) · [Playground](https://paperpic.dev/playground) · [GitHub](https://github.com/paperpic/paperpic)**

![A photo of a receipt taken at an angle, next to the straight black and white document that PaperPic made from it](https://paperpic.dev/og-image.jpg)

React component to view and edit document images with PaperPic.

## Features

- **Nothing leaves the browser**: no server and no requests of its own, so the image stays on the device until your code sends it
- **Straighten** photos taken at an angle, whose document the viewer finds, to the proportions of A4, Letter or a card, **crop**, **rotate** in 90° steps and **flip**
- **Clean up** into gray, or into crisp black and white without shadows, and adjust **brightness and contrast**
- **Redact** what must not be shared with solid black or white, written into the pixels of the result
- **Undo and redo** every edit until you apply, then get the result as a `Blob`
- **Off the main thread**: image processing runs in a Web Worker
- **Keyboard and screen readers**, dark mode that follows `color-scheme`, and CSS tokens for your own theme
- A thin wrapper over [`@paperpic/core`](https://www.npmjs.com/package/@paperpic/core), with props and callbacks for React

## Installation

```sh
pnpm add @paperpic/react
```

`@paperpic/react` requires React 19 or newer.

## Usage

The viewer fills its parent element, so give the parent a height:

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function save({ blob }: ExportedImage) {
  // Upload the edited image
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="A receipt" onApply={save} />
    </div>
  )
}
```

The pencil opens the edit mode. When the user applies the changes, the result replaces the image on display and `onApply` receives it. With `editable={false}` it is a read-only viewer.

## Documentation

[paperpic.dev](https://paperpic.dev) has the [guide](https://paperpic.dev/guide/introduction), the [props, callbacks and methods of the component](https://paperpic.dev/reference/react), and a [playground](https://paperpic.dev/playground).

The package also ships these docs in English, for the version you install, in `dist/docs`. AI coding tools can read them in `node_modules` without the network.
