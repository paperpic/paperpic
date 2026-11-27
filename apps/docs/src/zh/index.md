---
layout: home
title: PaperPic
titleTemplate: 文档图像查看与编辑工具
description: 面向浏览器的文档图像查看与编辑工具：矫正、裁剪、旋转和清理手机照片、扫描件以及任何带文字的图片。适用于原生 JavaScript、Vue 和 React。

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: 在浏览器中得到清晰易读的文档图像
  tagline: 矫正、裁剪和清理手机照片、扫描件或任何带文字的图片。支持原生 JavaScript、Vue 和 React，在你的代码发送之前，任何内容都不会离开设备。
  image:
    src: /hero.svg
    alt: ""
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 演练场
      link: /zh/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "查看器"
    details: "用按钮、滚轮或双指缩放，平移图片，让长收据的宽度适合查看器。需要时可设为只读。"
    link: /zh/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "矫正和裁剪"
    details: "把斜着拍的照片变成平整的页面，宽高比可以估算，也可以指定。查看器会找到四个角，你也可以拖动它们。"
    link: /zh/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "清理"
    details: "把带阴影的照片变成清晰的黑白，并为彩色文档调整亮度和对比度。"
    link: /zh/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "完整分辨率"
    details: "应用修改后，你的代码会以 Blob 的形式收到编辑后的图片，处理在 Web Worker 中进行，页面保持流畅。"
    link: /zh/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "无障碍"
    details: "键盘快捷键、可用方向键移动的角点手柄，以及面向屏幕阅读器的播报。"
    link: /zh/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "任意框架"
    details: "核心适用于原生 JavaScript，并为 Vue 和 React 提供轻量封装，没有运行时依赖。"
    link: /zh/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "比较照片和结果"
  beforeLabel: "照片"
  afterLabel: "PaperPic"
  beforeAlt: "桌上一张收据的照片，斜着拍摄，部分处于阴影中"
  afterAlt: "同一张收据，经过矫正并清理成黑白"
---

## 几行代码即可开始

安装对应框架的包，给容器设置高度，然后监听 `apply` 事件：

:::tabs key:framework
== JavaScript

```sh
npm install @paperpic/core
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: '一张收据' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```sh
npm install @paperpic/vue
```

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="一张收据" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```sh
npm install @paperpic/react
```

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="一张收据" onApply={({ blob }) => upload(blob)} />
}
```

:::

[快速开始](./guide/getting-started)介绍了安装和每一步。
