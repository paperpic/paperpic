---
title: 事件
description: PaperPic 的事件（load、error、change、apply 和 download）、每个事件携带的数据，以及如何在 JavaScript、Vue 和 React 中监听它们。
---

# 事件

事件告诉你的代码查看器中发生了什么。用 [`on()`](./methods#on) 监听它们。在 Vue 中它们是组件事件，例如 `@apply`；在 React 中它们是 props，例如 `onApply`。如果监听函数抛出错误，查看器会继续运行：页面会像收到任何未捕获的错误一样收到它，其他监听函数仍会执行。

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

- **载荷：** [`Size`](./types#size)

图片已加载并显示。`width` 和 `height` 是它的像素尺寸。每次加载 `src` 都会触发，使用 [`reload()`](./methods#reload) 时也会，但应用之后不会，应用的结果通过 [`apply`](#apply) 送达。

## `error`

- **载荷：** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

某个环节失败了，`phase` 说明是哪一个：

- `'load'`：图片无法加载。
- `'preview'`：某项编辑无法显示，例如图片对浏览器来说太大。编辑保持打开。
- `'apply'`：修改无法应用。编辑保持打开。

## `change`

- **载荷：** [`PaperPicState`](./state)

状态改变了，来自用户或方法，例如缩放、打开工具或撤销，或者因为“矫正”[找到了文档](../guide/tools/straighten#finding-the-document)。它发送完整的状态，与此刻 [`getState()`](./methods#getstate) 返回的相同。应用修改时会触发它两次：开始时带 `busy: true`，成功结束时在 [`apply`](#apply) 之后。

以下情况会改变状态，但不触发 `change`：

- 加载图片，由 [`load`](#load) 或 [`error`](#error) 报告。
- 应用失败，由 [`error`](#error) 报告。`busy` 回到 `false`。
- `setOptions()` 和组件的 props，这样双向绑定不会循环。
- 查看器尺寸变化，在适合方式生效时会改变 `zoom`。

平移图片不会触发任何事件，因为状态不包含图片的位置。[状态](./state#in-step)展示了如何让你自己的控件保持同步。

## `apply`

- **载荷：** [`ExportedImage`](./types#exportedimage)

通过按钮、`Enter` 或 [`apply()`](./methods#apply) 完成了应用，结果已经显示。`blob` 是格式为 `type` 的图片，格式由 [`output`](./options#output) 决定。

## `download`

- **载荷：** [`PaperPicDownload`](./types#paperpicdownload)

图片即将通过下载按钮或 [`download()`](./methods#download) 保存。`source` 是显示的图片：上一次应用的结果，没有则是 `src`。`filename` 是文件名。

调用 `preventDefault()` 可以阻止浏览器保存文件，例如为了用其他方式保存它：

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
