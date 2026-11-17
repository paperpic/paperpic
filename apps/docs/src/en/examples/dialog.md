---
title: Edit in a dialog
description: A complete example that opens PaperPic in a dialog to edit a photo, and closes the dialog when the user applies or cancels the changes, in plain JavaScript, Vue and React.
---

# Edit in a dialog

Many apps edit a document in a dialog over the page, such as from a list of attachments. This example opens the viewer in a `<dialog>`, starts the edit mode, and closes the dialog when the user applies the changes or cancels them.

`upload` is the function from [Upload to a server](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Edit the photo</button>
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
  alt: 'A receipt',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// A photo still loading starts the edit once it is on display
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Apply or Cancel ends the edit, and the dialog closes with it
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// While editing, Esc goes to the viewer, which asks before discarding the changes
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

// A photo still loading starts the edit once it is on display
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Apply or Cancel ends the edit, and the dialog closes with it
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// While editing, Esc goes to the viewer, which asks before discarding the changes
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Edit the photo
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="A receipt"
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

  // A photo still loading starts the edit once it is on display
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Apply or Cancel ends the edit, and the dialog closes with it
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // While editing, Esc goes to the viewer, which asks before discarding the changes
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Edit the photo</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="A receipt"
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

## Notes

- The viewer can live in the dialog while it is closed. It has no size then, and it fits the image as soon as the dialog opens.
- Opening the dialog starts the edit mode. If the photo is still loading, the `load` event starts it instead.
- Apply and Cancel end the edit, and the [`change`](../reference/events#change) that follows closes the dialog. If Apply fails, the edit stays open, and so does the dialog.
- Each opening edits the image on display, which after an Apply is the result. To start from the original every time, call [`reload()`](../reference/methods#reload) before `edit()`.
