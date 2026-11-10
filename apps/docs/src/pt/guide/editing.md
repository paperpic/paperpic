---
title: Edição
description: Como funciona o modo de edição do PaperPic, do botão Editar até Aplicar, com as ferramentas, Desfazer e Refazer, a pré-visualização e os eventos que o seu código recebe.
---

# Edição

A foto de um documento costuma precisar de alguns ajustes antes de valer a pena guardá-la. O modo de edição os reúne: o usuário faz as alterações, confere e aplica todas de uma vez. No [playground](../playground) você pode experimentar o modo de edição completo.

## O fluxo de edição

1. O usuário toca em Editar, o lápis na barra de ferramentas. A barra de edição aparece na parte de baixo do visualizador.
2. Cada ferramenta da barra de edição adiciona uma alteração, que o visualizador mostra na hora. Desfazer e Refazer percorrem as alterações.
3. Aplicar calcula o resultado e volta à visualização. Cancelar descarta as alterações, e pergunta antes se houver alguma.

Nada muda a imagem antes do Aplicar. Até lá, as alterações são uma lista que o visualizador mostra em pré-visualização.

## Ferramentas

| Ferramenta            | O que faz                                                     | Id            |
| --------------------- | ------------------------------------------------------------- | ------------- |
| Recortar              | Mantém a parte da imagem dentro de quatro cantos              | `crop`        |
| Endireitar            | Transforma uma foto tirada em ângulo numa página plana        | `perspective` |
| Girar para a esquerda | Gira a imagem um quarto de volta para a esquerda              | `rotate`      |
| Espelhar              | Espelha a imagem da esquerda para a direita                   | `flip`        |
| Ajustar               | Muda o brilho e o contraste                                   | `adjust`      |
| Limpar                | Transforma o documento num preto e branco nítido, sem sombras | `threshold`   |

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

Recortar e Endireitar têm seleção própria, então o resto da barra de edição espera enquanto uma delas está aberta. Concluído, ou `Enter`, adiciona a seleção às alterações, e Cancelar esta ferramenta, ou `Esc`, a descarta.

## Pré-visualização e Aplicar

Durante a edição, o visualizador mostra as alterações numa cópia da imagem de cerca de 2 megapixels, para continuar rápido com fotos grandes. Com muito zoom, a pré-visualização parece mais suave que o resultado. Aplicar calcula todas as alterações na resolução completa, ou em [`maxOutputSize`](../reference/options#maxoutputsize), num Web Worker.

Aplicar não pode ser interrompido. Ele bloqueia os controles e mostra uma mensagem enquanto roda. Depois, o resultado substitui a imagem na tela, o histórico se esvazia e o visualizador volta ao modo de visualização. Se Aplicar falhar, a edição continua aberta para o usuário tentar de novo.

## O que o seu código recebe

| Evento   | Quando                                                              |
| -------- | ------------------------------------------------------------------- |
| `change` | Depois de cada ação do usuário, com o [estado](../reference/state)  |
| `apply`  | Quando o resultado está pronto, com `{ blob, width, height, type }` |
| `error`  | Quando Aplicar falha, ou quando a imagem não carrega                |

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
- Um `src` novo durante a edição.
- Uma mudança de `editable` durante a edição.

Depois do Aplicar, passar o mesmo `src` de novo não faz nada, então o resultado continua na tela. [`reload()`](../reference/methods#reload) traz de volta a original.

## Teclado

Com o foco no visualizador:

| Tecla                      | Ação                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `Ctrl+Z`                   | Desfazer                                                      |
| `Ctrl+Shift+Z` ou `Ctrl+Y` | Refazer                                                       |
| `Enter`                    | Confirmar a ferramenta aberta, ou então aplicar as alterações |
| `Esc`                      | Fechar a ferramenta aberta, ou então cancelar as alterações   |

No macOS, `Cmd` funciona como `Ctrl`.
