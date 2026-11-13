---
title: React
description: How the PaperPic component for React maps the options, events and methods of the core to props, callback props and a ref.
---

# React

`@paperpic/react` wraps the viewer in a component for React 19 or newer. The options are props, the events are callback props, and the methods are on the viewer that `ref` receives.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Send the edited image to your server
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="A receipt" onApply={upload} />
    </div>
  )
}
```

The component fills its parent element, so give the parent a height.

## Props

Every [option](./options) is a prop with the same name, such as `editable={false}` or `aspectRatio={210 / 297}`. Two more props style the element that holds the viewer:

| Prop        | Type            | Description                       |
| ----------- | --------------- | --------------------------------- |
| `className` | `string`        | Classes on top of `paperpic-host` |
| `style`     | `CSSProperties` | Inline styles                     |

Objects and arrays, such as `labels` or `tools`, reach the viewer again whenever they are new. Define them outside the component, or with `useMemo`.

## Events

| Prop         | Payload                                        |
| ------------ | ---------------------------------------------- |
| `onApply`    | [`ExportedImage`](./types#exportedimage)       |
| `onChange`   | [`PaperPicState`](./state)                     |
| `onDownload` | [`PaperPicDownload`](./types#paperpicdownload) |
| `onError`    | `{ error }`                                    |
| `onLoad`     | [`Size`](./types#size)                         |

[Events](./events) describes each one. A new function does not recreate the viewer, so inline functions are fine. A change of props never calls `onChange`.

## Methods

`ref` receives the viewer, of type [`PaperPicInstance`](./types#paperpicinstance), with every [method](./methods). It is `null` until the component mounts:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Zoom in</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Passing the same `src` again does not reload the image, so it keeps the result of an edit. To bring back the original, call `picRef.current.reload()`.

## Types {#types}

`@paperpic/react` exports every type of `@paperpic/core`, so you do not need to install it: [Types](./types) shows each one. It also exports the types of the component: [`PaperPicProps`](./types#paperpicprops), with its props, and [`PaperPicInstance`](./types#paperpicinstance), the viewer that `ref` receives.

## Server-side rendering

The component is marked with `'use client'`. With server-side rendering, such as in Next.js, it renders an empty element on the server and creates the viewer in the browser.
