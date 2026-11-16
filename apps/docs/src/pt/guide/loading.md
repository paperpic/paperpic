---
title: Carregar imagens
description: Como dar uma imagem ao PaperPic, a partir de uma URL, de um arquivo que o usuário escolhe ou de um Blob que você busca, quais formatos ele abre e como o seu código sabe que a imagem carregou ou falhou.
---

# Carregar imagens

O PaperPic mostra a imagem que você passa em `src`. Esta página explica de onde essa imagem pode vir, quais formatos abrem e como o seu código sabe que a imagem está pronta ou que falhou.

## De onde vem a imagem

`src` aceita uma de três coisas:

- **Uma URL da mesma origem da sua página**, como `/documents/42.jpg`.
- **Um `File`** que o usuário escolhe com `<input type="file">`. [Anexar e digitalizar](../examples/attach-and-scan) mostra o fluxo completo, da câmera ao envio.
- **Um `Blob`** que o seu código tem, como o corpo de uma resposta.

Para um `File` ou um `Blob`, o PaperPic cria a URL `blob:` de que precisa, e a libera quando a imagem muda ou o visualizador é destruído.

## Imagens de outra origem, ou atrás de um login {#fetch}

O PaperPic lê os pixels da imagem para editá-la. Os navegadores só permitem isso com uma imagem de outra origem quando ela chega com CORS, que o PaperPic não pede. Essa imagem aparece, mas a primeira edição falha com um [`error`](../reference/events#error) que diz isso.

Busque a imagem você mesmo e passe o `Blob` como `src`. Isso também cobre imagens atrás de um login, porque a sua requisição leva os cookies do usuário:

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

O outro servidor precisa permitir a sua origem com CORS, como em qualquer `fetch` feito pela página.

## Formatos {#formats}

O PaperPic abre qualquer formato que o navegador mostre em um `<img>`:

- **JPEG, PNG, WebP e AVIF** abrem em todos os [navegadores compatíveis](./performance#browser-support).
- **SVG** abre quando o arquivo tem os atributos `width` e `height`. Sem eles, não tem tamanho, e o carregamento falha.
- **HEIC**, o formato das fotos do iPhone, só abre no Safari. Quando um usuário de iPhone escolhe uma foto com `<input type="file" accept="image/*">`, o iOS costuma entregar à página uma cópia em JPEG. Um arquivo HEIC que chega a outro navegador por outro caminho não carrega.

Os celulares costumam salvar a foto de lado, com uma tag EXIF que diz como girá-la. O PaperPic mostra a foto como a tag diz, como faz um `<img>`, e o resultado do Aplicar sai na posição certa.

## Saber quando carrega ou falha

O evento [`load`](../reference/events#load) avisa que a imagem está na tela, com o tamanho dela. Se a imagem não puder carregar, porque não existe, não é uma imagem ou o navegador não sabe decodificá-la, o visualizador mostra uma mensagem, e o evento [`error`](../reference/events#error) traz `phase: 'load'`:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: 'Fatura 42' })

pic.on('load', ({ width, height }) => {
  console.log(`A imagem tem ${width}×${height} pixels`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`A imagem tem ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="Fatura 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`A imagem tem ${width}×${height} pixels`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="Fatura 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

O `status` de [`getState()`](../reference/state) dá a mesma resposta a qualquer momento: `'empty'`, `'loading'`, `'ready'` ou `'error'`.

## Trocar ou recarregar a imagem

- **Um `src` novo** carrega a nova imagem. Enquanto o usuário está editando, descarta as edições.
- **O mesmo `src`** não faz nada, então o resultado do Aplicar continua na tela.
- **[`reload()`](../reference/methods#reload)** carrega de novo o `src` atual, o que traz de volta o original depois do Aplicar.
