---
title: 快速开始
description: 为 JavaScript、Vue 或 React 安装 PaperPic，显示你的第一张文档图片，并取回编辑后的图片。
---

# 快速开始

本页带你从安装 PaperPic 到显示图片并取回编辑结果。在任意示例中选择你的框架，站点上的其他示例都会随之切换。

## 安装

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

`@paperpic/vue` 需要 Vue 3.5 或更高版本。

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

`@paperpic/react` 需要 React 19 或更高版本。

::::

### 不使用打包工具 {#cdn}

core 也可以从原样提供包文件的 CDN 加载，例如 jsDelivr。在模块脚本中导入 `dist/index.js`，并链接 `dist/style.css`：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/style.css" />
<div id="viewer" style="height: 480px"></div>
<script type="module">
  import { PaperPic } from 'https://cdn.jsdelivr.net/npm/@paperpic/core@0.3/dist/index.js'

  const pic = new PaperPic(document.querySelector('#viewer'), { src: '/receipt.jpg', alt: '一张收据' })
</script>
```

浏览器只会从页面所在的源启动 worker，因此这种情况下编辑在主线程上运行：它能用，但应用大照片时页面会卡住片刻。如果想保留 worker，请从你自己的源提供这些文件，或者使用打包工具。Vue 和 React 组件需要打包工具。

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

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, {
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

`src` 接受与页面同源的 URL，或用户选择的 `File`，例如来自 `<input type="file">`。`alt` 为屏幕阅读器描述图片。 [加载图片](./loading)介绍了其他源的图片、格式和加载错误。

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

## 移除查看器 {#destroy}

Vue 和 React 组件会在挂载时创建查看器，在卸载时销毁它。使用 core 时，当你把查看器从页面上移除（例如切换路由）时，请调用 [`destroy()`](../reference/methods#destroy)：

```ts
pic.destroy()
```

它会把查看器从容器中移除，停止它的监听器和 worker，并释放图片占用的内存。要再次显示，请新建一个。

## 只显示图片

要显示不应被修改的文档，用 `editable: false` 关闭编辑。[查看器](./viewer)页面展示了它的效果。

## 要求

PaperPic 可在 [Baseline Widely Available](https://web.dev/baseline) 的浏览器中运行。[性能与兼容性](./performance)介绍了 worker、Content Security Policy、服务端渲染和大照片。

## 下一步

- [加载图片](./loading)：图片从哪里来，以及哪些格式可以打开。
- [查看器](./viewer)：缩放、适合和只读用法。
- [编辑](./editing)：编辑模式、工具、撤销和应用。
- [选项](../reference/options)：所有可配置的内容。
- [故障排除](./troubleshooting)：当查看器的外观或行为不正常时。
