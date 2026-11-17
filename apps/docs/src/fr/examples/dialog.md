---
title: Modifier dans une boîte de dialogue
description: Un exemple complet qui ouvre PaperPic dans une boîte de dialogue pour modifier une photo, et la ferme quand l’utilisateur applique ou annule les changements, en JavaScript, Vue et React.
---

# Modifier dans une boîte de dialogue

Beaucoup d’applications modifient un document dans une boîte de dialogue au-dessus de la page, par exemple depuis une liste de pièces jointes. Cet exemple ouvre la visionneuse dans un `<dialog>`, lance le mode d’édition, et ferme la boîte de dialogue quand l’utilisateur applique les changements ou les annule.

`upload` est la fonction de l’exemple [Envoyer à un serveur](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Modifier la photo</button>
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
  alt: 'Un ticket de caisse',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Une photo encore en chargement lance la modification dès qu’elle est affichée
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Appliquer ou Annuler termine la modification, et la boîte de dialogue se ferme avec elle
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Pendant la modification, Échap va à la visionneuse, qui demande avant d’abandonner les changements
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

// Une photo encore en chargement lance la modification dès qu’elle est affichée
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Appliquer ou Annuler termine la modification, et la boîte de dialogue se ferme avec elle
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Pendant la modification, Échap va à la visionneuse, qui demande avant d’abandonner les changements
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Modifier la photo
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Un ticket de caisse"
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

  // Une photo encore en chargement lance la modification dès qu’elle est affichée
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Appliquer ou Annuler termine la modification, et la boîte de dialogue se ferme avec elle
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Pendant la modification, Échap va à la visionneuse, qui demande avant d’abandonner les changements
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Modifier la photo</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Un ticket de caisse"
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

## Remarques

- La visionneuse peut se trouver dans la boîte de dialogue fermée. Elle n’a alors pas de taille, et adapte l’image dès que la boîte de dialogue s’ouvre.
- Ouvrir la boîte de dialogue lance le mode d’édition. Si la photo est encore en chargement, c’est l’événement `load` qui le lance.
- Appliquer et Annuler terminent la modification, et le [`change`](../reference/events#change) qui suit ferme la boîte de dialogue. Si Appliquer échoue, la modification reste ouverte, et la boîte de dialogue aussi.
- Chaque ouverture modifie l’image affichée, qui après un Appliquer est le résultat. Pour repartir de l’original à chaque fois, appelez [`reload()`](../reference/methods#reload) avant `edit()`.
