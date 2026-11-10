---
title: Erste Schritte
description: Installiere PaperPic für JavaScript, Vue oder React, zeige dein erstes Dokumentbild an und erhalte das bearbeitete Bild zurück.
---

# Erste Schritte

Diese Seite führt dich von der Installation von PaperPic bis zum Anzeigen eines Bildes und zum bearbeiteten Ergebnis. Wähle dein Framework in einem beliebigen Beispiel, und die übrigen Beispiele der Website folgen.

## Installation

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` benötigt Vue 3.5 oder neuer.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` benötigt React 19 oder neuer.

:::

## Ein Bild anzeigen

Der Viewer füllt seinen Container aus, gib dem Container also eine Höhe. Importiere das Stylesheet einmal in deiner App.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: 'Ein Kassenbon',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" />
    </div>
  )
}
```

:::

`src` nimmt eine URL vom selben Ursprung wie deine Seite, oder eine `File`, die der Nutzer auswählt, etwa über ein `<input type="file">`. `alt` beschreibt das Bild für Screenreader.

## Das bearbeitete Bild erhalten

Der Stift in der Werkzeugleiste startet den Bearbeitungsmodus. Wenn der Nutzer die Änderungen übernimmt, ersetzt das Ergebnis das angezeigte Bild, und das Ereignis `apply` übergibt es deinem Code:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Ein Kassenbon" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Ein Kassenbon" onApply={({ blob }) => upload(blob)} />
```

:::

Hier steht `upload` für deinen eigenen Code, etwa:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

Der `blob` behält das Format des Quellbilds, oder ist PNG, wenn der Nutzer das Dokument bereinigt hat. Die Option [`output`](../reference/options#output) ändert es.

## Das Bild nur anzeigen

Um ein Dokument anzuzeigen, das nicht verändert werden soll, schalte die Bearbeitung mit `editable: false` aus. Die Seite [Viewer](./viewer) zeigt es in Aktion.

## Voraussetzungen

- PaperPic funktioniert in den Browsern von [Baseline Widely Available](https://web.dev/baseline).
- Die Bearbeitung läuft in einem Web Worker, den Bundler wie Vite und webpack von selbst erkennen. Kann der Worker nicht starten, läuft die Bearbeitung im Hauptthread: Sie funktioniert weiter, aber die Seite kann bei großen Bildern kurz einfrieren.
- Erlaube mit einer Content Security Policy den Worker mit `worker-src 'self'`, und erlaube `img-src blob:`, weil der Viewer angehängte Dateien und Ergebnisse über `blob:`-URLs anzeigt.
- Beim serverseitigen Rendern, etwa in Nuxt oder Next.js, rendern die Vue- und React-Komponenten auf dem Server ein leeres Element und erstellen den Viewer im Browser. Mit dem Kern erstellst du den Viewer selbst im Browser.

## Nächste Schritte

- [Viewer](./viewer): Zoom, Einpassen und schreibgeschützte Nutzung.
- [Bearbeitung](./editing): der Bearbeitungsmodus, die Werkzeuge, Rückgängig und Übernehmen.
- [Optionen](../reference/options): alles, was du einstellen kannst.
