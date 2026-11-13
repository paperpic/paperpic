---
layout: home
title: PaperPic
titleTemplate: 文档图像查看与编辑工具
description: 开源的文档图像查看与编辑工具。支持缩放、旋转、透视校正、亮度和对比度调整、黑白转换以及阴影去除。

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: 让文档图像恰到好处
  tagline: 查看和编辑文档照片。缩放、旋转、校正透视、调整亮度和对比度、转换为清晰的黑白效果并去除阴影。
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
    details: "拖动四个角，把斜着拍的照片变成平整的页面，宽高比可以估算，也可以指定。"
    link: /zh/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "清理"
    details: "把带阴影的照片变成清晰的黑白，并为彩色文档调整亮度和对比度。"
    link: /zh/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "完整分辨率"
    details: "应用后以 Blob 的形式把编辑后的图片交给你的代码，处理在 Web Worker 中进行，页面保持流畅。"
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
