---
title: Vue로 시작하기
description: "@paperpic/vue를 설치하고 Vue 3 앱에서 PaperPic 컴포넌트로 첫 번째 문서 이미지를 표시해 보세요."
---

# 시작하기

PaperPic은 개발 초기 단계입니다. 아래 API는 임시이며 앞으로 변경됩니다.

## 설치

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue`에는 Vue 3.5 이상이 필요합니다.

## 사용법

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function save({ blob }: { blob: Blob }) {
  // 편집한 이미지를 업로드합니다
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="스캔한 문서" @apply="save" />
  </div>
</template>
```

뷰어는 부모 요소를 가득 채우므로 부모 요소에 높이를 지정하세요. 연필은 편집 모드를 열고, `apply`는 편집한 이미지를 `Blob`으로 전달합니다. `:editable="false"`를 지정하면 읽기 전용 뷰어가 됩니다.

[플레이그라운드](/ko/playground)에서 바로 사용해 보세요.
