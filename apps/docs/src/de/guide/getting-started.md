---
title: Erste Schritte
description: Installiere PaperPic für JavaScript, Vue oder React, zeige dein erstes Dokumentbild an und erhalte das bearbeitete Bild zurück.
---

# Erste Schritte

Diese Seite führt dich von der Installation von PaperPic bis zum Anzeigen eines Bildes und zum bearbeiteten Ergebnis. Wähle dein Framework in einem beliebigen Beispiel, und die übrigen Beispiele der Website folgen.

## Installation

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` benötigt Vue 3.5 oder neuer.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` benötigt React 19 oder neuer.

::::

### Ohne Bundler {#cdn}

Der Core lädt auch von einem CDN, das die Dateien des Pakets unverändert ausliefert, etwa jsDelivr. Importiere `dist/index.js` aus einem Modul-Skript und binde `dist/style.css` ein:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Ein Kassenbon' })
</script>
```

Browser starten einen Worker nur vom Ursprung der Seite, also läuft die Bearbeitung dort im Hauptthread: Sie funktioniert, aber große Fotos lassen die Seite beim Übernehmen kurz einfrieren. Liefere die Dateien von deinem eigenen Ursprung aus oder nutze einen Bundler, um den Worker zu behalten. Die Komponenten für Vue und React brauchen einen Bundler.

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` nimmt eine URL vom selben Ursprung wie deine Seite, oder eine `File`, die der Nutzer auswählt, etwa über ein `<input type="file">`. `alt` beschreibt das Bild für Screenreader. [Bilder laden](./loading) erklärt Bilder von anderen Ursprüngen, Formate und Ladefehler.

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

## Den Viewer entfernen {#destroy}

Die Komponenten für Vue und React erstellen den Viewer beim Einhängen und zerstören ihn beim Aushängen. Mit dem Core rufst du [`destroy()`](../reference/methods#destroy) auf, wenn du den Viewer von der Seite nimmst, etwa beim Wechsel der Route:

```ts
pic.destroy()
```

Er entfernt den Viewer aus seinem Container, beendet seine Listener und seinen Worker und gibt den Speicher des Bildes frei. Um ihn wieder zu zeigen, erstelle einen neuen.

## Das Bild nur anzeigen

Um ein Dokument anzuzeigen, das nicht verändert werden soll, schalte die Bearbeitung mit `editable: false` aus. Die Seite [Viewer](./viewer) zeigt es in Aktion.

## Voraussetzungen

PaperPic funktioniert in den Browsern von [Baseline Widely Available](https://web.dev/baseline). [Leistung und Kompatibilität](./performance) behandelt den Worker, die Content Security Policy, das serverseitige Rendern und große Fotos.

## Nächste Schritte

- [Bilder laden](./loading): woher das Bild kommt und welche Formate sich öffnen.
- [Viewer](./viewer): Zoom, Einpassen und schreibgeschützte Nutzung.
- [Bearbeitung](./editing): der Bearbeitungsmodus, die Werkzeuge, Rückgängig und Übernehmen.
- [Optionen](../reference/options): alles, was du einstellen kannst.
- [Fehlerbehebung](./troubleshooting): wenn der Viewer nicht aussieht oder funktioniert, wie er sollte.
