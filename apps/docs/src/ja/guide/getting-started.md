---
title: Vue ではじめる
description: "@paperpic/vue をインストールし、Vue 3 アプリの PaperPic コンポーネントで最初の文書画像を表示します。"
---

# はじめに

PaperPic は開発の初期段階にあります。以下の API は暫定的なもので、今後変更されます。

## インストール

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` には Vue 3.5 以降が必要です。

## 使い方

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="スキャンした文書" :editable="false" />
  </div>
</template>
```

ビューアーは親要素いっぱいに広がるため、親要素に高さを指定してください。

[プレイグラウンド](/ja/playground)で実際に試せます。
