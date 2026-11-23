<p align="center">
<img src="apps/docs/src/public/logo.png" alt="PaperPic" width="160">
<br>
Clean, readable document images, right in the browser.<br>
Straighten, crop and clean up a phone photo, a scan or any image with text.
<br><br>
<a href="https://paperpic.dev"><strong>Docs</strong></a> · <a href="https://paperpic.dev/playground"><strong>Playground</strong></a>
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@paperpic/core"><img src="https://img.shields.io/npm/v/@paperpic/core" alt="npm version"></a>
<a href="https://github.com/paperpic/paperpic/actions/workflows/ci.yml"><img src="https://github.com/paperpic/paperpic/actions/workflows/ci.yml/badge.svg?branch=development" alt="CI"></a>
<a href="./LICENSE"><img src="https://img.shields.io/github/license/paperpic/paperpic" alt="License: MIT"></a>
<a href="https://github.com/paperpic/paperpic/stargazers"><img src="https://img.shields.io/github/stars/paperpic/paperpic?style=social" alt="GitHub stars"></a>
</p>

![A photo of a receipt taken at an angle, next to the straight black and white document that PaperPic made from it](apps/docs/src/public/og-image.jpg)

## Features

- 🔒 **Nothing leaves the browser**: no server and no requests of its own, so the image stays on the device until your code sends it
- 🔍 **Viewer**: zoom with the buttons, the mouse wheel or a trackpad, pan, and fit to width or height
- ✂️ **Crop** with draggable corners and a magnifier for touch screens
- 📐 **Straighten** photos taken at an angle: drag four corners and get a flat page, with its proportions estimated or those of A4, Letter or a card
- 🔄 **Rotate** in 90° steps, and **flip**
- ☀️ **Brightness and contrast** with a live ruler
- 🧼 **Clean up** into gray, or into crisp black & white without shadows, with an adjustable sensitivity
- ⬛ **Redact** an account number or a signature with solid black or white, written into the pixels of the result
- ↩️ **Undo and redo** every edit until you apply, then get the result as a `Blob`
- 💾 **Download** the image on display with an optional button
- ⚡ **Off the main thread**: image processing runs in a Web Worker
- ⌨️ **Keyboard and screen readers**: shortcuts to zoom, pan, undo and apply, corner handles that move with the arrow keys, and announcements of what changes
- 🌗 **Dark mode** that follows the `color-scheme` of your page, and CSS tokens for your own theme
- 🏷️ **Custom labels and icons**: replace any text or icon in the interface
- 📦 **No runtime dependencies** in the core
- 🧩 **Framework agnostic**, with thin wrappers for Vue and React

![The PaperPic viewer showing a photo of a receipt, with its toolbar to edit, zoom, fit and download](.github/assets/viewer.jpg)

## Quick start

```sh
npm install @paperpic/core
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'A receipt',
})

pic.on('apply', ({ blob }) => upload(blob))
```

The viewer fills its container, so give `#viewer` a height. With Vue or React, use [`@paperpic/vue`](packages/vue) or [`@paperpic/react`](packages/react) instead. The [docs](https://paperpic.dev/reference/options) list every option, method and event.

PaperPic supports the browsers of [Baseline Widely Available](https://web.dev/baseline): Chrome and Edge 124, Firefox 125 and Safari 17.5 or newer.

### With an AI coding agent

Install the PaperPic skill, so that Claude Code, Cursor, Copilot and other agents set PaperPic up the right way:

```sh
npx skills add paperpic/paperpic
```

Agents can also read the docs from [`llms-full.txt`](https://paperpic.dev/llms-full.txt) or through [Context7](https://context7.com/paperpic/paperpic).

## Packages

| Package                             | Description                                                  |
| ----------------------------------- | ------------------------------------------------------------ |
| [`@paperpic/core`](packages/core)   | The viewer and editor, for plain JavaScript or any framework |
| [`@paperpic/vue`](packages/vue)     | Component for Vue 3.5 or newer                               |
| [`@paperpic/react`](packages/react) | Component for React 19 or newer                              |

The three packages share one version. Until 1.0, a minor version can change the API.

## Development

Requires Node.js 26 and pnpm 12.

```sh
pnpm install
pnpm dev         # vanilla playground with hot reload
pnpm dev:vue     # Vue playground with hot reload
pnpm dev:react   # React playground with hot reload
pnpm dev:docs    # docs site
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e    # smoke tests in Chromium, Firefox and WebKit
```

The [contributing guide](.github/CONTRIBUTING.md#scripts) lists every script.

## Contributing

Contributions are welcome. Read the [contributing guide](.github/CONTRIBUTING.md) before opening a pull request, and follow the [code of conduct](.github/CODE_OF_CONDUCT.md).

Pull requests go to `development`. `main` only receives releases.

## License

[MIT](./LICENSE)
