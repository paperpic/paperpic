---
title: Anhängen und scannen
description: Ein vollständiges Beispiel, in dem der Nutzer ein Dokument fotografiert oder eine Datei wählt, sie in PaperPic begradigt und bereinigt und das Ergebnis an deinen Server sendet, in JavaScript, Vue und React.
---

# Anhängen und scannen

Die meisten Apps, die Dokumente annehmen, bitten den Nutzer um ein Foto, etwa von einem Kassenbon für eine Spesenabrechnung oder einem unterschriebenen Formular. In diesem Beispiel macht der Nutzer das Foto oder wählt eine Datei, bearbeitet sie in PaperPic und sendet das Ergebnis an deinen Server.

`upload` ist die Funktion aus [Auf einen Server hochladen](./upload), die das Bild sendet und fehlschlägt, wenn der Server es nicht annimmt.

:::tabs key:framework
== JavaScript

```html
<label>
  Foto des Dokuments
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Das Dokument, das du angehängt hast',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// Die Bearbeitung beginnt, sobald das Foto angezeigt wird
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Diese Datei ist kein Bild, das der Browser öffnen kann'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Wird gesendet…'
  try {
    await upload(blob, type)
    status.textContent = 'Gesendet'
  }
  catch {
    status.textContent = 'Das Dokument konnte nicht gesendet werden'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = 'Diese Datei ist kein Bild, das der Browser öffnen kann'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Wird gesendet…'
  try {
    await upload(blob, type)
    status.value = 'Gesendet'
  }
  catch {
    status.value = 'Das Dokument konnte nicht gesendet werden'
  }
}
</script>

<template>
  <label>
    Foto des Dokuments
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="Das Dokument, das du angehängt hast"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ''
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('Diese Datei ist kein Bild, das der Browser öffnen kann')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Wird gesendet…')
    try {
      await upload(blob, type)
      setStatus('Gesendet')
    }
    catch {
      setStatus('Das Dokument konnte nicht gesendet werden')
    }
  }

  return (
    <>
      <label>
        Foto des Dokuments
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target)} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="Das Dokument, das du angehängt hast"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Hinweise

- `capture="environment"` öffnet auf Smartphones die Rückkamera, und Computer ignorieren es. Ohne das Attribut bieten Smartphones Kamera und Fotomediathek an, was zu Dokumenten passt, die der Nutzer schon hat.
- Das Leeren des Eingabefelds nach jeder Auswahl erlaubt es, dasselbe Foto erneut zu wählen, etwa um nach dem Übernehmen neu anzufangen.
- Der Viewer öffnet den Bearbeitungsmodus, sobald das Foto geladen ist, sodass der Nutzer direkt zu Begradigen oder Bereinigen kommt. Lass den Listener für `load` weg, um zuerst das Foto zu zeigen.
- `phase: 'load'` unterscheidet eine Datei, die der Browser nicht öffnen kann, etwa ein HEIC-Foto außerhalb von Safari, von einer fehlgeschlagenen Bearbeitung. [Bilder laden](../guide/loading#formats) listet die Formate auf.
- Das Foto bleibt im Browser, bis der Nutzer die Änderungen übernimmt und dein Code `upload` aufruft. PaperPic sendet von sich aus nichts.
- [`maxOutputSize`](../reference/options#maxoutputsize) hält den Upload klein. Smartphone-Fotos haben 12 Megapixel oder mehr, und Dokumente bleiben bei 3000 Pixeln an der längsten Seite lesbar.
