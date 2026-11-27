---
title: Modificare in una finestra di dialogo
description: Un esempio completo che apre PaperPic in una finestra di dialogo per modificare una foto, e la chiude quando l’utente applica o annulla i cambiamenti, in JavaScript, Vue e React.
---

# Modificare in una finestra di dialogo

Molte app modificano un documento in una finestra di dialogo sopra la pagina, ad esempio da un elenco di allegati. Questo esempio apre il visualizzatore in un `<dialog>`, avvia la modalità di modifica e chiude la finestra quando l’utente applica i cambiamenti o li annulla.

`upload` è la funzione di [Caricare su un server](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Modifica la foto</button>
<dialog id="editor">
  <div id="viewer" style="width: min(90vw, 720px); height: 70vh"></div>
</dialog>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const dialog = document.querySelector<HTMLDialogElement>('#editor')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Uno scontrino',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Una foto ancora in caricamento avvia la modifica appena è visualizzata
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Applica o Annulla chiudono la modifica, e la finestra si chiude con essa
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Durante la modifica, Esc va al visualizzatore, che chiede prima di scartare i cambiamenti
dialog.addEventListener('cancel', (event) => {
  if (editing) {
    event.preventDefault()
  }
})

pic.on('apply', ({ blob, type }) => upload(blob, type))
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const dialog = useTemplateRef('dialog')
const pic = useTemplateRef('pic')
let editing = false

function open() {
  dialog.value?.showModal()
  pic.value?.instance?.edit()
}

// Una foto ancora in caricamento avvia la modifica appena è visualizzata
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Applica o Annulla chiudono la modifica, e la finestra si chiude con essa
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Durante la modifica, Esc va al visualizzatore, che chiede prima di scartare i cambiamenti
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Modifica la foto
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Uno scontrino"
        @load="loaded"
        @change="changed"
        @apply="({ blob, type }) => upload(blob, type)"
      />
    </div>
  </dialog>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import type { SyntheticEvent } from 'react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'
import '@paperpic/react/style.css'

export function PhotoEditor() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const picRef = useRef<PaperPicInstance>(null)
  const editing = useRef(false)

  function open() {
    dialogRef.current?.showModal()
    picRef.current?.edit()
  }

  // Una foto ancora in caricamento avvia la modifica appena è visualizzata
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Applica o Annulla chiudono la modifica, e la finestra si chiude con essa
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Durante la modifica, Esc va al visualizzatore, che chiede prima di scartare i cambiamenti
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Modifica la foto</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Uno scontrino"
            onLoad={loaded}
            onChange={changed}
            onApply={({ blob, type }) => upload(blob, type)}
          />
        </div>
      </dialog>
    </>
  )
}
```

:::

## Note

- Il visualizzatore può stare nella finestra di dialogo mentre è chiusa. In quel momento non ha dimensioni, e adatta l’immagine appena la finestra si apre.
- Aprire la finestra avvia la modalità di modifica. Se la foto è ancora in caricamento, la avvia invece l’evento `load`.
- I pulsanti Applica e Annulla chiudono la modifica, e il [`change`](../reference/events#change) che segue chiude la finestra. Se l’applicazione delle modifiche fallisce, la modifica resta aperta, e la finestra anche.
- Ogni apertura modifica l’immagine visualizzata, che è il risultato se le modifiche sono già state applicate. Per ripartire ogni volta dall’originale, chiama [`reload()`](../reference/methods#reload) prima di `edit()`.
