---
title: 固定の縦横比
description: US リーガル用紙やパスポートのページなど、ユーザーが文書の種類を選べるようにし、「傾き補正」の結果を正確な縦横比にする完全な例。
---

# 固定の縦横比

「傾き補正」は写真から文書の縦横比を推定しますが、推定は正確にはなりません。US リーガルの書類やパスポートのページなど、ユーザーが何を撮るかアプリがわかっている場合は、[`aspectRatio`](../reference/options#aspectratio) で結果を本当の形にできます。この例では、傾き補正の前にユーザーが文書の種類を選びます。

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="legal">US リーガル用紙</option>
  <option value="passport">パスポートのページ</option>
  <option value="envelope">DL 封筒</option>
  <option value="other">その他</option>
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
  alt: '署名済みの書類',
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
  { name: 'US リーガル用紙', aspectRatio: 8.5 / 14 },
  { name: 'パスポートのページ', aspectRatio: 125 / 88 },
  { name: 'DL 封筒', aspectRatio: 220 / 110 },
  { name: 'その他', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="署名済みの書類" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'US リーガル用紙', aspectRatio: 8.5 / 14 },
  { name: 'パスポートのページ', aspectRatio: 125 / 88 },
  { name: 'DL 封筒', aspectRatio: 220 / 110 },
  { name: 'その他', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="署名済みの書類" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## 補足

- 「傾き補正」は、ユーザーが「完了」を押したときに縦横比を記録します。そのため、種類は傾き補正の前に選んでください。あとで変えても、次の傾き補正にしか影響しません。
- 横向きの文書では、`14 / 8.5` のように数値を入れ替えます。
- 縦横比は、画面に表示されているページに適用されます。写真が横向きなら、「傾き補正」の前に「左に回転」で回してください。そうしないと、縦向きの用紙がつぶれて出力されます。
- レシートのようにサイズが決まっていない文書では `aspectRatio` を指定せず、「傾き補正」に推定させます。
- 「傾き補正」のパネルには「A4」「レター」「カード」の[用紙サイズ](../guide/tools/straighten#paper-size)がすでにあるため、この例ではほかの文書を追加します。ユーザーがそこで選んだサイズは、その傾き補正では `aspectRatio` より優先されます。
- [傾き補正](../guide/tools/straighten)では、推定の仕組みと、写真からはみ出した角の扱いを説明しています。
