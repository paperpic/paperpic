---
title: Primeiros passos
description: Instale o PaperPic para JavaScript, Vue ou React, mostre sua primeira imagem de documento e receba a imagem editada.
---

# Primeiros passos

Esta página leva você da instalação do PaperPic até mostrar uma imagem e receber o resultado editado. Escolha o seu framework em qualquer exemplo, e os outros exemplos do site acompanham.

## Instalação

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` requer Vue 3.5 ou mais recente.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` requer React 19 ou mais recente.

:::

## Mostrar uma imagem

O visualizador preenche o contêiner, então defina uma altura para o contêiner. Importe a folha de estilo uma vez no seu app.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: 'Um recibo',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="Um recibo" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="Um recibo" />
    </div>
  )
}
```

:::

`src` aceita uma URL da mesma origem da sua página, ou um `File` que o usuário escolhe, por exemplo num `<input type="file">`. `alt` descreve a imagem para leitores de tela.

## Receber a imagem editada

O lápis na barra de ferramentas abre o modo de edição. Quando o usuário aplica as alterações, o resultado substitui a imagem na tela, e o evento `apply` o entrega ao seu código:

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Um recibo" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Um recibo" onApply={({ blob }) => upload(blob)} />
```

:::

Aqui, `upload` representa o seu próprio código, por exemplo:

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

O `blob` mantém o formato da imagem original, ou é PNG quando o usuário limpou o documento. A opção [`output`](../reference/options#output) muda isso.

## Só mostrar a imagem

Para mostrar um documento que não deve ser alterado, desative a edição com `editable: false`. A página [Visualizador](./viewer) mostra isso funcionando.

## Requisitos

- O PaperPic funciona nos navegadores do [Baseline Widely Available](https://web.dev/baseline).
- A edição roda num Web Worker, que bundlers como Vite e webpack reconhecem sozinhos. Se o worker não conseguir iniciar, a edição roda na thread principal: continua funcionando, mas a página pode travar por um instante com imagens grandes.
- Com uma Content Security Policy, permita o worker com `worker-src 'self'`, e permita `img-src blob:`, porque o visualizador mostra arquivos anexados e resultados por URLs `blob:`.
- Com renderização no servidor, como no Nuxt ou no Next.js, os componentes Vue e React renderizam um elemento vazio no servidor e criam o visualizador no navegador. Com o core, crie você mesmo o visualizador no navegador.

## Próximos passos

- [Visualizador](./viewer): zoom, ajuste e uso somente leitura.
- [Edição](./editing): o modo de edição, as ferramentas, Desfazer e Aplicar.
- [Opções](../reference/options): tudo o que você pode configurar.
