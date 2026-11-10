---
title: 性能与兼容性
description: PaperPic 在哪里完成工作，打包工具、Content Security Policy 和服务端渲染需要什么，它如何处理手机拍的大照片，以及支持哪些浏览器。
---

# 性能与兼容性

手机照片有 1200 万像素甚至更多，编辑它们是实打实的计算。本页说明这些计算在哪里进行，你的构建和服务器需要什么，以及 PaperPic 支持哪些浏览器。

## 由 Web Worker 完成工作

在手机上处理一张 1200 万像素的照片时，“清理”和“矫正”都要花一秒以上。如果放在主线程上，页面在这段时间里会卡住。因此 PaperPic 在 Web Worker 中运行它们，应用期间页面依然可以响应。

worker 随包提供，并通过标准的 `new Worker(new URL(…, import.meta.url))` 启动，Vite 和 webpack 5 等打包工具无需配置就能自动处理。如果 worker 无法启动，编辑会在主线程上运行：仍然可用，但处理大图片时页面可能短暂卡顿。

## Content Security Policy

使用 Content Security Policy 时，请允许：

- `worker-src 'self'`，用于 worker。
- `img-src blob:`，因为查看器通过 `blob:` URL 显示添加的文件和应用的结果。

## 大照片

- **编辑时**，预览在一份约 200 万像素的副本上进行，因此无论照片多大，滑块和工具都保持流畅。
- **应用时**，每项修改都以完整分辨率计算。大照片需要几秒钟，因此查看器会显示一条消息，并在此期间锁定控件。
- **为了节省时间和内存**，请设置 [`maxOutputSize`](../reference/options#maxoutputsize)。2000 或 3000 像素之类的上限既能保持文档清晰可读，又能让应用更快、文件更小。

## 接受的图片

`src` 接受与页面同源的 URL，或在客户端添加的 `File` 或 `Blob`。PaperPic 会读取图片的像素，而浏览器只允许通过 CORS 读取其他来源的图片，PaperPic 不会发起 CORS 请求。请从你自己的域名提供图片，或者自己获取图片后传入 `Blob`。

## 服务端渲染

PaperPic 需要浏览器。在 Nuxt 或 Next.js 等服务端渲染中，Vue 和 React 组件在服务器上渲染一个空元素，并在浏览器中创建查看器。使用核心时，请自己在浏览器中创建查看器，例如在组件挂载时。

## 浏览器支持

PaperPic 支持 [Baseline Widely Available](https://web.dev/baseline) 的浏览器：即在所有主流浏览器中可用至少 30 个月的功能。各个包都是针对这个目标构建的，因此无需再转译。
