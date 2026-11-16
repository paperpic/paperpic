---
title: Primeiros passos
description: Instale o PaperPic para JavaScript, Vue ou React, mostre sua primeira imagem de documento e receba a imagem editada.
---

# Primeiros passos

Esta página leva você da instalação do PaperPic até mostrar uma imagem e receber o resultado editado. Escolha o seu framework em qualquer exemplo, e os outros exemplos do site acompanham.

## Instalação

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue` requer Vue 3.5 ou mais recente.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react` requer React 19 ou mais recente.

::::

### Sem bundler {#cdn}

O core também carrega de uma CDN que serve os arquivos do pacote como estão, como o jsDelivr. Importe `dist/index.js` de um script de módulo e inclua `dist/style.css`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: 'Um recibo' })
</script>
```

Os navegadores só iniciam um worker da origem da página, então ali a edição roda na thread principal: funciona, mas fotos grandes travam a página por um momento no Aplicar. Sirva os arquivos da sua própria origem, ou use um bundler, para manter o worker. Os componentes de Vue e React precisam de um bundler.

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

`src` aceita uma URL da mesma origem da sua página, ou um `File` que o usuário escolhe, por exemplo num `<input type="file">`. `alt` descreve a imagem para leitores de tela. [Carregar imagens](./loading) trata de imagens de outras origens, formatos e erros de carregamento.

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

## Remover o visualizador {#destroy}

Os componentes de Vue e React criam o visualizador ao serem montados e o destroem ao serem desmontados. Com o core, chame [`destroy()`](../reference/methods#destroy) quando tirar o visualizador da página, por exemplo quando a rota muda:

```ts
pic.destroy()
```

Ele tira o visualizador do contêiner, para os listeners e o worker, e libera a memória da imagem. Para mostrá-lo de novo, crie um novo.

## Só mostrar a imagem

Para mostrar um documento que não deve ser alterado, desative a edição com `editable: false`. A página [Visualizador](./viewer) mostra isso funcionando.

## Requisitos

O PaperPic funciona nos navegadores do [Baseline Widely Available](https://web.dev/baseline). [Desempenho e compatibilidade](./performance) trata do worker, da Content Security Policy, da renderização no servidor e das fotos grandes.

## Próximos passos

- [Carregar imagens](./loading): de onde vem a imagem e quais formatos abrem.
- [Visualizador](./viewer): zoom, ajuste e uso somente leitura.
- [Edição](./editing): o modo de edição, as ferramentas, Desfazer e Aplicar.
- [Opções](../reference/options): tudo o que você pode configurar.
- [Solução de problemas](./troubleshooting): quando o visualizador não aparece ou não funciona como deveria.
