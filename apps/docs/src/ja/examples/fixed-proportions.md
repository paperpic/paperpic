---
title: 固定の縦横比
description: A4 用紙や身分証明書カードなど、ユーザーが文書の種類を選べるようにし、「傾き補正」の結果を正確な縦横比にする完全な例。
---

# 固定の縦横比

「傾き補正」は写真から文書の縦横比を推定しますが、推定は正確にはなりません。A4 の書類や身分証明書カードなど、ユーザーが何を撮るかアプリがわかっている場合は、[`aspectRatio`](../reference/options#aspectratio) で結果を本当の形にできます。この例では、傾き補正の前にユーザーが文書の種類を選びます。

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">A4 用紙</option>
  <option value="letter">US レター用紙</option>
  <option value="idCard">身分証明書カード</option>
  <option value="other">その他</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const proportions: Record<string, number | undefined> = {
  a4: 210 / 297,
  letter: 8.5 / 11,
  idCard: 85.6 / 53.98,
  other: undefined,
}

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/scans/form.jpg',
  alt: '署名済みの書類',
  tools: ['perspective', 'rotate', 'threshold'],
  aspectRatio: proportions.a4,
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
  { name: 'A4 用紙', aspectRatio: 210 / 297 },
  { name: 'US レター用紙', aspectRatio: 8.5 / 11 },
  { name: '身分証明書カード', aspectRatio: 85.6 / 53.98 },
  { name: 'その他', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'threshold']

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
  { name: 'A4 用紙', aspectRatio: 210 / 297 },
  { name: 'US レター用紙', aspectRatio: 8.5 / 11 },
  { name: '身分証明書カード', aspectRatio: 85.6 / 53.98 },
  { name: 'その他', aspectRatio: undefined },
]
const tools: ToolId[] = ['perspective', 'rotate', 'threshold']

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
- 横向きの文書では、`297 / 210` のように数値を入れ替えます。
- レシートのようにサイズが決まっていない文書では `aspectRatio` を指定せず、「傾き補正」に推定させます。
- [傾き補正](../guide/tools/straighten)では、推定の仕組みと、写真からはみ出した角の扱いを説明しています。
