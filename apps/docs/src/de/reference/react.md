---
title: React
description: Wie die PaperPic-Komponente für React die Optionen, Ereignisse und Methoden des Kerns auf Props, Callback-Props und eine Ref abbildet.
---

# React

`@paperpic/react` verpackt den Viewer in eine Komponente für React 19 oder neuer. Die Optionen sind Props, die Ereignisse sind Callback-Props, und die Methoden liegen auf dem Viewer, den `ref` bekommt.

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // Sende das bearbeitete Bild an deinen Server
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" onApply={upload} />
    </div>
  )
}
```

Die Komponente füllt ihr Elternelement aus, gib diesem also eine Höhe.

## Props

Jede [Option](./options) ist eine Prop mit demselben Namen, etwa `editable={false}` oder `aspectRatio={210 / 297}`. Zwei weitere Props gestalten das Element, das den Viewer enthält:

| Prop        | Typ             | Beschreibung                          |
| ----------- | --------------- | ------------------------------------- |
| `className` | `string`        | Klassen zusätzlich zu `paperpic-host` |
| `style`     | `CSSProperties` | Inline-Styles                         |

Objekte und Arrays wie `labels` oder `tools` erreichen den Viewer erneut, wann immer sie neu sind. Definiere sie außerhalb der Komponente oder mit `useMemo`.

## Ereignisse

| Prop         | Daten                                          |
| ------------ | ---------------------------------------------- |
| `onApply`    | [`ExportedImage`](./types#exportedimage)       |
| `onChange`   | [`PaperPicState`](./state)                     |
| `onDownload` | [`PaperPicDownload`](./types#paperpicdownload) |
| `onError`    | `{ error }`                                    |
| `onLoad`     | [`Size`](./types#size)                         |

[Ereignisse](./events) beschreibt jedes davon. Eine neue Funktion erstellt den Viewer nicht neu, Inline-Funktionen sind also in Ordnung. Geänderte Props rufen nie `onChange` auf.

## Methoden

`ref` bekommt den Viewer, vom Typ [`PaperPicInstance`](./types#paperpicinstance), mit allen [Methoden](./methods). Bis die Komponente gemountet ist, ist er `null`:

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Vergrößern</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

Derselbe `src` ein zweites Mal lädt das Bild nicht neu, es behält also das Ergebnis einer Bearbeitung. Um das Original zurückzuholen, rufe `picRef.current.reload()` auf.

## Typen {#types}

`@paperpic/react` exportiert alle Typen von `@paperpic/core`, du musst es also nicht installieren: [Typen](./types) zeigt jeden einzelnen. Außerdem exportiert es die Typen der Komponente: [`PaperPicProps`](./types#paperpicprops) mit ihren Props und [`PaperPicInstance`](./types#paperpicinstance), den Viewer, den `ref` erhält.

## Serverseitiges Rendern

Die Komponente ist mit `'use client'` markiert. Beim serverseitigen Rendern, etwa in Next.js, rendert sie auf dem Server ein leeres Element und erstellt den Viewer im Browser.
