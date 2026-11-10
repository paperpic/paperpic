---
title: Traduzir a interface
description: Como traduzir o PaperPic ou mudar as palavras dele com a opção labels, incluindo os textos lidos por leitores de tela, e como seguir o idioma do seu app.
---

# Traduzir a interface

O PaperPic mostra botões, dicas e mensagens em inglês, e os leitores de tela anunciam o que muda, também em inglês. A opção [`labels`](../reference/options#labels) substitui qualquer um desses textos, para que o componente fale o idioma do seu app. Os pacotes não trazem traduções.

## Substituir alguns textos

Passe só os textos que quiser mudar. Os outros mantêm o texto em inglês:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Salvar', threshold: 'Preto e branco' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Salvar', threshold: 'Preto e branco' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Salvar', threshold: 'Preto e branco' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Rótulos](../reference/labels) lista todas as chaves, com o texto em inglês e onde aparecem.

## Textos com um valor

Quatro rótulos são funções, porque o texto deles inclui um valor: o zoom, a sensibilidade do Limpar, um canto e a posição dele, e um controle do Ajustar. Os leitores de tela os anunciam. Formate os números como o seu idioma faz:

```ts
const signed = new Intl.NumberFormat('pt', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent}%`,
  thresholdLevel: percent => `Sensibilidade ${percent}%`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Seguir o idioma do seu app

Quando o seu app muda de idioma, passe os novos rótulos, e o visualizador atualiza os textos na hora. Crie o objeto só quando o idioma mudar, para que o visualizador não receba um novo a cada renderização:

:::tabs key:framework
== JavaScript

```ts
function setLanguage(language: string) {
  pic.setOptions({ labels: translations[language] })
}
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const labels = computed(() => translations[locale.value])
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useMemo } from 'react'

export function Receipt({ language }: { language: string }) {
  const labels = useMemo(() => translations[language], [language])
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

Aqui, `translations` representa o seu próprio objeto de rótulos para cada idioma.

## Um ponto de partida

Este site mostra o componente em nove idiomas além do inglês. Os rótulos deles estão em [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), e você pode copiá-los para o seu app.
