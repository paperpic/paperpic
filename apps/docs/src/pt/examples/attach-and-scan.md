---
title: Anexar e digitalizar
description: Um exemplo completo em que o usuário fotografa um documento ou escolhe um arquivo, endireita e limpa no PaperPic e envia o resultado ao seu servidor, em JavaScript, Vue e React.
---

# Anexar e digitalizar

A maioria dos apps que recebem documentos pede uma foto ao usuário, como um recibo para uma despesa ou um formulário assinado. Este exemplo deixa o usuário tirar a foto ou escolher um arquivo, editá-lo no PaperPic e enviar o resultado ao seu servidor.

`upload` é a função de [Enviar para um servidor](./upload), que envia a imagem e falha quando o servidor não a aceita.

:::tabs key:framework
== JavaScript

```html
<label>
  Foto do documento
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
  alt: 'O documento que você anexou',
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

// A edição começa assim que a foto aparece na tela
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = 'Este arquivo não é uma imagem que o navegador consiga abrir'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Enviando…'
  try {
    await upload(blob, type)
    status.textContent = 'Enviado'
  }
  catch {
    status.textContent = 'Não foi possível enviar o documento'
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
    status.value = 'Este arquivo não é uma imagem que o navegador consiga abrir'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = 'Enviando…'
  try {
    await upload(blob, type)
    status.value = 'Enviado'
  }
  catch {
    status.value = 'Não foi possível enviar o documento'
  }
}
</script>

<template>
  <label>
    Foto do documento
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="O documento que você anexou"
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
      setStatus('Este arquivo não é uma imagem que o navegador consiga abrir')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('Enviando…')
    try {
      await upload(blob, type)
      setStatus('Enviado')
    }
    catch {
      setStatus('Não foi possível enviar o documento')
    }
  }

  return (
    <>
      <label>
        Foto do documento
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target)} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="O documento que você anexou"
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

## Observações

- `capture="environment"` abre a câmera traseira nos celulares, e os computadores o ignoram. Sem ele, os celulares oferecem a câmera e a galeria, o que serve para documentos que o usuário já tem.
- Esvaziar o campo depois de cada escolha permite escolher a mesma foto de novo, por exemplo para recomeçar depois do Aplicar.
- O visualizador abre o modo de edição assim que a foto carrega, então o usuário vai direto para Endireitar ou Limpar. Tire o listener de `load` para mostrar a foto primeiro.
- `phase: 'load'` separa um arquivo que o navegador não consegue abrir, como uma foto HEIC fora do Safari, de uma edição que falhou. [Carregar imagens](../guide/loading#formats) lista os formatos.
- A foto fica no navegador até Aplicar chamar `upload`. O PaperPic não envia nada por conta própria.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantém o envio pequeno. Fotos de celular têm 12 megapixels ou mais, e documentos continuam legíveis com 3000 pixels no lado maior.
