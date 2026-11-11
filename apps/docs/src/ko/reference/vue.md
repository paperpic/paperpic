---
title: Vue
description: Vue용 PaperPic 컴포넌트가 코어의 옵션, 이벤트, 메서드를 props, 컴포넌트 이벤트, 템플릿 ref에 어떻게 대응시키는지 설명합니다.
---

# Vue

`@paperpic/vue`는 뷰어를 Vue 3.5 이상용 컴포넌트로 감쌉니다. 옵션은 props, 이벤트는 컴포넌트 이벤트이고, 메서드는 컴포넌트가 노출하는 `instance`에 있습니다.

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // 편집한 이미지를 서버로 보냅니다
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="영수증" @apply="upload" />
  </div>
</template>
```

컴포넌트는 부모 요소를 가득 채우므로 부모 요소에 높이를 지정하세요.

## Props

각 [옵션](./options)은 같은 이름의 prop입니다. 예를 들어 `:editable="false"`나 `:aspect-ratio="210 / 297"`입니다. prop이 바뀌면 `setOptions()`를 통해 뷰어에 전달됩니다.

`:labels="{ apply: t('apply') }"`처럼 템플릿에서 만드는 객체와 배열은 부모가 렌더링할 때마다 새로 만들어지고, 뷰어는 매번 다시 받습니다. 대신 `computed`로 만드세요.

## 이벤트

| 이벤트     | 페이로드                               |
| ---------- | -------------------------------------- |
| `apply`    | `{ blob, width, height, type }`        |
| `change`   | [`PaperPicState`](./state)             |
| `download` | `{ source, filename, preventDefault }` |
| `error`    | `{ error }`                            |
| `load`     | `{ width, height }`                    |

각 이벤트는 [이벤트](./events)에서 설명합니다. prop이 바뀌어도 `change`는 발생하지 않습니다.

## 메서드

컴포넌트는 모든 [메서드](./methods)를 가진 뷰어를 `instance`로 노출합니다. 컴포넌트가 마운트되기 전에는 `null`입니다.

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    확대
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

같은 `src`를 다시 전달해도 이미지를 다시 불러오지 않으므로 편집 결과가 유지됩니다. 원본으로 돌아가려면 `instance.reload()`를 호출하세요.

## 타입

`@paperpic/vue`는 필요한 타입을 내보내므로 `@paperpic/core`를 설치할 필요가 없습니다. `PaperPicProps`, `PaperPicState`, `PaperPicEvents`, `PaperPicLabels`, `PaperPicOutput`, `PaperPicDownload`, `ExportedImage`, `ToolId`입니다.

## 서버 사이드 렌더링

Nuxt 같은 서버 사이드 렌더링에서는 컴포넌트가 서버에서 빈 요소를 렌더링하고, 브라우저에서 뷰어를 만듭니다.
