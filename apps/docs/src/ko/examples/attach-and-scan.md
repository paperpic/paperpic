---
title: 첨부하고 스캔하기
description: 사용자가 문서를 찍거나 파일을 고르고, PaperPic에서 기울기를 보정하고 정리한 뒤, 결과를 서버로 보내는 완전한 예제입니다. JavaScript, Vue, React 버전이 있습니다.
---

# 첨부하고 스캔하기

문서를 받는 앱은 대부분 경비 처리용 영수증이나 서명한 양식처럼 문서 사진을 사용자에게 요청합니다. 이 예제에서는 사용자가 사진을 찍거나 파일을 고르고, PaperPic에서 편집한 뒤, 결과를 서버로 보냅니다.

`upload`는 [서버에 업로드](./upload)의 함수로, 이미지를 보내고 서버가 받지 않으면 실패합니다.

:::tabs key:framework
== JavaScript

```html
<label>
  문서 사진
  <input id="photo" type="file" accept="image/*" capture="environment" />
</label>
<div id="viewer" style="height: 480px"></div>
<p id="status" role="status"></p>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const input = document.querySelector<HTMLInputElement>('#photo')!
const status = document.querySelector('#status')!

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  alt: '첨부한 문서',
  maxOutputSize: 3000,
})

input.addEventListener('change', () => {
  const file = input.files?.[0]
  if (file) {
    status.textContent = ''
    pic.setOptions({ src: file })
  }
})

// 사진이 화면에 나오면 바로 편집을 시작합니다
pic.on('load', () => pic.edit())

pic.on('error', ({ phase }) => {
  if (phase === 'load') {
    status.textContent = '이 파일은 브라우저가 열 수 있는 이미지가 아닙니다'
  }
})

pic.on('apply', async ({ blob, type }) => {
  status.textContent = '보내는 중…'
  try {
    await upload(blob, type)
    status.textContent = '보냈습니다'
  }
  catch {
    status.textContent = '문서를 보내지 못했습니다'
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { ExportedImage, PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import { shallowRef, useTemplateRef } from 'vue'
import '@paperpic/vue/style.css'

const pic = useTemplateRef('pic')
const photo = shallowRef<File>()
const status = shallowRef('')

function choose(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    status.value = ''
    photo.value = file
  }
}

function failed({ phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    status.value = '이 파일은 브라우저가 열 수 있는 이미지가 아닙니다'
  }
}

async function send({ blob, type }: ExportedImage) {
  status.value = '보내는 중…'
  try {
    await upload(blob, type)
    status.value = '보냈습니다'
  }
  catch {
    status.value = '문서를 보내지 못했습니다'
  }
}
</script>

<template>
  <label>
    문서 사진
    <input type="file" accept="image/*" capture="environment" @change="choose">
  </label>
  <div v-if="photo" style="height: 480px">
    <PaperPic
      ref="pic"
      :src="photo"
      alt="첨부한 문서"
      :max-output-size="3000"
      @load="pic?.instance?.edit()"
      @error="failed"
      @apply="send"
    />
  </div>
  <p role="status">
    {{ status }}
  </p>
</template>
```

== React

```tsx
import type { ExportedImage, PaperPicEvents, PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef, useState } from 'react'
import '@paperpic/react/style.css'

export function AttachDocument() {
  const picRef = useRef<PaperPicInstance>(null)
  const [photo, setPhoto] = useState<File>()
  const [status, setStatus] = useState('')

  function choose(file: File | undefined) {
    if (file) {
      setStatus('')
      setPhoto(file)
    }
  }

  function failed({ phase }: PaperPicEvents['error']) {
    if (phase === 'load') {
      setStatus('이 파일은 브라우저가 열 수 있는 이미지가 아닙니다')
    }
  }

  async function send({ blob, type }: ExportedImage) {
    setStatus('보내는 중…')
    try {
      await upload(blob, type)
      setStatus('보냈습니다')
    }
    catch {
      setStatus('문서를 보내지 못했습니다')
    }
  }

  return (
    <>
      <label>
        문서 사진
        <input type="file" accept="image/*" capture="environment" onChange={event => choose(event.target.files?.[0])} />
      </label>
      {photo && (
        <div style={{ height: 480 }}>
          <PaperPic
            ref={picRef}
            src={photo}
            alt="첨부한 문서"
            maxOutputSize={3000}
            onLoad={() => picRef.current?.edit()}
            onError={failed}
            onApply={send}
          />
        </div>
      )}
      <p role="status">{status}</p>
    </>
  )
}
```

:::

## 참고

- `capture="environment"`는 휴대폰에서 후면 카메라를 열고, 컴퓨터는 이를 무시합니다. 이 속성이 없으면 휴대폰이 카메라와 사진 보관함을 함께 보여 주므로, 사용자가 이미 가진 문서에 알맞습니다.
- 사진을 불러오면 뷰어가 편집 모드로 열리므로 사용자는 바로 기울기 보정이나 정리로 갈 수 있습니다. 사진을 먼저 보여 주려면 `load` 리스너를 빼세요.
- `phase: 'load'`로 Safari 밖의 HEIC 사진처럼 브라우저가 열 수 없는 파일과 실패한 편집을 구분할 수 있습니다. 형식 목록은 [이미지 불러오기](../guide/loading#formats)에 있습니다.
- 적용이 `upload`를 호출하기 전까지 사진은 브라우저 안에 있습니다. PaperPic은 스스로 아무것도 보내지 않습니다.
- [`maxOutputSize`](../reference/options#maxoutputsize)로 업로드를 작게 유지할 수 있습니다. 휴대폰 사진은 1200만 화소 이상이지만, 문서는 긴 변이 3000픽셀이어도 충분히 읽힙니다.
