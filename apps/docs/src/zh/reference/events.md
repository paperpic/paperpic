---
title: 事件
description: PaperPic 的事件 load、error、change、apply 和 download 及其携带的数据，以及如何在 JavaScript、Vue 和 React 中监听它们。
---

# 事件

事件告诉你的代码查看器中发生了什么。用 [`on()`](./methods#on) 监听它们。在 Vue 中它们是组件事件，例如 `@apply`；在 React 中它们是 props，例如 `onApply`。

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **载荷：** `{ width: number, height: number }`

图片已加载并显示。`width` 和 `height` 是它的像素尺寸。

## `error`

- **载荷：** `{ error: Error }`

图片无法加载，或修改无法应用。应用失败后，编辑保持打开。

## `change`

- **载荷：** [`PaperPicState`](./state)

用户改变了查看或编辑，例如缩放、打开工具或撤销。它也会以 `busy: true` 报告应用开始。`setOptions()` 和组件的 props 从不触发它。

## `apply`

- **载荷：** `{ blob: Blob, width: number, height: number, type: string }`

用户应用了修改，结果已经显示。`blob` 是格式为 `type` 的图片，格式由 [`output`](./options#output) 决定。

## `download`

- **载荷：** `{ source: string | Blob, filename: string, preventDefault: () => void }`

图片即将通过下载按钮或 [`download()`](./methods#download) 保存。`source` 是显示的图片：上一次应用的结果，没有则是 `src`。`filename` 是文件名。

调用 `preventDefault()` 可以阻止浏览器保存文件，例如为了用其他方式保存它：

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
