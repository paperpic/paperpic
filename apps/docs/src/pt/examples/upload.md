---
title: Enviar para um servidor
description: Um exemplo completo que envia ao seu servidor a imagem editada no PaperPic e avisa o usuário se ela foi salva, em JavaScript, Vue e React.
---

# Enviar para um servidor

O visualizador mostra o resultado do Aplicar na hora, mas salvá-lo é tarefa do seu app. Este exemplo envia a imagem editada para o seu servidor e conta ao usuário como foi.

Esta função envia a imagem como arquivo num formulário, e falha quando o servidor não a aceita:

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

O visualizador a chama no Aplicar, e uma linha de status informa o resultado:

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: 'Fatura 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = 'Salvando…'
  try {
    await upload(blob, type)
    status.textContent = 'Salvo'
  }
  catch {
    status.textContent = 'Não foi possível salvar o documento'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = 'Salvando…'
  try {
    await upload(blob, type)
    status.value = 'Salvo'
  }
  catch {
    status.value = 'Não foi possível salvar o documento'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Fatura 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('Salvando…')
    try {
      await upload(blob, type)
      setStatus('Salvo')
    }
    catch {
      setStatus('Não foi possível salvar o documento')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="Fatura 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## Observações

- `role="status"` faz os leitores de tela anunciarem o resultado do envio.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantém o arquivo pequeno. Os documentos continuam legíveis com 3000 pixels no lado mais longo.
- Depois do Aplicar, o histórico fica vazio, então o usuário não pode desfazer até a imagem anterior. Para oferecer um botão de tentar de novo, guarde o último `blob` e `type` e chame `upload` de novo.
- O servidor recebe PNG para um documento limpo, e senão o formato da imagem original. Veja [Salvar o resultado](../guide/saving) para escolher outro.
