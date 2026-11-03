---
title: 在 Vue 中快速开始
description: 安装 @paperpic/vue，并在 Vue 3 应用中使用 PaperPic 组件显示你的第一张文档图像。
---

# 快速开始

PaperPic 尚处于早期开发阶段。下面的 API 只是临时方案，今后会发生变化。

## 安装

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` 需要 Vue 3.5 或更高版本。

## 使用

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/document.jpg" alt="扫描的文档" :rotation="90" />
</template>
```

可以在[演练场](/zh/playground)中在线试用。
