---
title: Auf einen Server hochladen
description: Ein vollständiges Beispiel, das das in PaperPic bearbeitete Bild an deinen Server sendet und dem Nutzer sagt, ob es gespeichert wurde, in JavaScript, Vue und React.
---

# Auf einen Server hochladen

Der Viewer zeigt das Ergebnis von Übernehmen sofort, aber das Speichern ist Sache deiner App. Dieses Beispiel sendet das bearbeitete Bild an deinen Server und sagt dem Nutzer, wie es gelaufen ist.

Diese Funktion sendet das Bild als Datei in einem Formular und schlägt fehl, wenn der Server es nicht annimmt:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

Der Viewer ruft sie beim Übernehmen auf, und eine Statuszeile meldet das Ergebnis:

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: 'Rechnung 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Wird gespeichert…'
  try {
    await upload(blob, type)
    status.textContent = 'Gespeichert'
  }
  catch {
    status.textContent = 'Das Dokument konnte nicht gespeichert werden'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = 'Wird gespeichert…'
  try {
    await upload(blob, type)
    status.value = 'Gespeichert'
  }
  catch {
    status.value = 'Das Dokument konnte nicht gespeichert werden'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Rechnung 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('Wird gespeichert…')
    try {
      await upload(blob, type)
      setStatus('Gespeichert')
    }
    catch {
      setStatus('Das Dokument konnte nicht gespeichert werden')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Rechnung 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Hinweise

- `role="status"` lässt Screenreader das Ergebnis des Hochladens ansagen.
- [`maxOutputSize`](../reference/options#maxoutputsize) hält die Datei klein. Dokumente bleiben mit 3000 Pixeln an der längsten Seite lesbar.
- Nach dem Übernehmen ist der Verlauf leer, der Nutzer kann also nicht zum alten Bild zurück. Für eine Schaltfläche zum erneuten Versuchen behalte den letzten `blob` und `type` und rufe `upload` erneut auf.
- Der Server bekommt PNG für ein bereinigtes Dokument und sonst das Format des Quellbilds. Unter [Das Ergebnis speichern](../guide/saving) wählst du ein anderes.
