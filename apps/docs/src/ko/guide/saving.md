---
title: 결과 저장
description: PaperPic이 편집한 이미지를 어떻게 넘겨주는지, 형식과 크기를 고르는 방법, 업로드 방법, 다운로드 버튼과 그 이벤트의 동작을 설명합니다.
---

# 결과 저장

PaperPic은 아무것도 업로드하거나 저장하지 않습니다. 사용자가 변경을 적용하면 결과를 코드에 넘기고, 어디로 보낼지는 앱이 정합니다. 이 페이지는 무엇을 받는지와 어떻게 저장하는지를 다룹니다.

## `apply` 이벤트

‘적용’은 결과를 계산하고 다음 내용으로 [`apply`](../reference/events#apply)를 발생시킵니다.

| 필드              | 타입     | 설명                    |
| ----------------- | -------- | ----------------------- |
| `blob`            | `Blob`   | 편집한 이미지           |
| `type`            | `string` | 형식, 예: `'image/png'` |
| `width`, `height` | `number` | 픽셀 단위 크기          |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', result => upload(result))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" @apply="upload" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" onApply={upload} />
```

:::

적용한 뒤에는 결과가 화면의 이미지가 되고, 기록이 비워지며, 다음 편집은 결과에서 시작합니다. [`reload()`](../reference/methods#reload)는 원래 `src`를 되돌립니다.

## 업로드하기

`blob`을 폼의 파일로 보내세요.

```ts
async function upload({ blob, type }: { blob: Blob, type: string }) {
  const body = new FormData()
  body.append('image', blob, `document.${type.split('/')[1]}`)
  const response = await fetch('/api/documents', { method: 'POST', body })
  if (!response.ok) {
    throw new Error(`The upload failed with status ${response.status}`)
  }
}
```

뷰어는 서버에 도착했는지와 관계없이 결과를 바로 보여 주므로, 업로드에 실패하면 사용자에게 알려 주세요.

## 형식과 품질

옵션이 없으면 결과는 원본 이미지의 형식(JPEG, PNG, WebP)을 유지합니다. 정리한 문서는 PNG가 됩니다. JPEG는 선명한 가장자리 주변에 잡티를 만들기 때문입니다. GIF 같은 그 밖의 원본은 PNG가 됩니다.

[`output`](../reference/options#output)으로 형식과, JPEG와 WebP의 품질을 0부터 1까지로 고릅니다. 품질 기본값은 0.92입니다.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  output: { type: 'image/webp', quality: 0.8 },
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :output="{ type: 'image/webp', quality: 0.8 }" />
```

== React

```tsx
const output = { type: 'image/webp', quality: 0.8 }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" output={output} />
}
```

:::

| 형식         | 알맞은 용도                          |
| ------------ | ------------------------------------ |
| `image/png`  | 정리한 문서와 글자, 손실 없음        |
| `image/jpeg` | 사진과 컬러 문서, 작은 파일          |
| `image/webp` | 사진과 컬러 문서, JPEG보다 작은 파일 |

브라우저가 요청한 형식을 인코딩할 수 없으면 PNG가 되므로, 이벤트의 `type`을 확인하세요.

## 크기

결과는 원본의 해상도를 그대로 유지하며, 휴대폰 사진은 12메가픽셀 이상인 경우가 많습니다. [`maxOutputSize`](../reference/options#maxoutputsize)로 긴 변을 픽셀 단위로 제한할 수 있습니다.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  maxOutputSize: 2000,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" :max-output-size="2000" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" maxOutputSize={2000} />
```

:::

편집 중 미리보기는 항상 약 2메가픽셀이므로, `maxOutputSize`는 결과만 바꿉니다.

## 다운로드 버튼

[`download: true`](../reference/options#download)는 도구 모음 끝에 화면의 이미지를 저장하는 버튼을 더합니다. 저장되는 것은 마지막 적용의 결과이고, 없으면 원본 이미지 그대로입니다. 편집 중에는 변경이 아직 적용되지 않았으므로 버튼이 숨겨집니다. [`download()`](../reference/methods#download)는 버튼이 있든 없든 코드에서 같은 일을 합니다. 뷰어 위에서는 브라우저의 컨텍스트 메뉴가 열리지 않으므로, 이 버튼으로 이미지를 저장합니다.

파일은 원본의 이름을 유지하고 형식에 맞는 확장자를 붙입니다. 그래서 정리한 `receipt.jpg`는 `receipt.png`로 저장됩니다. [`filename`](../reference/options#filename)으로 다른 이름을 지정할 수 있습니다. `Blob`처럼 이름이 전혀 없으면 파일 이름은 `image`입니다.

### 다른 방법으로 저장하기

[`download`](../reference/events#download) 이벤트는 브라우저가 파일을 저장하기 전에 발생합니다. `preventDefault()`를 호출하면 다른 방법으로 저장할 수 있습니다. 예를 들어 서버에서 저장하면 파일 이름을 정하고 누가 내려받는지 확인할 수 있습니다.

:::tabs key:framework
== JavaScript

```ts
pic.on('download', ({ preventDefault }) => {
  preventDefault()
  window.location.assign('/api/documents/42/file')
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicDownload } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}
</script>

<template>
  <PaperPic src="/receipt.jpg" download @download="download" />
</template>
```

== React

```tsx
import type { PaperPicDownload } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function download({ preventDefault }: PaperPicDownload) {
  preventDefault()
  window.location.assign('/api/documents/42/file')
}

export function Receipt() {
  return <PaperPic src="/receipt.jpg" download onDownload={download} />
}
```

:::
