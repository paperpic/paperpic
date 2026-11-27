---
title: Edição
description: Como funciona o modo de edição do PaperPic, do botão Editar até a aplicação das alterações, com as ferramentas, Desfazer e Refazer, a pré-visualização e os eventos que o seu código recebe.
---

# Edição

A foto de um documento costuma precisar de alguns retoques antes de valer a pena guardá-la. O modo de edição os reúne: o usuário faz as alterações, confere e aplica todas de uma vez. No [playground](../playground) você pode experimentar o modo de edição completo.

## O fluxo de edição

1. O usuário toca em Editar, o lápis na barra de ferramentas. A barra de ferramentas se esconde, para que nada cubra a imagem, e a barra de edição aparece na parte de baixo do visualizador.
2. Girar para a esquerda e Espelhar adicionam uma alteração na hora. As outras ferramentas abrem um painel na barra de edição, e ao tocar em Concluído o que o usuário escolheu nele entra como uma única alteração. Com Desfazer e Refazer, o usuário volta e avança pelas alterações.
3. Ao tocar em Aplicar, o visualizador calcula o resultado e volta ao modo de visualização. Cancelar descarta as alterações, e pede confirmação antes se houver alguma.

A imagem não muda até o usuário tocar em Aplicar. Até lá, as alterações são uma lista que o visualizador mostra em pré-visualização.

Num visualizador estreito, a barra de edição tem duas linhas: em cima, as ferramentas ou o painel da ferramenta aberta, e embaixo, Cancelar à esquerda e Aplicar, ou Concluído, à direita. A partir de 38rem de largura, tudo cabe numa linha. Nos dois casos, a barra mantém a altura quando uma ferramenta abre, então a imagem fica no lugar. Um ponto marca Ajustar e Limpar enquanto o valor deles está em uso.

## Ferramentas

| Ferramenta                                       | O que faz                                                                 | Id            |
| ------------------------------------------------ | ------------------------------------------------------------------------- | ------------- |
| [Recortar](./tools/crop)                         | Mantém a parte da imagem dentro de quatro cantos                          | `crop`        |
| [Endireitar](./tools/straighten)                 | Transforma uma foto tirada em ângulo numa página plana                    | `perspective` |
| [Girar para a esquerda](./tools/rotate-and-flip) | Gira a imagem um quarto de volta para a esquerda                          | `rotate`      |
| [Espelhar](./tools/rotate-and-flip)              | Espelha a imagem da esquerda para a direita                               | `flip`        |
| [Ajustar](./tools/adjust)                        | Muda o brilho e o contraste                                               | `adjust`      |
| [Limpar](./tools/clean-up)                       | Transforma o documento em cinza, ou num preto e branco nítido sem sombras | `finish`      |
| [Ocultar](./tools/redact)                        | Cobre uma área com preto ou branco sólidos                                | `redact`      |

A opção [`tools`](../reference/options#tools) escolhe quais a barra de edição oferece:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Recortar, Endireitar, Ocultar, Ajustar e Limpar abrem um painel no lugar das ferramentas. Enquanto uma delas está aberta, as outras ferramentas, Desfazer, Refazer e Aplicar ficam desativados. Concluído, ou `Enter`, adiciona às alterações o que foi escolhido na ferramenta, e Cancelar esta ferramenta, ou `Esc`, o descarta.

Dentro de um painel, a imagem aparece como o resultado vai ficar, com Limpar incluído. Endireitar é a exceção: mostra a foto sem o preto e branco, para que as bordas do papel continuem visíveis.

## Pré-visualização e resultado

Durante a edição, o visualizador mostra as alterações numa cópia da imagem de cerca de 2 megapixels, para continuar rápido com fotos grandes. Com muito zoom, a pré-visualização parece mais suave que o resultado. Ao aplicar, todas as alterações são calculadas na resolução completa, ou em [`maxOutputSize`](../reference/options#maxoutputsize), num Web Worker.

Depois de iniciada, a aplicação não pode ser interrompida. Ela bloqueia os controles e mostra uma mensagem enquanto roda. Depois, o resultado substitui a imagem na tela, o histórico se esvazia e o visualizador volta ao modo de visualização. Se falhar, a edição continua aberta para o usuário tentar de novo.

## O que o seu código recebe

| Evento   | Quando                                                                       |
| -------- | ---------------------------------------------------------------------------- |
| `apply`  | Quando o resultado está pronto, com `{ blob, width, height, type }`          |
| `change` | Toda vez que o usuário ou um método muda o [estado](../reference/state)      |
| `error`  | Quando a imagem não carrega, ou uma edição não pode ser mostrada ou aplicada |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## O que descarta as alterações

- Cancelar, depois que o usuário confirma, ou [`cancel()`](../reference/methods#cancel), que não pergunta.
- Um `src` novo, ou [`reload()`](../reference/methods#reload), durante a edição.
- Uma mudança de `editable` durante a edição.

Depois de aplicar as alterações, passar o mesmo `src` de novo não faz nada, então o resultado continua na tela. [`reload()`](../reference/methods#reload) traz de volta a original.

## Teclado

Com o foco no visualizador, há teclas para desfazer, refazer, confirmar e cancelar. [Acessibilidade](./accessibility#keyboard) lista todas.
