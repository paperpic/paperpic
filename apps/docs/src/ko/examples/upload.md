---
title: 서버에 업로드
description: PaperPic에서 편집한 이미지를 서버로 보내고 저장 여부를 사용자에게 알리는 완전한 예제. JavaScript, Vue, React로 보여 줍니다.
---

# 서버에 업로드

뷰어는 ‘적용’의 결과를 바로 보여 주지만, 저장은 앱이 할 일입니다. 이 예제는 편집한 이미지를 서버로 보내고 결과를 사용자에게 알립니다.

이 함수는 이미지를 폼의 파일로 보내고, 서버가 받지 않으면 실패합니다.

```ts
async function upload(blob: Blob, type: string) {
  const body = new FormData()
  body.append('file', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents/42', { method: 'PUT', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

뷰어가 적용할 때 이 함수를 호출하고, 상태 줄이 결과를 알려 줍니다.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/documents/42.jpg',
  alt: '청구서 42',
  maxOutputSize: 3000,
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '저장 중…'
  try {
    await upload(blob, type)
    status.textContent = '저장됨'
  }
  catch {
    status.textContent = '문서를 저장하지 못했습니다'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef } from 'vue'
import '@paperpic/vue/style.css'

const status = shallowRef('')

async function save({ blob, type }: ExportedImage) {
  status.value = '저장 중…'
  try {
    await upload(blob, type)
    status.value = '저장됨'
  }
  catch {
    status.value = '문서를 저장하지 못했습니다'
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="청구서 42" :max-output-size="3000" @apply="save" />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useState } from 'react'
import '@paperpic/react/style.css'

export function Invoice() {
  const [status, setStatus] = useState('')

  async function save({ blob, type }: ExportedImage) {
    setStatus('저장 중…')
    try {
      await upload(blob, type)
      setStatus('저장됨')
    }
    catch {
      setStatus('문서를 저장하지 못했습니다')
    }
  }

  return (
    <>
      <div style={{ height: 480 }}>
        <PaperPic src="/documents/42.jpg" alt="청구서 42" maxOutputSize={3000} onApply={save} />
      </div>
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## 참고

- `role="status"`는 스크린 리더가 업로드 결과를 읽어 주게 합니다.
- [`maxOutputSize`](../reference/options#maxoutputsize)는 파일을 작게 유지합니다. 긴 변이 3000픽셀이어도 문서는 읽기 좋습니다.
- 적용한 뒤에는 기록이 비므로, 사용자가 이전 이미지로 실행 취소할 수 없습니다. 다시 시도 버튼을 두려면 마지막 `blob`과 `type`을 보관했다가 `upload`를 다시 호출하세요.
- 정리한 문서라면 서버는 PNG를 받고, 그렇지 않으면 원본 이미지의 형식을 받습니다. 다른 형식을 고르려면 [결과 저장](../guide/saving)을 참고하세요.
