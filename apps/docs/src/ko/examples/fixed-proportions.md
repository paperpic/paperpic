---
title: 고정 비율
description: 사용자가 A4 용지나 신분증 카드 같은 문서 종류를 고르게 해서, ‘기울기 보정’이 결과에 정확한 비율을 주도록 하는 완전한 예제.
---

# 고정 비율

‘기울기 보정’은 사진에서 문서의 비율을 추정하며, 그 추정은 정확할 수 없습니다. A4 서식이나 신분증 카드처럼 사용자가 무엇을 찍는지 앱이 안다면, [`aspectRatio`](../reference/options#aspectratio)가 결과에 실제 모양을 줍니다. 이 예제는 사용자가 기울기를 보정하기 전에 문서 종류를 고르게 합니다.

:::tabs key:framework
== JavaScript

```html
<select id="type">
  <option value="a4">A4 용지</option>
  <option value="letter">US Letter 용지</option>
  <option value="idCard">신분증 카드</option>
  <option value="other">기타</option>
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
  alt: '서명한 서식',
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
  { name: 'A4 용지', aspectRatio: 210 / 297 },
  { name: 'US Letter 용지', aspectRatio: 8.5 / 11 },
  { name: '신분증 카드', aspectRatio: 85.6 / 53.98 },
  { name: '기타', aspectRatio: undefined },
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
    <PaperPic src="/scans/form.jpg" alt="서명한 서식" :tools :aspect-ratio="type.aspectRatio" />
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
  { name: 'A4 용지', aspectRatio: 210 / 297 },
  { name: 'US Letter 용지', aspectRatio: 8.5 / 11 },
  { name: '신분증 카드', aspectRatio: 85.6 / 53.98 },
  { name: '기타', aspectRatio: undefined },
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
        <PaperPic src="/scans/form.jpg" alt="서명한 서식" tools={tools} aspectRatio={types[index]!.aspectRatio} />
      </div>
    </>
  )
}
```

:::

## 참고

- ‘기울기 보정’은 사용자가 ‘완료’를 누를 때 비율을 저장하므로, 보정하기 전에 종류를 고르세요. 나중에 바꾸면 다음 보정에만 적용됩니다.
- 가로 방향 문서라면 `297 / 210`처럼 숫자를 바꾸세요.
- 영수증처럼 크기가 정해지지 않은 문서는 `aspectRatio`를 지정하지 마세요. 그러면 ‘기울기 보정’이 추정합니다.
- [기울기 보정](../guide/tools/straighten)에서 추정 방식과 사진 밖으로 나간 모서리를 다루는 법을 설명합니다.
