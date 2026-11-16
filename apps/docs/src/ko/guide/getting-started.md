---
title: 시작하기
description: JavaScript, Vue, React용 PaperPic을 설치하고, 첫 문서 이미지를 보여 주고, 편집한 이미지를 받습니다.
---

# 시작하기

이 페이지는 PaperPic 설치부터 이미지를 보여 주고 편집 결과를 받는 데까지 안내합니다. 어느 예시에서든 프레임워크를 고르면 사이트의 다른 예시도 따라 바뀝니다.

## 설치

::::tabs key:framework
== JavaScript

::: code-group

```sh [npm]
npm install @paperpic/core
```

```sh [pnpm]
pnpm add @paperpic/core
```

```sh [yarn]
yarn add @paperpic/core
```

```sh [bun]
bun add @paperpic/core
```

:::

== Vue

::: code-group

```sh [npm]
npm install @paperpic/vue
```

```sh [pnpm]
pnpm add @paperpic/vue
```

```sh [yarn]
yarn add @paperpic/vue
```

```sh [bun]
bun add @paperpic/vue
```

:::

`@paperpic/vue`에는 Vue 3.5 이상이 필요합니다.

== React

::: code-group

```sh [npm]
npm install @paperpic/react
```

```sh [pnpm]
pnpm add @paperpic/react
```

```sh [yarn]
yarn add @paperpic/react
```

```sh [bun]
bun add @paperpic/react
```

:::

`@paperpic/react`에는 React 19 이상이 필요합니다.

::::

### 번들러 없이 {#cdn}

core는 jsDelivr처럼 패키지 파일을 그대로 제공하는 CDN에서도 불러올 수 있습니다. 모듈 스크립트에서 `dist/index.js`를 가져오고 `dist/style.css`를 연결하세요.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: '영수증' })
</script>
```

브라우저는 페이지의 출처에서만 worker를 시작하므로, 이 경우 편집은 메인 스레드에서 실행됩니다. 동작은 하지만, 큰 사진은 적용 중에 페이지를 잠시 멈추게 합니다. worker를 쓰려면 파일을 자신의 출처에서 제공하거나 번들러를 쓰세요. Vue와 React 컴포넌트에는 번들러가 필요합니다.

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

`src`에는 페이지와 같은 출처의 URL이나, 사용자가 `<input type="file">` 등으로 고른 `File`을 지정합니다. `alt`는 스크린 리더를 위한 이미지 설명입니다. 다른 출처의 이미지, 형식, 불러오기 오류는 [이미지 불러오기](./loading)에서 다룹니다.

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

## 뷰어 제거하기 {#destroy}

Vue와 React 컴포넌트는 마운트될 때 뷰어를 만들고 언마운트될 때 제거합니다. core에서는 라우트가 바뀔 때처럼 뷰어를 페이지에서 뺄 때 [`destroy()`](../reference/methods#destroy)를 호출하세요.

```ts
pic.destroy()
```

뷰어를 컨테이너에서 빼고, 리스너와 worker를 멈추고, 이미지의 메모리를 해제합니다. 다시 보여 주려면 새로 만드세요.

## 이미지만 보여 주기

바뀌면 안 되는 문서를 보여 주려면 `editable: false`로 편집을 끄세요. [뷰어](./viewer) 페이지에서 동작을 볼 수 있습니다.

## 요구 사항

PaperPic은 [Baseline Widely Available](https://web.dev/baseline) 브라우저에서 동작합니다. worker, Content Security Policy, 서버 사이드 렌더링, 큰 사진은 [성능과 지원 환경](./performance)에서 다룹니다.

## 다음 단계

- [이미지 불러오기](./loading): 이미지를 가져오는 곳과 열 수 있는 형식.
- [뷰어](./viewer): 확대/축소, 맞추기, 읽기 전용 사용.
- [편집](./editing): 편집 모드, 도구, 실행 취소, 적용.
- [옵션](../reference/options): 설정할 수 있는 모든 것.
- [문제 해결](./troubleshooting): 뷰어가 제대로 보이지 않거나 동작하지 않을 때.
