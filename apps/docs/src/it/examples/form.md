---
title: Inviare con un modulo
description: Un esempio completo in cui la foto di uno scontrino va in un campo di un modulo, l’utente la modifica in PaperPic e il modulo invia l’immagine modificata senza codice proprio, in JavaScript, Vue e React.
---

# Inviare con un modulo

Alcune app inviano documenti con un semplice modulo, come una spesa con il suo scontrino, e non hanno codice proprio per caricare un file. Questo esempio tiene la foto nel campo file del modulo e ci rimette l’immagine modificata quando l’utente applica i cambiamenti, così il modulo la invia come qualsiasi file.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Importo
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Scontrino
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Invia</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'Lo scontrino che hai allegato',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// Il modulo invia l’immagine modificata al posto della foto
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

// Il modulo invia l’immagine modificata al posto della foto
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
      Importo
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Scontrino
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="Lo scontrino che hai allegato" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Invia
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

  // Il modulo invia l’immagine modificata al posto della foto
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
        Importo
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Scontrino
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="Lo scontrino che hai allegato" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Invia</button>
    </form>
  )
}
```

:::

## Note

- Quando si applicano le modifiche, l’esempio mette l’immagine modificata nel campo file con un [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), così il modulo la invia con lo stesso nome. Finché non si applica nulla, il modulo invia la foto così come l’utente l’ha scelta.
- Cambiare i file del campo dal codice non emette il suo evento `change`, quindi il visualizzatore continua a mostrare il risultato.
- Il file mantiene il nome della foto, con l’estensione del risultato, come `receipt.png` dopo Pulisci in bianco e nero.
- I pulsanti del visualizzatore non inviano mai il modulo.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantiene leggero il modulo. Le foto del telefono hanno 12 megapixel o più, e i documenti restano leggibili a 3000 pixel sul lato più lungo.
