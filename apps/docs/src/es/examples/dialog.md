---
title: Editar en un diálogo
description: Un ejemplo completo que abre PaperPic en un diálogo para editar una foto y lo cierra cuando el usuario aplica o cancela los cambios, en JavaScript, Vue y React.
---

# Editar en un diálogo

Muchas apps editan un documento en un diálogo sobre la página, por ejemplo desde una lista de adjuntos. Este ejemplo abre el visor en un `<dialog>`, empieza el modo de edición y cierra el diálogo cuando el usuario aplica los cambios o los cancela.

`upload` es la función de [Subir a un servidor](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Editar la foto</button>
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
  alt: 'Un tique',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Una foto que aún carga empieza la edición en cuanto está en pantalla
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Aplicar o Cancelar terminan la edición, y el diálogo se cierra con ella
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Durante la edición, Esc va al visor, que pregunta antes de descartar los cambios
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

// Una foto que aún carga empieza la edición en cuanto está en pantalla
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Aplicar o Cancelar terminan la edición, y el diálogo se cierra con ella
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Durante la edición, Esc va al visor, que pregunta antes de descartar los cambios
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Editar la foto
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Un tique"
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

  // Una foto que aún carga empieza la edición en cuanto está en pantalla
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Aplicar o Cancelar terminan la edición, y el diálogo se cierra con ella
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Durante la edición, Esc va al visor, que pregunta antes de descartar los cambios
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Editar la foto</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Un tique"
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

## Notas

- El visor puede estar en el diálogo mientras está cerrado. Entonces no tiene tamaño, y encaja la imagen en cuanto el diálogo se abre.
- Abrir el diálogo empieza el modo de edición. Si la foto aún está cargando, lo empieza el evento `load`.
- Los botones Aplicar y Cancelar terminan la edición, y el [`change`](../reference/events#change) que llega después cierra el diálogo. Si no se pueden aplicar los cambios, la edición sigue abierta, y el diálogo también.
- Cada vez que se abre, se edita la imagen en pantalla, que es el resultado si ya se aplicaron cambios. Para empezar siempre desde la original, llama a [`reload()`](../reference/methods#reload) antes de `edit()`.
