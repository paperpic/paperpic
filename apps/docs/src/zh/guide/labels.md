---
title: 翻译界面
description: 如何用 labels 选项翻译 PaperPic 或修改其措辞，包括屏幕阅读器朗读的文本，以及如何跟随你应用的语言。
---

# 翻译界面

PaperPic 用英文显示按钮、提示和消息，屏幕阅读器朗读的变化也是英文。[`labels`](../reference/options#labels) 选项可以替换其中任何文本，让组件使用你应用的语言。各个包不附带翻译。

## 替换部分文本

只传入你想修改的文本，其余的保留英文：

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: '保存', threshold: '黑白' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: '保存', threshold: '黑白' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: '保存', threshold: '黑白' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

所有键及其英文文本和出现位置都列在[标签](../reference/labels)中。

## 带数值的文本

有五个标签是函数，因为它们的文本包含一个值：缩放、“清理”的灵敏度、一个角及其位置、一个选中的角，以及“调整”的刻度尺。屏幕阅读器会朗读它们。请按照你的语言习惯格式化数字：

```ts
const signed = new Intl.NumberFormat('zh', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `缩放 ${percent}%`,
  thresholdLevel: percent => `灵敏度 ${percent}%`,
  cornerMoved: (corner, x, y) => `${corner}：${x}, ${y}`,
  cornerSelected: corner => `${corner}：点按新位置`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## 跟随应用的语言

当你的应用切换语言时，传入新的标签，查看器会立即更新文本。只在语言变化时创建对象，这样查看器不会在每次渲染时都收到新对象：

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

这里的 `translations` 代表你自己的、按语言组织的标签对象。

## 起点

本站除英文外还用九种语言展示了组件。这些标签位于 [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts)，你可以把它们复制到你的应用中。
