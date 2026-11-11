---
title: Translating the interface
description: How to translate PaperPic or change its wording with the labels option, including the texts read to screen readers, and how to follow the language of your app.
---

# Translating the interface

PaperPic shows its buttons, hints and messages in English, and screen readers announce what changes, also in English. The [`labels`](../reference/options#labels) option replaces any of these texts, so the component speaks the language of your app. No translations ship with the packages.

## Replace some texts

Pass only the texts you want to change. The others keep their English text:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Save', threshold: 'Black and white' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Save', threshold: 'Black and white' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Save', threshold: 'Black and white' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Labels](../reference/labels) lists every key with its English text and where it appears.

## Texts with a value

Five labels are functions, because their text includes a value: the zoom, the sensitivity of Clean up, a corner and its position, a selected corner, and a slider of Adjust. Screen readers announce them. Format the numbers as your language does:

```ts
const signed = new Intl.NumberFormat('es', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent} %`,
  thresholdLevel: percent => `Sensibilidad ${percent} %`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: toca donde va`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Follow the language of your app

When your app changes language, pass new labels, and the viewer updates its texts at once. Build the object only when the language changes, so the viewer does not receive a new one on every render:

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

Here `translations` stands for your own object of labels for each language.

## A starting point

This site shows the component in nine languages besides English. Their labels are in [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), and you can copy them into your app.
