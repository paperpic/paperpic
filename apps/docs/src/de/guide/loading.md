---
title: Bilder laden
description: Wie du PaperPic ein Bild gibst, aus einer URL, einer Datei, die der Nutzer wählt, oder einem Blob, den du abrufst, welche Formate es öffnet und wie dein Code erfährt, dass das Bild geladen oder fehlgeschlagen ist.
---

# Bilder laden

PaperPic zeigt das Bild, das du in `src` übergibst. Diese Seite erklärt, woher dieses Bild kommen kann, welche Formate sich öffnen und wie dein Code erfährt, dass das Bild bereit oder fehlgeschlagen ist.

## Woher das Bild kommt

`src` nimmt eines von drei Dingen an:

- **Eine URL vom selben Ursprung wie deine Seite**, etwa `/documents/42.jpg`.
- **Eine `File`**, die der Nutzer mit `<input type="file">` wählt. [Anhängen und scannen](../examples/attach-and-scan) zeigt den ganzen Ablauf, von der Kamera bis zum Upload.
- **Ein `Blob`**, den dein Code hat, etwa der Body einer Antwort.

Für eine `File` oder einen `Blob` erstellt PaperPic die `blob:`-URL, die es braucht, und gibt sie frei, wenn sich das Bild ändert oder der Viewer zerstört wird.

## Bilder von einem anderen Ursprung oder hinter einer Anmeldung {#fetch}

PaperPic liest die Pixel des Bildes, um es zu bearbeiten. Browser erlauben das bei einem Bild von einem anderen Ursprung nur, wenn es mit CORS ankommt, was PaperPic nicht anfordert. Ein solches Bild wird angezeigt, aber das Bearbeiten schlägt fehl: Ein [`error`](../reference/events#error) meldet es, sobald eine Änderung seine Pixel braucht, oder beim Übernehmen.

Ruf das Bild selbst ab und übergib den `Blob` als `src`. Das deckt auch Bilder hinter einer Anmeldung ab, weil deine Anfrage die Cookies des Nutzers mitschickt:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

Der andere Server muss deinen Ursprung per CORS erlauben, wie bei jedem `fetch` von der Seite.

## Formate {#formats}

PaperPic öffnet jedes Format, das der Browser in einem `<img>` anzeigt:

- **JPEG, PNG, WebP und AVIF** öffnen sich in jedem [unterstützten Browser](./performance#browser-support).
- **SVG** öffnet sich, wenn die Datei die Attribute `width` und `height` hat. Ohne sie hat sie keine Größe, und das Laden schlägt fehl.
- **HEIC**, das Format von iPhone-Fotos, öffnet sich nur in Safari. Wählt ein iPhone-Nutzer ein Foto mit `<input type="file" accept="image/*">`, gibt iOS der Seite meist eine JPEG-Kopie. Eine HEIC-Datei, die auf anderem Weg in einen anderen Browser gelangt, lädt nicht.

Smartphones speichern ein Foto oft seitlich, mit einem EXIF-Tag, das sagt, wie es zu drehen ist. PaperPic zeigt das Foto so, wie das Tag sagt, wie ein `<img>` es tut, und das übernommene Ergebnis ist aufrecht.

## Wissen, wann es lädt oder fehlschlägt

Das Ereignis [`load`](../reference/events#load) meldet, dass das Bild angezeigt wird, mit seiner Größe. Kann das Bild nicht laden, weil es fehlt, kein Bild ist oder der Browser es nicht dekodieren kann, zeigt der Viewer eine Meldung, und das Ereignis [`error`](../reference/events#error) trägt `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Rechnung 42' })

pic.on('load', ({ width, height }) => {
  console.log(`Das Bild hat ${width}×${height} Pixel`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`Das Bild hat ${width}×${height} Pixel`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Rechnung 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`Das Bild hat ${width}×${height} Pixel`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Rechnung 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

`load` wird bei jedem Laden eines `src` ausgelöst, auch mit [`reload()`](../reference/methods#reload), aber nicht nach dem Übernehmen: Das Ergebnis kommt mit dem Ereignis [`apply`](../reference/events#apply).

Der `status` von [`getState()`](../reference/state) gibt jederzeit dieselbe Antwort: `'empty'`, `'loading'`, `'ready'` oder `'error'`.

## Das Bild wechseln oder neu laden

- **Ein neues `src`** lädt das neue Bild. Während der Nutzer bearbeitet, verwirft es die Bearbeitungen.
- **Dasselbe `src`** tut nichts, sodass das übernommene Ergebnis angezeigt bleibt.
- **[`reload()`](../reference/methods#reload)** lädt das aktuelle `src` erneut, was nach dem Übernehmen das Original zurückbringt. Während der Nutzer bearbeitet, verwirft es auch die Änderungen.
