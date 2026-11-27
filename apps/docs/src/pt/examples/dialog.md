---
title: Editar num diálogo
description: Um exemplo completo que abre o PaperPic num diálogo para editar uma foto, e fecha o diálogo quando o usuário aplica ou cancela as alterações, em JavaScript, Vue e React.
---

# Editar num diálogo

Muitos apps editam um documento num diálogo sobre a página, por exemplo a partir de uma lista de anexos. Este exemplo abre o visualizador num `<dialog>`, inicia o modo de edição e fecha o diálogo quando o usuário aplica as alterações ou as cancela.

`upload` é a função de [Enviar para um servidor](./upload).

:::tabs key:framework
== JavaScript

```html
<button id="open" type="button">Editar a foto</button>
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
  alt: 'Um recibo',
})
let editing = false

document.querySelector('#open')!.addEventListener('click', () => {
  dialog.showModal()
  pic.edit()
})

// Uma foto ainda carregando inicia a edição assim que aparece na tela
pic.on('load', () => {
  if (dialog.open) {
    pic.edit()
  }
})

// Aplicar ou Cancelar termina a edição, e o diálogo fecha junto
pic.on('change', ({ mode }) => {
  if (editing && mode === 'view') {
    dialog.close()
  }
  editing = mode === 'edit'
})

// Durante a edição, o Esc vai para o visualizador, que pergunta antes de descartar as alterações
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

// Uma foto ainda carregando inicia a edição assim que aparece na tela
function loaded() {
  if (dialog.value?.open) {
    pic.value?.instance?.edit()
  }
}

// Aplicar ou Cancelar termina a edição, e o diálogo fecha junto
function changed({ mode }: PaperPicState) {
  if (editing && mode === 'view') {
    dialog.value?.close()
  }
  editing = mode === 'edit'
}

// Durante a edição, o Esc vai para o visualizador, que pergunta antes de descartar as alterações
function keepEditing(event: Event) {
  if (editing) {
    event.preventDefault()
  }
}
</script>

<template>
  <button type="button" @click="open">
    Editar a foto
  </button>
  <dialog ref="dialog" @cancel="keepEditing">
    <div style="width: min(90vw, 720px); height: 70vh">
      <PaperPic
        ref="pic"
        src="/receipt.jpg"
        alt="Um recibo"
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

  // Uma foto ainda carregando inicia a edição assim que aparece na tela
  function loaded() {
    if (dialogRef.current?.open) {
      picRef.current?.edit()
    }
  }

  // Aplicar ou Cancelar termina a edição, e o diálogo fecha junto
  function changed({ mode }: PaperPicState) {
    if (editing.current && mode === 'view') {
      dialogRef.current?.close()
    }
    editing.current = mode === 'edit'
  }

  // Durante a edição, o Esc vai para o visualizador, que pergunta antes de descartar as alterações
  function keepEditing(event: SyntheticEvent<HTMLDialogElement>) {
    if (editing.current) {
      event.preventDefault()
    }
  }

  return (
    <>
      <button type="button" onClick={open}>Editar a foto</button>
      <dialog ref={dialogRef} onCancel={keepEditing}>
        <div style={{ width: 'min(90vw, 720px)', height: '70vh' }}>
          <PaperPic
            ref={picRef}
            src="/receipt.jpg"
            alt="Um recibo"
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

## Observações

- O visualizador pode ficar no diálogo enquanto ele está fechado. Nesse momento ele não tem tamanho, e encaixa a imagem assim que o diálogo abre.
- Abrir o diálogo inicia o modo de edição. Se a foto ainda estiver carregando, quem o inicia é o evento `load`.
- Os botões Aplicar e Cancelar terminam a edição, e o [`change`](../reference/events#change) seguinte fecha o diálogo. Se não for possível aplicar as alterações, a edição continua aberta, e o diálogo também.
- Cada abertura edita a imagem na tela, que é o resultado se alterações já foram aplicadas. Para começar sempre do original, chame [`reload()`](../reference/methods#reload) antes de `edit()`.
