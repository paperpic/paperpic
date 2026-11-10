---
title: 읽기 전용 뷰어
description: 기록의 첨부 파일을 위한 읽기 전용 PaperPic 뷰어의 완전한 예제. 문서 목록, 회전, 다운로드 버튼을 갖춥니다.
---

# 읽기 전용 뷰어

주문이나 청구의 첨부 파일처럼 읽어야 하지만 바뀌면 안 되는 문서가 있습니다. 이 예제는 그런 문서를 읽기 전용 뷰어에서 하나씩 보여 주고, 목록으로 전환하며, 버튼으로 내려받게 합니다.

:::tabs key:framework
== JavaScript

```html
<select id="documents">
  <option value="0">청구서</option>
  <option value="1">납품서</option>
</select>
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '청구서' },
  { src: '/orders/42/delivery-note.jpg', alt: '납품서' },
]

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  ...documents[0],
  editable: false,
  download: true,
  wheelZoom: false,
})

document.querySelector('#documents')!.addEventListener('change', (event) => {
  const index = Number((event.target as HTMLSelectElement).value)
  pic.setOptions(documents[index]!)
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '청구서' },
  { src: '/orders/42/delivery-note.jpg', alt: '납품서' },
]

const current = shallowRef(documents[0]!)
</script>

<template>
  <select v-model="current">
    <option v-for="item in documents" :key="item.src" :value="item">
      {{ item.alt }}
    </option>
  </select>
  <div style="height: 480px">
    <PaperPic
      :src="current.src"
      :alt="current.alt"
      :editable="false"
      download
      :wheel-zoom="false"
    />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

const documents = [
  { src: '/orders/42/invoice.jpg', alt: '청구서' },
  { src: '/orders/42/delivery-note.jpg', alt: '납품서' },
]

export function Attachments() {
  const [index, setIndex] = useState(0)
  const current = documents[index]!

  return (
    <>
      <select value={index} onChange={event => setIndex(Number(event.target.value))}>
        {documents.map((item, position) => (
          <option key={item.src} value={position}>{item.alt}</option>
        ))}
      </select>
      <div style={{ height: 480 }}>
        <PaperPic src={current.src} alt={current.alt} editable={false} download wheelZoom={false} />
      </div>
    </>
  )
}
```

:::

## 참고

- `editable: false`에서는 도구 모음에 ‘편집’ 버튼이 없고, 회전 버튼은 화면의 이미지만 돌립니다.
- `download: true`는 문서를 원래 파일 이름 그대로 저장하는 버튼을 더합니다. [`download`](../reference/events#download) 이벤트로 대신 서버에서 제공할 수 있습니다.
- `wheelZoom: false`이면 휠이 페이지를 스크롤하므로, 긴 페이지 안의 뷰어에 알맞습니다.
- 새 `src`는 다음 문서를 불러오고 뷰어에 맞춥니다.
