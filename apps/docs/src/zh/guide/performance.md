---
title: 性能与兼容性
description: PaperPic 在哪里完成工作，打包工具、Content Security Policy 和服务端渲染需要什么，它如何处理手机拍的大照片，以及支持哪些浏览器。
---

# 性能与兼容性

手机照片有 1200 万像素甚至更多，编辑它们是实打实的计算。本页说明这些计算在哪里进行，你的构建和服务器需要什么，以及 PaperPic 支持哪些浏览器。

## 由 Web Worker 完成工作

在较新的手机上，清理和矫正处理一张 1200 万像素的照片大约需要一秒半，见[实测时间](#measurements)。如果放在主线程上，页面会卡住这么久。因此 PaperPic 在 Web Worker 中运行它们，应用期间页面仍然可以响应。

worker 随包提供，并通过标准的 `new Worker(new URL(…, import.meta.url))` 启动，Vite 和 webpack 5 等打包工具无需配置就能自动处理。如果 worker 无法启动，编辑会在主线程上运行：仍然可用，但处理大图片时页面可能短暂卡顿。

## Content Security Policy

使用 Content Security Policy 时，请允许：

- `worker-src 'self'`，用于 worker。
- `img-src blob:`，因为查看器通过 `blob:` URL 显示添加的文件和应用的结果。
- 如果你的策略限制 Trusted Types 策略，请在 `trusted-types` 中加入 `paperpic`，因为按钮的图标会经过这个策略。
- 如果你的策略要求 Trusted Types，请提供一个 `default` 策略，让它的 `createScriptURL` 接受 worker 的 URL。打包工具只能处理用普通 URL 创建的 worker，而 Trusted Types 会拦截它，因此没有这个策略时，编辑会在主线程上运行。

## 大照片

- **编辑时**，预览在一份约 200 万像素的副本上进行，因此无论照片多大，刻度尺和工具都保持流畅。
- **应用时**，每项修改都以完整分辨率计算。大照片需要几秒钟，因此查看器会显示一条消息，并在此期间锁定控件。
- **为了节省时间和内存**，请设置 [`maxOutputSize`](../reference/options#maxoutputsize)。2000 或 3000 像素之类的上限既能保持文档清晰可读，又能让应用更快、文件更小。

## 实测时间 {#measurements}

应用的每一步，在 worker 中运行，设备为 Pixel 10 Pro，浏览器为 Chrome 156：

| 步骤                  | 2 MP   | 12 MP  | 37.5 MP |
| --------------------- | ------ | ------ | ------- |
| 清理                  | 256 ms | 1.5 s  | 4.8 s   |
| 矫正                  | 251 ms | 1.6 s  | 5.0 s   |
| 导出为 PNG            | 92 ms  | 378 ms | 979 ms  |
| 导出为 JPEG，质量 0.9 | 33 ms  | 142 ms | 525 ms  |

- 在同一部手机上，移动清理的标尺大约需要 40 ms，因为它作用于约 2 MP 的预览。
- 8 核的台式电脑完成每一步大约快六倍。
- 在 37.5 MP 时，清理的内存峰值约为 340 MB。
- 中端 Android 手机和 iPhone 尚未测量。

## 服务端渲染

PaperPic 需要浏览器。在 Nuxt 或 Next.js 等服务端渲染中，Vue 和 React 组件在服务器上渲染一个空元素，并在浏览器中创建查看器。使用核心时，请自己在浏览器中创建查看器，例如在组件挂载时。

## 浏览器支持

PaperPic 支持 [Baseline Widely Available](https://web.dev/baseline) 的浏览器：即在所有主流浏览器中可用至少 30 个月的功能。各个包都是针对这个目标构建的，即 Chrome 和 Edge 124、Firefox 125 以及 Safari 17.5 或更新版本，因此无需再转译。
