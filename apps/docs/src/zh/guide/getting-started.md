---
title: 快速开始
description: 为 JavaScript、Vue 或 React 安装 PaperPic，显示你的第一张文档图片，并取回编辑后的图片。
---

# 快速开始

本页带你从安装 PaperPic 到显示图片并取回编辑结果。在任意示例中选择你的框架，站点上的其他示例都会随之切换。

## 安装

:::tabs key:framework
== JavaScript

```sh
pnpm add @paperpic/core
```

== Vue

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` 需要 Vue 3.5 或更高版本。

== React

```sh
pnpm add @paperpic/react
```

`@paperpic/react` 需要 React 19 或更高版本。

:::

## 显示图片

查看器会填满它的容器，因此请为容器设置高度。在你的应用中导入一次样式表。

:::tabs key:framework
== JavaScript

```html
<div id="viewer" style="height: 480px"></div>
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  alt: '一张收据',
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
    <PaperPic src="/receipt.jpg" alt="一张收据" />
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
      <PaperPic src="/receipt.jpg" alt="一张收据" />
    </div>
  )
}
```

:::

`src` 接受与页面同源的 URL，或用户选择的 `File`，例如来自 `<input type="file">`。`alt` 为屏幕阅读器描述图片。

## 取回编辑后的图片

工具栏中的铅笔会开启编辑模式。用户应用修改后，结果会替换显示的图片，`apply` 事件会把它交给你的代码：

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="一张收据" @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="一张收据" onApply={({ blob }) => upload(blob)} />
```

:::

这里的 `upload` 代表你自己的代码，例如：

```ts
async function upload(blob: Blob) {
  const body = new FormData()
  body.append('image', blob)
  await fetch('/api/documents', { method: 'POST', body })
}
```

`blob` 保留原图的格式；如果用户清理了文档，则为 PNG。[`output`](../reference/options#output) 选项可以改变它。

## 只显示图片

要显示不应被修改的文档，用 `editable: false` 关闭编辑。[查看器](./viewer)页面展示了它的效果。

## 要求

- PaperPic 可在 [Baseline Widely Available](https://web.dev/baseline) 的浏览器中运行。
- 编辑在 Web Worker 中运行，Vite 和 webpack 等打包工具会自动处理它。如果 worker 无法启动，编辑会在主线程上运行：仍然可用，但处理大图片时页面可能短暂卡顿。
- 使用 Content Security Policy 时，用 `worker-src 'self'` 允许 worker，并允许 `img-src blob:`，因为查看器通过 `blob:` URL 显示添加的文件和结果。
- 在服务端渲染中，例如在 Nuxt 或 Next.js 里，Vue 和 React 组件在服务器上渲染一个空元素，并在浏览器中创建查看器。使用核心时，请自己在浏览器中创建查看器。

## 下一步

- [查看器](./viewer)：缩放、适合和只读用法。
- [编辑](./editing)：编辑模式、工具、撤销和应用。
- [选项](../reference/options)：所有可配置的内容。
