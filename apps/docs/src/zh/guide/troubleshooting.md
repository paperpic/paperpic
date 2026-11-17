---
title: 故障排除
description: 当 PaperPic 查看器没有高度或样式、被 Tailwind CSS 改变、图片无法加载或无法编辑、应用时页面卡住，或大照片处理失败时该怎么办。
---

# 故障排除

PaperPic 的大多数问题来自配置，而不是图片本身。找到你看到的现象，下面就是解决办法。

## 查看器只是一条细线，或者看不到 {#no-height}

查看器会填满它的容器，而没有高度的容器会缩到查看器的最小高度 16rem。请给容器设置高度，例如 `height: 480px`，或者把它放进能给它高度的 flex 或 grid 布局中。[样式](./styling)展示了这两种做法。

## 按钮没有样式，控制台出现警告 {#no-stylesheet}

控制台显示 `PaperPic: the stylesheet is missing, so the viewer has no layout.`。请在应用中导入一次样式表：`@paperpic/core/style.css`，或 `@paperpic/vue`、`@paperpic/react` 的 `style.css`。

## Tailwind CSS 去掉了查看器的边框和内边距 {#tailwind}

当级联层的顺序不对时，Tailwind CSS 4 的重置样式会覆盖 PaperPic 的样式表。请在导入两者之前为各层命名，做法见[样式](./styling#tailwind)。

## 图片能显示，但编辑失败 {#other-origin}

[`error`](../reference/events#error) 表示图片来自其他源。浏览器不允许 PaperPic 读取这类图片的像素。请自己获取图片并传入 `Blob`，做法见[加载图片](./loading#fetch)。

## 图片无法加载 {#load-error}

查看器显示图片无法加载，`error` 带有 `phase: 'load'`。请确认 URL 存在，并且浏览器能打开该格式：HEIC 只能在 Safari 中打开，SVG 需要 `width` 和 `height` 属性。[加载图片](./loading#formats)列出了支持的格式。

## 应用时页面卡住 {#worker}

worker 没有启动，因此编辑在主线程上运行。它仍然能用，但大照片会让页面卡住片刻。常见原因有：

- Content Security Policy 没有 `worker-src 'self'`，或者要求 Trusted Types 却没有 `default` policy。[性能与兼容性](./performance)列出了需要允许的内容。
- 包是从 CDN 加载的，与页面不同源。浏览器只会从页面所在的源启动 worker。

在浏览器的网络面板中可以看到页面是否请求了 worker 文件，它的名字以 `worker` 开头。

## 处理大照片时应用失败 {#too-large}

`error` 显示 `The browser could not read an image of …` 或 `could not save an image of …`。浏览器会限制 canvas 的尺寸，iOS 上的 Safari 限制最严。请设置 [`maxOutputSize`](../reference/options#maxoutputsize)，例如 3000 像素，这样文档仍然清晰可读。

## 滚轮缩放了图片，而不是滚动页面 {#wheel}

设置 [`wheelZoom: false`](../reference/options#wheelzoom)。按钮、键盘和双指缩放仍然可以缩放。
