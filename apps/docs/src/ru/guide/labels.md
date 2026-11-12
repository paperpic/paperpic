---
title: Перевод интерфейса
description: Как перевести PaperPic или изменить его формулировки опцией labels, включая тексты для программ чтения с экрана, и как следовать языку вашего приложения.
---

# Перевод интерфейса

PaperPic показывает кнопки, подсказки и сообщения на английском, и программы чтения с экрана тоже озвучивают изменения на английском. Опция [`labels`](../reference/options#labels) заменяет любой из этих текстов, чтобы компонент говорил на языке вашего приложения. Переводов в пакетах нет.

## Заменить некоторые тексты

Передайте только тексты, которые хотите изменить. Остальные сохранят английский текст:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Сохранить', threshold: 'Чёрно-белое' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Сохранить', threshold: 'Чёрно-белое' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Сохранить', threshold: 'Чёрно-белое' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Подписи](../reference/labels) перечисляют все ключи с английским текстом и местом, где они появляются.

## Тексты со значением

Пять подписей — функции, потому что их текст содержит значение: масштаб, чувствительность «Очистить», угол и его положение, выбранный угол, шкала «Настроить». Программы чтения с экрана их озвучивают. Форматируйте числа так, как принято в вашем языке:

```ts
const signed = new Intl.NumberFormat('ru', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Масштаб ${percent} %`,
  thresholdLevel: percent => `Чувствительность ${percent} %`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: коснитесь нового места`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Следовать языку приложения

Когда ваше приложение меняет язык, передайте новые подписи, и просмотрщик сразу обновит тексты. Создавайте объект только при смене языка, чтобы просмотрщик не получал новый при каждом рендере:

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

Здесь `translations` — ваш собственный объект с подписями для каждого языка.

## С чего начать

Этот сайт показывает компонент на девяти языках помимо английского. Их подписи лежат в [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), и их можно скопировать в ваше приложение.
