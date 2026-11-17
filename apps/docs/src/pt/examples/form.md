---
title: Enviar com um formulário
description: Um exemplo completo em que a foto de um recibo vai num campo de um formulário, o usuário a edita no PaperPic e o formulário envia a imagem editada sem código próprio, em JavaScript, Vue e React.
---

# Enviar com um formulário

Alguns apps enviam documentos com um formulário comum, como uma despesa com o seu recibo, e não têm código próprio para enviar um arquivo. Este exemplo mantém a foto no campo de arquivo do formulário e coloca a imagem editada de volta nesse campo quando o usuário aplica as alterações, então o formulário a envia como qualquer arquivo.

:::tabs key:framework
== JavaScript

```html
<form action="/api/expenses" method="post" enctype="multipart/form-data">
  <label>
    Valor
    <input name="amount" type="number" step="0.01" required />
  </label>
  <label>
    Recibo
    <input id="receipt" name="receipt" type="file" accept="image/*" required />
  </label>
  <div id="viewer" style="height: 480px"></div>
  <button type="submit">Enviar</button>
</form>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#receipt')!
const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: 'O recibo que você anexou',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    pic.setOptions({ src: file })
  }
})

// O formulário envia a imagem editada no lugar da foto
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

// O formulário envia a imagem editada no lugar da foto
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
      Valor
      <input name="amount" type="number" step="0.01" required>
    </label>
    <label>
      Recibo
      <input ref="input" name="receipt" type="file" accept="image/*" required @change="choose">
    </label>
    <div v-if="photo" style="height: 480px">
      <PaperPic :src="photo" alt="O recibo que você anexou" :max-output-size="3000" @apply="applied" />
    </div>
    <button type="submit">
      Enviar
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

  // O formulário envia a imagem editada no lugar da foto
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
        Valor
        <input name="amount" type="number" step="0.01" required />
      </label>
      <label>
        Recibo
        <input ref={inputRef} name="receipt" type="file" accept="image/*" required onChange={event => setPhoto(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic src={photo} alt="O recibo que você anexou" maxOutputSize={3000} onApply={applied} />
        </div>
      )}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

:::

## Observações

- O Aplicar coloca a imagem editada no campo de arquivo com um [`DataTransfer`](https://developer.mozilla.org/docs/Web/API/DataTransfer), então o formulário a envia com o mesmo nome. Antes de qualquer Aplicar, o formulário envia a foto como o usuário a escolheu.
- Mudar os arquivos do campo pelo código não emite o evento `change` dele, então o visualizador mantém o resultado na tela.
- O arquivo mantém o nome da foto, com a extensão do resultado, como `receipt.png` depois do Limpar.
- Os botões do visualizador nunca enviam o formulário.
- [`maxOutputSize`](../reference/options#maxoutputsize) mantém o formulário leve. Fotos de celular têm 12 megapixels ou mais, e os documentos continuam legíveis com 3000 pixels no lado maior.
