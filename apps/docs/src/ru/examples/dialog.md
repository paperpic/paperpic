---
title: Редактирование в диалоге
description: Полный пример, который открывает PaperPic в диалоге для правки фото и закрывает диалог, когда пользователь применяет или отменяет изменения, на JavaScript, Vue и React.
---

# Редактирование в диалоге

Многие приложения редактируют документ в диалоге поверх страницы, например из списка вложений. Этот пример открывает просмотрщик в `<dialog>`, включает режим редактирования и закрывает диалог, когда пользователь применяет изменения или отменяет их.

`upload` — функция из примера [Загрузка на сервер](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Редактировать фото</button>
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
  alt: 'Кассовый чек',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Фото, которое ещё загружается, начинает редактирование, как только появляется на экране
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Применение или отмена завершают редактирование, и диалог закрывается вместе с ним
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Во время редактирования Esc уходит в просмотрщик, который спрашивает перед тем, как отбросить изменения
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

// Фото, которое ещё загружается, начинает редактирование, как только появляется на экране
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Применение или отмена завершают редактирование, и диалог закрывается вместе с ним
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Во время редактирования Esc уходит в просмотрщик, который спрашивает перед тем, как отбросить изменения
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Редактировать фото
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Кассовый чек"
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

  // Фото, которое ещё загружается, начинает редактирование, как только появляется на экране
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Применение или отмена завершают редактирование, и диалог закрывается вместе с ним
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Во время редактирования Esc уходит в просмотрщик, который спрашивает перед тем, как отбросить изменения
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Редактировать фото</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Кассовый чек"
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

## Примечания

- Просмотрщик может находиться в закрытом диалоге. Тогда у него нет размера, и он подгоняет изображение, как только диалог открывается.
- Открытие диалога включает режим редактирования. Если фото ещё загружается, его включает событие `load`.
- Применение и отмена завершают редактирование, и следующий [`change`](../reference/events#change) закрывает диалог. Если применение не удалось, редактирование остаётся открытым, а с ним и диалог.
- Каждое открытие редактирует изображение на экране, а после применения это результат. Чтобы каждый раз начинать с оригинала, вызывайте [`reload()`](../reference/methods#reload) перед `edit()`.
