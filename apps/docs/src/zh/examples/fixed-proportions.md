---
title: 固定宽高比
description: 一个完整示例：让用户选择文档类型，例如 A4 纸或身份证件，使“矫正”给结果准确的宽高比。
---

# 固定宽高比

“矫正”根据照片估算文档的宽高比，估算不可能完全准确。当你的应用知道用户拍的是什么，例如 A4 表单或身份证件时，[`aspectRatio`](../reference/options#aspectratio) 会让结果采用真实的形状。这个示例让用户在矫正之前选择文档类型。

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">A4 纸</option>
  <option value="letter">US Letter 纸</option>
  <option value="idCard">身份证件</option>
  <option value="other">其他</option>
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
  alt: '已签名的表单',
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
  { name: 'A4 纸', aspectRatio: 210 / 297 },
  { name: 'US Letter 纸', aspectRatio: 8.5 / 11 },
  { name: '身份证件', aspectRatio: 85.6 / 53.98 },
  { name: '其他', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="已签名的表单" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'A4 纸', aspectRatio: 210 / 297 },
  { name: 'US Letter 纸', aspectRatio: 8.5 / 11 },
  { name: '身份证件', aspectRatio: 85.6 / 53.98 },
  { name: '其他', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="已签名的表单" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## 说明

- “矫正”在用户按下“完成”时保存宽高比，因此请在矫正之前选择类型。之后再修改只影响下一次矫正。
- 横向的文档请把数字对调，例如 `297 / 210`。
- 对于没有固定尺寸的文档，例如收据，不要设置 `aspectRatio`，“矫正”会自行估算。
- [矫正](../guide/tools/straighten)介绍了估算方式，以及如何处理超出照片的角。
