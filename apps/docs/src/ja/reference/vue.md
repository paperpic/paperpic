---
title: Vue
description: Vue 用の PaperPic コンポーネントが、コアのオプション、イベント、メソッドを props、コンポーネントのイベント、テンプレート ref にどう対応させるか。
---

# Vue

`@paperpic/vue` は、ビューアーを Vue 3.5 以降のコンポーネントでラップします。オプションは props、イベントはコンポーネントのイベントになり、メソッドはコンポーネントが公開する `instance` にあります。

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // 編集した画像をサーバーに送ります
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="レシート" @apply="upload" />
  </div>
</template>
```

コンポーネントは親要素いっぱいに広がるため、親要素に高さを指定してください。

## Props

各[オプション](./options)は同じ名前の prop です。たとえば `:editable="false"` や `:aspect-ratio="210 / 297"` です。prop の変更は `setOptions()` を通じてビューアーに届きます。

`:labels="{ apply: t('apply') }"` のようにテンプレートで作るオブジェクトや配列は、親がレンダーするたびに新しくなり、ビューアーはそのつど受け取り直します。代わりに `computed` で作ってください。

## イベント

| イベント   | データ                                         |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error }`                                    |
| `load`     | [`Size`](./types#size)                         |

各イベントは[イベント](./events)で説明しています。prop の変更で `change` は発生しません。

## メソッド

コンポーネントは、すべての[メソッド](./methods)を持つビューアーを `instance` として公開します。コンポーネントがマウントされるまでは `null` です。

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    拡大
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

同じ `src` をもう一度渡しても画像は再読み込みされないため、編集の結果が残ります。元画像に戻すには `instance.reload()` を呼び出します。

## 型 {#types}

`@paperpic/vue` は `@paperpic/core` のすべての型をエクスポートしているため、`@paperpic/core` をインストールする必要はありません。各型は[型](./types)で確認できます。コンポーネントの型もエクスポートしています。props を表す [`PaperPicProps`](./types#paperpicprops) と、`instance` のビューアーを表す [`PaperPicInstance`](./types#paperpicinstance) です。

## サーバーサイドレンダリング

Nuxt などのサーバーサイドレンダリングでは、コンポーネントはサーバーで空の要素を描画し、ブラウザーでビューアーを作成します。
