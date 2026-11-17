---
title: 이미지 불러오기
description: URL, 사용자가 고른 파일, 가져온 Blob으로 PaperPic에 이미지를 주는 방법, 열 수 있는 형식, 그리고 이미지를 불러왔는지 실패했는지 코드에서 아는 방법.
---

# 이미지 불러오기

PaperPic은 `src`로 전달한 이미지를 보여 줍니다. 이 페이지에서는 그 이미지를 어디서 가져올 수 있는지, 어떤 형식이 열리는지, 이미지가 준비되었거나 실패했음을 코드에서 어떻게 아는지 설명합니다.

## 이미지를 가져오는 곳

`src`에는 다음 세 가지 중 하나를 줄 수 있습니다.

- **페이지와 같은 출처의 URL**. 예: `/documents/42.jpg`.
- 사용자가 `<input type="file">`로 고른 **`File`**. 카메라부터 업로드까지의 흐름은 [첨부하고 스캔하기](../examples/attach-and-scan)에 있습니다.
- 응답 본문처럼 코드가 가진 **`Blob`**.

`File`이나 `Blob`이면 PaperPic이 필요한 `blob:` URL을 만들고, 이미지가 바뀌거나 뷰어가 제거될 때 해제합니다.

## 다른 출처의 이미지나 로그인이 필요한 이미지 {#fetch}

PaperPic은 이미지를 편집하려고 픽셀을 읽습니다. 다른 출처의 이미지는 CORS와 함께 도착할 때만 브라우저가 이를 허용하는데, PaperPic은 CORS를 요청하지 않습니다. 그런 이미지는 화면에 나오지만 편집할 수는 없습니다. 변경에 픽셀이 필요해지는 순간이나 적용할 때 그 이유를 알리는 [`error`](../reference/events#error)가 옵니다.

이미지를 직접 가져와서 `Blob`을 `src`로 넘기세요. 요청에 사용자의 쿠키가 함께 가므로, 로그인이 필요한 이미지에도 쓸 수 있습니다.

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

페이지에서 보내는 다른 `fetch`와 마찬가지로, 상대 서버는 CORS로 여러분의 출처를 허용해야 합니다.

## 형식 {#formats}

PaperPic은 브라우저가 `<img>`로 보여 주는 형식을 모두 엽니다.

- **JPEG, PNG, WebP, AVIF**는 [지원하는 브라우저](./performance#browser-support) 모두에서 열립니다.
- **SVG**는 파일에 `width`와 `height` 속성이 있을 때 열립니다. 없으면 크기가 없어 불러오기에 실패합니다.
- **HEIC**는 iPhone 사진의 형식으로, Safari에서만 열립니다. iPhone 사용자가 `<input type="file" accept="image/*">`로 사진을 고르면 iOS는 보통 JPEG 사본을 페이지에 넘깁니다. 다른 경로로 다른 브라우저에 도착한 HEIC 파일은 불러오지 못합니다.

휴대폰은 사진을 옆으로 저장하고, 어떻게 돌릴지를 EXIF 태그에 적어 두는 경우가 많습니다. PaperPic은 `<img>`처럼 태그대로 사진을 보여 주며, 적용의 결과도 바른 방향으로 나옵니다.

## 불러오기 성공과 실패 알기

[`load`](../reference/events#load) 이벤트는 이미지가 화면에 나왔음을 크기와 함께 알립니다. 이미지가 없거나, 이미지가 아니거나, 브라우저가 디코딩하지 못해 불러올 수 없으면 뷰어가 메시지를 보여 주고, [`error`](../reference/events#error) 이벤트가 `phase: 'load'`와 함께 옵니다.

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: '청구서 42' })

pic.on('load', ({ width, height }) => {
  console.log(`이미지 크기는 ${width}×${height}픽셀입니다`)
})
pic.on('error', ({ error, phase }) => {
  if (phase === 'load') {
    console.error(error.message)
  }
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicEvents } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`이미지 크기는 ${width}×${height}픽셀입니다`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="청구서 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`이미지 크기는 ${width}×${height}픽셀입니다`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="청구서 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

`load`는 `src`를 불러올 때마다 발생하며 [`reload()`](../reference/methods#reload)에서도 발생하지만, 적용 뒤에는 발생하지 않습니다. 결과는 [`apply`](../reference/events#apply) 이벤트로 옵니다.

[`getState()`](../reference/state)의 `status`도 언제든 같은 답을 줍니다. 값은 `'empty'`, `'loading'`, `'ready'`, `'error'` 중 하나입니다.

## 이미지 바꾸기와 다시 불러오기

- **새 `src`**를 주면 새 이미지를 불러옵니다. 사용자가 편집 중이면 편집을 버립니다.
- **같은 `src`**를 주면 아무 일도 일어나지 않으므로, 적용의 결과가 화면에 그대로 남습니다.
- **[`reload()`](../reference/methods#reload)**는 현재 `src`를 다시 불러오며, 적용 뒤에 원본을 되돌립니다. 편집 중에 호출하면 변경도 버립니다.
