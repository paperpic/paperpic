---
title: Das Ergebnis speichern
description: Wie PaperPic das bearbeitete Bild übergibt, wie du Format und Größe wählst, wie du es hochlädst und wie die Download-Schaltfläche und ihr Ereignis funktionieren.
---

# Das Ergebnis speichern

PaperPic lädt nie etwas hoch und speichert nichts. Wenn der Nutzer die Änderungen übernimmt, übergibt es das Ergebnis deinem Code, und deine App entscheidet, wohin es geht. Diese Seite zeigt, was du bekommst und wie du es speicherst.

## Das Ereignis `apply`

Beim Übernehmen berechnet PaperPic das Ergebnis und löst [`apply`](../reference/events#apply) aus, mit:

| Feld              | Typ      | Beschreibung                    |
| ----------------- | -------- | ------------------------------- |
| `blob`            | `Blob`   | Das bearbeitete Bild            |
| `type`            | `string` | Sein Format, etwa `'image/png'` |
| `width`, `height` | `number` | Seine Größe in Pixeln           |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="({ blob, type }) => upload(blob, type)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={({ blob, type }) => upload(blob, type)} />
```

:::

Nach dem Übernehmen ist das Ergebnis das angezeigte Bild, der Verlauf ist leer, und die nächste Bearbeitung beginnt beim Ergebnis. [`reload()`](../reference/methods#reload) holt den ursprünglichen `src` zurück.

## Hochladen

Sende den `blob` als Datei in einem Formular:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

Der Viewer zeigt das Ergebnis sofort, ob es deinen Server erreicht oder nicht, also sag dem Nutzer Bescheid, wenn das Hochladen fehlschlägt.

## Format und Qualität {#format}

Ohne Optionen behält das Ergebnis das Format des Quellbilds, wenn es JPEG, PNG oder WebP ist. PaperPic liest es aus der Endung der URL, etwa `.jpg`, oder aus dem Typ der `File` oder des `Blob`. Ein Dokument in Schwarzweiß ist PNG, weil JPEG Artefakte um seine scharfen Kanten erzeugen würde. Jede andere Quelle ergibt ebenfalls PNG, etwa ein GIF oder eine URL ohne Endung wie `/api/documents/42`, auch wenn sie ein JPEG liefert.

[`output`](../reference/options#output) wählt das Format und seine Qualität von 0 bis 1 für JPEG und WebP, standardmäßig 0.92:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| Format       | Geeignet für                                               |
| ------------ | ---------------------------------------------------------- |
| `image/png`  | Dokumente in Schwarzweiß und Text, verlustfrei             |
| `image/jpeg` | Fotos und farbige Dokumente, in kleinen Dateien            |
| `image/webp` | Fotos und farbige Dokumente, in kleineren Dateien als JPEG |

Ein Browser, der das gewünschte Format nicht kodieren kann, liefert PNG, also lies `type` im Ereignis.

## Größe

Das Ergebnis behält die volle Auflösung der Quelle, bei vielen Handyfotos 12 Megapixel oder mehr. [`maxOutputSize`](../reference/options#maxoutputsize) begrenzt seine längste Seite in Pixeln:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

Die Vorschau beim Bearbeiten hat höchstens etwa 2 Megapixel, `maxOutputSize` ändert also nur das Ergebnis.

Safari auf iOS begrenzt ein Canvas auf etwa 16 Megapixel, und neuere iPhones machen Fotos mit 24 Megapixeln oder mehr, also kann das Übernehmen in voller Auflösung fehlschlagen. Wenn deine Nutzer Fotos von einem iPhone bearbeiten, setze `maxOutputSize`. 3000 Pixel halten Dokumente lesbar und liegen weit unter der Grenze. [Das Übernehmen schlägt bei einem großen Foto fehl](./troubleshooting#too-large) zeigt den Fehler.

## Metadaten {#metadata}

Das übernommene Ergebnis enthält keine Metadaten. PaperPic zeichnet das Bild auf ein Canvas, also gehen die EXIF-Daten des Fotos verloren, etwa die GPS-Position, die Kamera und das Datum. Die Download-Schaltfläche speichert bis zum ersten Übernehmen das Quellbild unverändert, mit seinen Metadaten.

## Die Download-Schaltfläche {#download}

[`download: true`](../reference/options#download) fügt am Ende der Werkzeugleiste eine Schaltfläche hinzu, die das angezeigte Bild speichert: das Ergebnis des letzten Übernehmens, sonst das Quellbild, wie es ist. Während der Bearbeitung ist sie ausgeblendet, weil die Änderungen noch nicht übernommen sind. [`download()`](../reference/methods#download) tut dasselbe aus dem Code, mit oder ohne Schaltfläche. Das Kontextmenü des Browsers öffnet sich nicht über dem Viewer, daher ist diese Schaltfläche der Weg, das Bild aus ihm zu speichern.

Die Datei behält den Namen der Quelle und bekommt die Endung ihres Formats, ein `receipt.jpg` in Schwarzweiß wird also als `receipt.png` gespeichert. [`filename`](../reference/options#filename) setzt einen anderen Namen. Ganz ohne Namen, etwa bei einem `Blob`, heißt die Datei `image`. Vor dem ersten Übernehmen bekommt eine URL ohne Endung auch beim Speichern keine, weil ihr Format unbekannt ist.

Bei einem `src` von einem anderen Ursprung speichern Browser die Datei vor dem ersten Übernehmen nicht: Sie öffnen stattdessen das Bild, und der Nutzer verlässt deine Seite. Übergib das Bild als `Blob`, wie [Bilder laden](./loading#fetch) zeigt, oder speichere es selbst im Ereignis `download`.

### Auf andere Weise speichern

Das Ereignis [`download`](../reference/events#download) kommt, bevor der Browser die Datei speichert. Rufe `preventDefault()` auf, um sie auf andere Weise zu speichern, etwa über deinen Server, der die Datei benennen und prüfen kann, wer sie herunterlädt:

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
