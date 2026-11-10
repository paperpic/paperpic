---
title: Salvar o resultado
description: Como o PaperPic entrega a imagem editada, como escolher o formato e o tamanho dela, como enviá-la, e como funcionam o botão de download e o evento dele.
---

# Salvar o resultado

O PaperPic nunca envia nem guarda nada. Quando o usuário aplica as alterações, ele entrega o resultado ao seu código, e o seu app decide para onde ele vai. Esta página mostra o que você recebe e como salvar.

## O evento `apply`

Aplicar calcula o resultado e emite [`apply`](../reference/events#apply) com:

| Campo             | Tipo     | Descrição                          |
| ----------------- | -------- | ---------------------------------- |
| `blob`            | `Blob`   | A imagem editada                   |
| `width`, `height` | `number` | O tamanho dela em pixels           |
| `type`            | `string` | O formato dela, como `'image/png'` |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

Depois do Aplicar, o resultado é a imagem na tela, o histórico fica vazio, e a próxima edição parte do resultado. [`reload()`](../reference/methods#reload) traz de volta o `src` original.

## Enviar

Envie o `blob` como arquivo num formulário:

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

O visualizador mostra o resultado na hora, chegue ele ou não ao seu servidor, então avise o usuário se o envio falhar.

## Formato e qualidade

Sem opções, o resultado mantém o formato da imagem original: JPEG, PNG ou WebP. Um documento limpo sai em PNG, porque o JPEG adicionaria artefatos em volta das bordas nítidas dele. Qualquer outra imagem original, como um GIF, gera PNG.

[`output`](../reference/options#output) escolhe o formato e a qualidade dele de 0 a 1 para JPEG e WebP, com 0.92 como padrão:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| Formato      | Serve para                                                 |
| ------------ | ---------------------------------------------------------- |
| `image/png`  | Documentos limpos e texto, sem perda                       |
| `image/jpeg` | Fotos e documentos coloridos, em arquivos pequenos         |
| `image/webp` | Fotos e documentos coloridos, em arquivos menores que JPEG |

Um navegador que não consegue codificar o formato pedido gera PNG, então leia `type` no evento.

## Tamanho

O resultado mantém a resolução completa da imagem original, que em muitas fotos de celular passa de 12 megapixels. [`maxOutputSize`](../reference/options#maxoutputsize) limita o lado mais longo dele, em pixels:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

A pré-visualização durante a edição tem sempre cerca de 2 megapixels, então `maxOutputSize` só muda o resultado.

## O botão de download

[`download: true`](../reference/options#download) adiciona um botão no fim da barra de ferramentas que salva a imagem na tela: o resultado do último Aplicar, ou então a imagem original como está. Ele fica oculto durante a edição, porque as alterações ainda não foram aplicadas. [`download()`](../reference/methods#download) faz o mesmo pelo código, com ou sem o botão. O menu de contexto do navegador não abre sobre o visualizador, então esse botão é a forma de salvar a imagem a partir dele.

O arquivo mantém o nome da imagem original e recebe a extensão do formato dela, então um `receipt.jpg` limpo é salvo como `receipt.png`. [`filename`](../reference/options#filename) define outro nome. Sem nenhum nome, como num `Blob`, o arquivo se chama `image`.

### Salvar de outro jeito

O evento [`download`](../reference/events#download) vem antes de o navegador salvar o arquivo. Chame `preventDefault()` para salvá-lo de outro jeito, por exemplo pelo seu servidor, que pode dar nome ao arquivo e verificar quem o baixa:

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
