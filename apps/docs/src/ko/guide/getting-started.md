---
title: 시작하기
description: JavaScript, Vue, React용 PaperPic을 설치하고, 첫 문서 이미지를 보여 주고, 편집한 이미지를 받습니다.
---

# 시작하기

이 페이지는 PaperPic 설치부터 이미지를 보여 주고 편집 결과를 받는 데까지 안내합니다. 어느 예시에서든 프레임워크를 고르면 사이트의 다른 예시도 따라 바뀝니다.

## 설치

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue`에는 Vue 3.5 이상이 필요합니다.

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react`에는 React 19 이상이 필요합니다.

:::

## 이미지 보여 주기

뷰어는 컨테이너를 가득 채우므로 컨테이너에 높이를 지정하세요. 스타일시트는 앱에서 한 번만 가져옵니다.

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
  src: '/receipt.jpg',
  alt: '영수증',
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="영수증" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="영수증" />
    </div>
  )
}
```

:::

`src`에는 페이지와 같은 출처의 URL이나, 사용자가 `<input type="file">` 등으로 고른 `File`을 지정합니다. `alt`는 스크린 리더를 위한 이미지 설명입니다.

## 편집한 이미지 받기

도구 모음의 연필이 편집 모드를 시작합니다. 사용자가 변경을 적용하면 결과가 화면의 이미지를 대신하고, `apply` 이벤트가 결과를 코드에 넘깁니다.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="영수증" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="영수증" onApply={({ blob }) => upload(blob)} />
```

:::

여기서 `upload`는 직접 작성하는 코드입니다. 예를 들면 다음과 같습니다.

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

`blob`은 원본 이미지의 형식을 유지하고, 사용자가 문서를 정리했다면 PNG가 됩니다. [`output`](../reference/options#output) 옵션으로 바꿀 수 있습니다.

## 이미지만 보여 주기

바뀌면 안 되는 문서를 보여 주려면 `editable: false`로 편집을 끄세요. [뷰어](./viewer) 페이지에서 동작을 볼 수 있습니다.

## 요구 사항

- PaperPic은 [Baseline Widely Available](https://web.dev/baseline) 브라우저에서 동작합니다.
- 편집은 Web Worker에서 실행되며, Vite와 webpack 같은 번들러가 알아서 처리합니다. worker를 시작할 수 없으면 편집이 메인 스레드에서 실행됩니다. 여전히 동작하지만, 큰 이미지에서는 페이지가 잠깐 멈출 수 있습니다.
- Content Security Policy를 쓴다면 `worker-src 'self'`로 worker를, `img-src blob:`으로 이미지를 허용하세요. 뷰어는 첨부 파일과 결과를 `blob:` URL로 보여 주기 때문입니다.
- Nuxt나 Next.js 같은 서버 사이드 렌더링에서는 Vue와 React 컴포넌트가 서버에서 빈 요소를 렌더링하고 브라우저에서 뷰어를 만듭니다. 코어를 쓴다면 브라우저에서 직접 뷰어를 만드세요.

## 다음 단계

- [뷰어](./viewer): 확대/축소, 맞추기, 읽기 전용 사용.
- [편집](./editing): 편집 모드, 도구, 실행 취소, 적용.
- [옵션](../reference/options): 설정할 수 있는 모든 것.
