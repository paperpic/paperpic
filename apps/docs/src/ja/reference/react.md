---
title: React
description: React 用の PaperPic コンポーネントが、コアのオプション、イベント、メソッドを props、コールバック props、ref にどう対応させるか。
---

# React

`@paperpic/react` は、ビューアーを React 19 以降のコンポーネントでラップします。オプションは props、イベントはコールバック props になり、メソッドは `ref` が受け取るビューアーにあります。

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // 編集した画像をサーバーに送ります
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="レシート" onApply={upload} />
    </div>
  )
}
```

コンポーネントは親要素いっぱいに広がるため、親要素に高さを指定してください。

## Props

各[オプション](./options)は同じ名前の prop です。たとえば `editable={false}` や `aspectRatio={210 / 297}` です。さらに 2 つの props で、ビューアーを含む要素のスタイルを指定できます。

| Prop        | 型              | 説明                             |
| ----------- | --------------- | -------------------------------- |
| `className` | `string`        | `paperpic-host` に追加するクラス |
| `style`     | `CSSProperties` | インラインスタイル               |

`labels` や `tools` のようなオブジェクトや配列は、新しくなるたびにビューアーに届き直します。コンポーネントの外で定義するか、`useMemo` を使ってください。

## イベント

| Prop         | データ                                 |
| ------------ | -------------------------------------- |
| `onApply`    | `{ blob, width, height, type }`        |
| `onChange`   | [`PaperPicState`](./state)             |
| `onDownload` | `{ source, filename, preventDefault }` |
| `onError`    | `{ error }`                            |
| `onLoad`     | `{ width, height }`                    |

各イベントは[イベント](./events)で説明しています。新しい関数を渡してもビューアーは作り直されないため、インライン関数で問題ありません。props の変更で `onChange` が呼ばれることはありません。

## メソッド

`ref` は、すべての[メソッド](./methods)を持つ `PaperPicInstance` 型のビューアーを受け取ります。コンポーネントがマウントされるまでは `null` です。

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>拡大</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

同じ `src` をもう一度渡しても画像は再読み込みされないため、編集の結果が残ります。元画像に戻すには `picRef.current.reload()` を呼び出します。

## 型

`@paperpic/react` は必要な型をエクスポートしているため、`@paperpic/core` をインストールする必要はありません。`PaperPicProps`、`PaperPicInstance`、`PaperPicState`、`PaperPicEvents`、`PaperPicLabels`、`PaperPicOutput`、`PaperPicDownload`、`ExportedImage`、`ToolId` です。

## サーバーサイドレンダリング

このコンポーネントには `'use client'` が付いています。Next.js などのサーバーサイドレンダリングでは、サーバーで空の要素を描画し、ブラウザーでビューアーを作成します。
