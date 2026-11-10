# @paperpic/core

Framework-agnostic document image viewer and editor, for use with plain JavaScript or through a PaperPic wrapper such as [`@paperpic/vue`](https://www.npmjs.com/package/@paperpic/vue) or [`@paperpic/react`](https://www.npmjs.com/package/@paperpic/react).

## Installation

```sh
pnpm add @paperpic/core
```

## Usage

The viewer fills its container, so give the container a height:

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: 'A receipt',
})

pic.on('apply', ({ blob }) => upload(blob))
```

The pencil opens the edit mode. When the user applies the changes, the result replaces the image on display and the `apply` event carries it. With `editable: false` it is a read-only viewer.

## Documentation

[paperpic.dev](https://paperpic.dev) has the [guide](https://paperpic.dev/guide/introduction), every [option](https://paperpic.dev/reference/options), [method](https://paperpic.dev/reference/methods) and [event](https://paperpic.dev/reference/events), and a [playground](https://paperpic.dev/playground).
