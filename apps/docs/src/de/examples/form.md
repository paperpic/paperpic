---
title: Mit einem Formular senden
description: Ein vollständiges Beispiel, bei dem das Foto eines Belegs in einem Formularfeld liegt, der Nutzer es in PaperPic bearbeitet und das Formular das bearbeitete Bild ohne eigenen Code sendet, in JavaScript, Vue und React.
---

# Mit einem Formular senden

Manche Apps senden Dokumente mit einem einfachen Formular, etwa eine Ausgabe mit ihrem Beleg, und haben keinen eigenen Code zum Hochladen einer Datei. Dieses Beispiel lässt das Foto im Dateifeld des Formulars und legt das bearbeitete Bild beim Übernehmen wieder in dieses Feld, sodass das Formular es wie jede Datei sendet.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Betrag
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Beleg
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Senden</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Der Beleg, den du angehängt hast',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// Das Formular sendet das bearbeitete Bild statt des Fotos
pic.on('apply', ({ blob, type }) => {
  const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  input.files = files.files
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const input = useTemplateRef('input')
const photo = shallowRef<File>()

function choose() {
  photo.value = input.value?.files?.[0]
}

// Das Formular sendet das bearbeitete Bild statt des Fotos
function applied({ blob, type }: ExportedImage) {
  const field = input.value
  if (!field) {
    return
  }
  const name = field.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
  const files = new DataTransfer()
  files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
  field.files = files.files
}
</script>

<template>
  <form action="/api/expenses" method="post" enctype="multipart/form-data">
    <label>
      Betrag
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Beleg
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="Der Beleg, den du angehängt hast" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Senden
    </button>
  </form>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function ExpenseForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<File>()

  // Das Formular sendet das bearbeitete Bild statt des Fotos
  function applied({ blob, type }: ExportedImage) {
    const input = inputRef.current
    if (!input) {
      return
    }
    const name = input.files?.[0]?.name.replace(/\.\w+$/, '') ?? 'receipt'
    const files = new DataTransfer()
    files.items.add(new File([blob], `${name}.${type.split('/')[1]}`, { type }))
    input.files = files.files
  }

  return (
    <form action="/api/expenses" method="post" encType="multipart/form-data">
      <label>
        Betrag
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Beleg
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="Der Beleg, den du angehängt hast" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Senden</button>
    </form>
  )
}
```

:::

## Hinweise

- Übernehmen legt das bearbeitete Bild mit einem [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer) in das Dateifeld, sodass das Formular es unter demselben Namen sendet. Vor dem ersten Übernehmen sendet das Formular das Foto so, wie der Nutzer es gewählt hat.
- Ändert Code die Dateien des Felds, löst das sein Ereignis `change` nicht aus, also zeigt der Viewer weiter das Ergebnis.
- Die Datei behält den Namen des Fotos mit der Endung des Ergebnisses, etwa `receipt.png` nach Bereinigen in Schwarzweiß.
- Die Schaltflächen des Viewers senden das Formular nie ab.
- [`maxOutputSize`](../reference/options#maxoutputsize) hält das Formular leicht. Handyfotos haben 12 Megapixel oder mehr, und Dokumente bleiben bei 3000 Pixeln auf der längsten Seite lesbar.
