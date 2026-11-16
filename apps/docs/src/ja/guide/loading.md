---
title: 画像の読み込み
description: URL、ユーザーが選んだファイル、取得した Blob から PaperPic に画像を渡す方法、開ける形式、そして画像の読み込みの成功や失敗をコードで知る方法。
---

# 画像の読み込み

PaperPic は `src` に渡した画像を表示します。このページでは、その画像をどこから渡せるか、どの形式が開けるか、画像の準備ができたことや失敗したことをコードでどう知るかを説明します。

## 画像の渡し方

`src` には次の 3 つのどれかを渡せます。

- **ページと同じオリジンの URL**。たとえば `/documents/42.jpg`。
- ユーザーが `<input type="file">` で選んだ **`File`**。カメラからアップロードまでの流れは[添付してスキャン](../examples/attach-and-scan)にあります。
- レスポンスの本文など、コードが持っている **`Blob`**。

`File` や `Blob` の場合、PaperPic は必要な `blob:` URL を自分で作り、画像が変わったときやビューアーを破棄したときに解放します。

## 別のオリジンの画像やログインが必要な画像 {#fetch}

PaperPic は画像を編集するためにそのピクセルを読み取ります。別のオリジンの画像では、CORS 付きで届いた場合にしかブラウザーはこれを許可せず、PaperPic は CORS を要求しません。そうした画像は表示されますが、最初の編集が失敗し、理由を伝える [`error`](../reference/events#error) が届きます。

画像は自分で取得し、`Blob` を `src` に渡してください。リクエストにユーザーの Cookie が付くので、ログインが必要な画像にも使えます。

```ts
async function fetchImage(url: string): Promise<Blob> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`The image could not be fetched: status ${response.status}`)
  }
  return response.blob()
}
```

ページからの `fetch` と同じく、相手のサーバーは CORS であなたのオリジンを許可している必要があります。

## 形式 {#formats}

PaperPic は、ブラウザーが `<img>` で表示できる形式をすべて開けます。

- **JPEG、PNG、WebP、AVIF** は、[対応ブラウザー](./performance#browser-support)のすべてで開けます。
- **SVG** は、ファイルに `width` と `height` の属性があれば開けます。ないとサイズがなく、読み込みに失敗します。
- **HEIC** は iPhone の写真の形式で、Safari でしか開けません。iPhone のユーザーが `<input type="file" accept="image/*">` で写真を選ぶと、iOS はたいてい JPEG のコピーをページに渡します。別の経路で他のブラウザーに届いた HEIC ファイルは読み込めません。

スマートフォンは写真を横向きで保存し、回転のしかたを EXIF タグに書くことがよくあります。PaperPic は `<img>` と同じくタグのとおりに写真を表示し、適用の結果も正しい向きになります。

## 読み込みの成功と失敗を知る

[`load`](../reference/events#load) イベントは、画像が表示されたことをサイズとともに知らせます。画像がない、画像ではない、ブラウザーがデコードできないなどの理由で読み込めないときは、ビューアーにメッセージが表示され、[`error`](../reference/events#error) イベントが `phase: 'load'` 付きで届きます。

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/documents/42.jpg', alt: '請求書 42' })

pic.on('load', ({ width, height }) => {
  console.log(`画像は ${width}×${height} ピクセルです`)
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
  console.log(`画像は ${width}×${height} ピクセルです`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/documents/42.jpg" alt="請求書 42" @load="loaded" @error="failed" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicEvents } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

function loaded({ width, height }: PaperPicEvents['load']) {
  console.log(`画像は ${width}×${height} ピクセルです`)
}

function failed({ error, phase }: PaperPicEvents['error']) {
  if (phase === 'load') {
    console.error(error.message)
  }
}

export function Invoice() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/documents/42.jpg" alt="請求書 42" onLoad={loaded} onError={failed} />
    </div>
  )
}
```

:::

[`getState()`](../reference/state) の `status` でも、いつでも同じことがわかります。値は `'empty'`、`'loading'`、`'ready'`、`'error'` のどれかです。

## 画像の変更と再読み込み

- **新しい `src`** を渡すと、新しい画像を読み込みます。ユーザーが編集中なら、その編集は破棄されます。
- **同じ `src`** を渡しても何も起きないので、適用の結果は表示されたままです。
- **[`reload()`](../reference/methods#reload)** は現在の `src` を読み込み直し、適用のあとでも元の画像に戻せます。
