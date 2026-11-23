---
title: Estado
description: O que getState() retorna e o evento change envia, como o status da imagem, o modo, o zoom, as alterações e se há algo para aplicar, e como sincronizar seus próprios controles.
---

# Estado

O estado é um retrato do visualizador: se há uma imagem, o modo, o zoom, a ferramenta aberta e se há alterações para aplicar. Você o obtém de duas formas, e as duas dão o mesmo objeto [`PaperPicState`](./types#paperpicstate):

- [`getState()`](./methods#getstate) o retorna quando você pede.
- O evento [`change`](./events#change) o envia toda vez que o usuário ou um método o muda.

## Sincronizar seus controles {#in-step}

`change` não avisa sobre a imagem. Uma imagem carregada chega com [`load`](./events#load), e um carregamento ou um Aplicar que falha chega com [`error`](./events#error). Para sincronizar seus próprios controles, como um botão Aplicar, leia o estado no início, pegue-o de cada `change` e leia-o de novo em `load` e `error`:

:::tabs key:framework
== JavaScript

```ts
import type { PaperPicState } from '@paperpic/core'
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const applyButton = document.querySelector<HTMLButtonElement>('#apply')!
const pic = new PaperPic(container, { src: '/receipt.jpg', toolbar: false })

function update({ canApply, busy }: PaperPicState) {
  applyButton.disabled = !canApply || busy
}

update(pic.getState())
pic.on('change', update)
pic.on('load', () => update(pic.getState()))
pic.on('error', () => update(pic.getState()))
applyButton.addEventListener('click', () => pic.apply())
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicState } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const state = shallowRef<PaperPicState>()

function refresh() {
  state.value = pic.value?.instance?.getState()
}
</script>

<template>
  <button type="button" :disabled="!state || !state.canApply || state.busy" @click="pic?.instance?.apply()">
    Aplicar
  </button>
  <div style="height: 480px">
    <PaperPic
      ref="pic"
      src="/receipt.jpg"
      :toolbar="false"
      @change="next => (state = next)"
      @load="refresh"
      @error="refresh"
    />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance, PaperPicState } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)
  const [state, setState] = useState<PaperPicState>()

  function refresh() {
    setState(picRef.current?.getState())
  }

  return (
    <>
      <button type="button" disabled={!state || !state.canApply || state.busy} onClick={() => picRef.current?.apply()}>
        Aplicar
      </button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" toolbar={false} onChange={setState} onLoad={refresh} onError={refresh} />
      </div>
    </>
  )
}
```

:::

Em Vue e React o visualizador só existe depois que o componente é montado, então o estado começa como `undefined` e chega com o primeiro `load` ou `error`. Até lá, não há nada para aplicar.

## Campos

| Campo         | Tipo                                         | Descrição                                                                                                                                                                    |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | A ferramenta aberta, como `'crop'` ou `'adjust'`, ou `null`                                                                                                                  |
| `adjustments` | `{ brightness, contrast }`                   | O brilho e o contraste, cada um de -1 a 1. Não são aplicados em preto e branco. Enquanto Ajustar está aberto, os valores do seu painel                                       |
| `busy`        | `boolean`                                    | Se o Aplicar está em andamento                                                                                                                                               |
| `canApply`    | `boolean`                                    | Se há alterações para aplicar. Giros e espelhamentos que se anulam não contam                                                                                                |
| `canConfirm`  | `boolean`                                    | Se [`confirmTool()`](./methods#confirmtool) pode manter o que a ferramenta aberta mostra. Endireitar espera que um canto se mova. É `false` sem nenhuma ferramenta aberta    |
| `canRedo`     | `boolean`                                    | Se há uma alteração para trazer de volta                                                                                                                                     |
| `canUndo`     | `boolean`                                    | Se há uma alteração para desfazer                                                                                                                                            |
| `finish`      | `{ mode, sensitivity }`                      | O acabamento de Limpar, um [`FinishMode`](./types#finishmode), e a sensibilidade do preto e branco, de 0 a 1. Enquanto Limpar está aberto, os valores do seu painel          |
| `fit`         | [`Fit \| null`](./types#fit)                 | O encaixe em vigor, ou `null` assim que o usuário dá zoom manualmente                                                                                                        |
| `hint`        | `string \| null`                             | O que a ferramenta aberta pede ao usuário, como a barra de edição integrada mostra, por exemplo "Drag the corners", ou `null`. Com `toolbar: false`, mostre na sua interface |
| `image`       | [`Size \| null`](./types#size)               | O tamanho da imagem em pixels, na resolução completa e com as alterações feitas, mas sem o giro de `rotation`, ou `null` sem imagem                                          |
| `mode`        | `'view' \| 'edit'`                           | Se o usuário está vendo ou editando a imagem                                                                                                                                 |
| `paper`       | `{ size }`                                   | O tamanho do papel no painel de Endireitar, um [`PaperSize`](./types#papersize), enquanto está aberto, e senão `'auto'`                                                      |
| `redaction`   | `{ color }`                                  | A cor de Ocultar, uma [`RedactColor`](./types#redactcolor): a do seu painel enquanto está aberto, e senão a da próxima área                                                  |
| `rotation`    | [`Rotation`](./types#rotation)               | Quanto a imagem na tela está girada em relação a `image`, em graus no sentido horário                                                                                        |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | `'empty'` sem `src`, `'loading'` enquanto carrega, `'ready'` quando está na tela, e `'error'` se não pôde ser carregada                                                      |
| `zoom`        | `number`                                     | Pixels da tela por pixel da imagem                                                                                                                                           |

Com uma `rotation` de 90 ou 270, a imagem na tela, e o resultado do Aplicar, têm a largura e a altura de `image` trocadas. [`maxOutputSize`](./options#maxoutputsize) pode deixar o resultado menor.
