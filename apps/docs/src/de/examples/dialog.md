---
title: In einem Dialog bearbeiten
description: Ein vollständiges Beispiel, das PaperPic in einem Dialog öffnet, um ein Foto zu bearbeiten, und den Dialog schließt, wenn der Nutzer die Änderungen übernimmt oder abbricht, in JavaScript, Vue und React.
---

# In einem Dialog bearbeiten

Viele Apps bearbeiten ein Dokument in einem Dialog über der Seite, etwa aus einer Liste von Anhängen. Dieses Beispiel öffnet den Viewer in einem `<dialog>`, startet den Bearbeitungsmodus und schließt den Dialog, wenn der Nutzer die Änderungen übernimmt oder abbricht.

`upload` ist die Funktion aus [Auf einen Server hochladen](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Foto bearbeiten</button>
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
  alt: 'Ein Kassenbon',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Ein Foto, das noch lädt, startet die Bearbeitung, sobald es angezeigt wird
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Übernehmen oder Abbrechen beendet die Bearbeitung, und der Dialog schließt sich mit ihr
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Während der Bearbeitung geht Esc an den Viewer, der vor dem Verwerfen der Änderungen nachfragt
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

// Ein Foto, das noch lädt, startet die Bearbeitung, sobald es angezeigt wird
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Übernehmen oder Abbrechen beendet die Bearbeitung, und der Dialog schließt sich mit ihr
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Während der Bearbeitung geht Esc an den Viewer, der vor dem Verwerfen der Änderungen nachfragt
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Foto bearbeiten
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Ein Kassenbon"
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

  // Ein Foto, das noch lädt, startet die Bearbeitung, sobald es angezeigt wird
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Übernehmen oder Abbrechen beendet die Bearbeitung, und der Dialog schließt sich mit ihr
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Während der Bearbeitung geht Esc an den Viewer, der vor dem Verwerfen der Änderungen nachfragt
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Foto bearbeiten</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Ein Kassenbon"
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

## Hinweise

- Der Viewer kann im Dialog sein, während dieser geschlossen ist. Dann hat er keine Größe, und er passt das Bild ein, sobald sich der Dialog öffnet.
- Das Öffnen des Dialogs startet den Bearbeitungsmodus. Lädt das Foto noch, startet ihn stattdessen das Ereignis `load`.
- Übernehmen und Abbrechen beenden die Bearbeitung, und das folgende [`change`](../reference/events#change) schließt den Dialog. Schlägt Übernehmen fehl, bleiben die Bearbeitung und der Dialog offen.
- Jedes Öffnen bearbeitet das angezeigte Bild, nach einem Übernehmen also das Ergebnis. Um jedes Mal vom Original auszugehen, rufe [`reload()`](../reference/methods#reload) vor `edit()` auf.
