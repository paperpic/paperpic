---
title: インターフェースの翻訳
description: labels オプションで PaperPic を翻訳したり言い回しを変えたりする方法。スクリーンリーダー向けのテキストや、アプリの言語に合わせる方法も説明します。
---

# インターフェースの翻訳

PaperPic はボタン、ヒント、メッセージを英語で表示し、スクリーンリーダーも変化を英語で読み上げます。[`labels`](../reference/options#labels) オプションでこれらのテキストを置き換えれば、コンポーネントがアプリの言語で話すようになります。パッケージには翻訳は含まれていません。

## 一部のテキストを置き換える

変えたいテキストだけを渡します。ほかは英語のままです。

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: '保存', threshold: '白黒' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: '保存', threshold: '白黒' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: '保存', threshold: '白黒' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

すべてのキーと、その英語のテキスト、表示される場所は[ラベル](../reference/labels)にあります。

## 値を含むテキスト

5 つのラベルは、テキストに値を含むため関数です。ズーム、「クリーンアップ」の感度、角とその位置、選択した角、「調整」のスライダーです。スクリーンリーダーが読み上げます。数値は使う言語の書き方に合わせてください。

```ts
const signed = new Intl.NumberFormat('ja', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `ズーム ${percent}%`,
  thresholdLevel: percent => `感度 ${percent}%`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: 移動先をタップします`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## アプリの言語に合わせる

アプリの言語が変わったら新しいラベルを渡すと、ビューアーはすぐにテキストを更新します。オブジェクトは言語が変わったときだけ作ってください。そうしないと、ビューアーはレンダーのたびに新しいものを受け取ります。

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

ここで `translations` は、言語ごとのラベルをまとめたあなた自身のオブジェクトです。

## 出発点

このサイトでは、英語以外に 9 つの言語でコンポーネントを表示しています。そのラベルは [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts) にあり、アプリにコピーして使えます。
