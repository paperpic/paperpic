---
title: React
description: React 版 PaperPic 组件如何把核心的选项、事件和方法对应到 props、回调 props 和 ref。
---

# React

`@paperpic/react` 把查看器封装成适用于 React 19 或更高版本的组件。选项是 props，事件是回调 props，方法位于 `ref` 接收到的查看器上。

```tsx
import type { ExportedImage } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

function upload({ blob }: ExportedImage) {
  // 把编辑后的图片发送到你的服务器
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" alt="一张收据" onApply={upload} />
    </div>
  )
}
```

组件会填满其父元素，因此请为父元素设置高度。

## Props

每个[选项](./options)都是同名的 prop，例如 `editable={false}` 或 `aspectRatio={210 / 297}`。另有两个 props 用于设置包含查看器的元素的样式：

| Prop        | 类型            | 说明                        |
| ----------- | --------------- | --------------------------- |
| `className` | `string`        | 追加到 `paperpic-host` 的类 |
| `style`     | `CSSProperties` | 内联样式                    |

`labels` 或 `tools` 这类对象和数组，每次变成新值时都会重新传给查看器。请在组件外定义它们，或使用 `useMemo`。

## 事件

| Prop         | 载荷                                   |
| ------------ | -------------------------------------- |
| `onLoad`     | `{ width, height }`                    |
| `onError`    | `{ error }`                            |
| `onChange`   | [`PaperPicState`](./state)             |
| `onApply`    | `{ blob, width, height, type }`        |
| `onDownload` | `{ source, filename, preventDefault }` |

每个事件见[事件](./events)。传入新函数不会重新创建查看器，因此可以使用内联函数。props 的变化从不调用 `onChange`。

## 方法

`ref` 接收类型为 `PaperPicInstance` 的查看器，带有所有[方法](./methods)。组件挂载之前它为 `null`：

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Viewer({ src }: { src: string }) {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>放大</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src={src} toolbar={false} />
      </div>
    </>
  )
}
```

再次传入相同的 `src` 不会重新加载图片，因此会保留编辑结果。要恢复原图，调用 `picRef.current.reload()`。

## 类型

`@paperpic/react` 导出了你需要的类型，因此无需安装 `@paperpic/core`：`PaperPicProps`、`PaperPicInstance`、`PaperPicState`、`PaperPicEvents`、`PaperPicLabels`、`PaperPicOutput`、`PaperPicDownload`、`ExportedImage` 和 `ToolId`。

## 服务端渲染

该组件标有 `'use client'`。在服务端渲染中，例如在 Next.js 里，它在服务器上渲染一个空元素，并在浏览器中创建查看器。
