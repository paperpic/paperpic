---
title: Proporções fixas
description: Um exemplo completo que deixa o usuário escolher o tipo de documento, como uma folha US Legal ou uma página de passaporte, para que Endireitar dê ao resultado as proporções exatas.
---

# Proporções fixas

Endireitar estima as proporções do documento a partir da foto, e a estimativa não pode ser exata. Quando o seu app sabe o que o usuário fotografa, como um formulário US Legal ou uma página de passaporte, [`aspectRatio`](../reference/options#aspectratio) dá ao resultado a forma real. Este exemplo deixa o usuário escolher o tipo de documento antes de endireitá-lo.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">Folha US Legal</option>
  <option value="passport">Página de passaporte</option>
  <option value="envelope">Envelope DL</option>
  <option value="other">Outro</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const proportions: Record<string, number | undefined> = {
  legal: 8.5 / 14,
  passport: 125 / 88,
  envelope: 220 / 110,
  other: undefined,
}

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/scans/form.jpg',
  alt: 'Formulário assinado',
  tools: ['perspective', 'rotate', 'finish'],
  aspectRatio: proportions.legal,
})

document.querySelector('#type')!.addEventListener('change', (event) => {
  const type = (event.target as HTMLSelectElement).value
  pic.setOptions({ aspectRatio: proportions[type] })
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const types = [
  { name: 'Folha US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Página de passaporte', aspectRatio: 125 / 88 },
  { name: 'Envelope DL', aspectRatio: 220 / 110 },
  { name: 'Outro', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'finish']

const type = shallowRef(types[0]!)
</script>

<template>
  <select v-model="type">
    <option v-for="item in types" :key="item.name" :value="item">
      {{ item.name }}
    </option>
  </select>
  <div style="height: 480px">
    <PaperPic src="/scans/form.jpg" alt="Formulário assinado" :tools :aspect-ratio="type.aspectRatio" />
  </div>
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

const types = [
  { name: 'Folha US Legal', aspectRatio: 8.5 / 14 },
  { name: 'Página de passaporte', aspectRatio: 125 / 88 },
  { name: 'Envelope DL', aspectRatio: 220 / 110 },
  { name: 'Outro', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'finish']

export function Form() {
  const [index, setIndex] = useState(0)

  return (
    <>
      <select value={index} onChange={event => setIndex(Number(event.target.value))}>
        {types.map((item, position) => (
          <option key={item.name} value={position}>{item.name}</option>
        ))}
      </select>
      <div style={{ height: 480 }}>
        <PaperPic src="/scans/form.jpg" alt="Formulário assinado" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## Observações

- Endireitar guarda as proporções quando o usuário toca em Concluído, então escolha o tipo antes de endireitar. Mudá-lo depois só afeta o próximo endireitamento.
- Para um documento em paisagem, inverta os números, como `14 / 8.5`.
- As proporções valem para a página como ela aparece na tela. Se a foto estiver de lado, gire-a com Girar para a esquerda antes de usar Endireitar, ou uma folha em retrato sai achatada.
- Deixe `aspectRatio` sem valor para documentos sem tamanho fixo, como recibos, e Endireitar as estima.
- O painel de Endireitar já oferece A4, Carta e Cartão como [tamanhos de papel](../guide/tools/straighten#paper-size), então este exemplo adiciona outros documentos. O tamanho que o usuário escolhe ali prevalece sobre `aspectRatio` nesse endireitamento.
- [Endireitar](../guide/tools/straighten) explica a estimativa e o que fazer com cantos que ficam fora da foto.
