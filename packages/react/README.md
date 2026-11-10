# @paperpic/react

React components to view and edit document images with PaperPic.

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
