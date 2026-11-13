---
title: Vue
description: Vue 版 PaperPic 组件如何把核心的选项、事件和方法对应到 props、组件事件和模板 ref。
---

# Vue

`@paperpic/vue` 把查看器封装成适用于 Vue 3.5 或更高版本的组件。选项是 props，事件是组件事件，方法位于组件暴露的 `instance` 上。

```vue
<script setup lang="ts">
import type { ExportedImage } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function upload({ blob }: ExportedImage) {
  // 把编辑后的图片发送到你的服务器
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" alt="一张收据" @apply="upload" />
  </div>
</template>
```

组件会填满其父元素，因此请为父元素设置高度。

## Props

每个[选项](./options)都是同名的 prop，例如 `:editable="false"` 或 `:aspect-ratio="210 / 297"`。prop 的变化通过 `setOptions()` 传给查看器。

模板中构建的对象和数组，例如 `:labels="{ apply: t('apply') }"`，在父组件每次渲染时都是新的，查看器每次都会重新接收它们。请改用 `computed` 构建。

## 事件

| 事件       | 载荷                                           |
| ---------- | ---------------------------------------------- |
| `apply`    | [`ExportedImage`](./types#exportedimage)       |
| `change`   | [`PaperPicState`](./state)                     |
| `download` | [`PaperPicDownload`](./types#paperpicdownload) |
| `error`    | `{ error }`                                    |
| `load`     | [`Size`](./types#size)                         |

每个事件见[事件](./events)。prop 的变化从不触发 `change`。

## 方法

组件把查看器暴露为 `instance`，带有所有[方法](./methods)。组件挂载之前它为 `null`：

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    放大
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" :toolbar="false" />
  </div>
</template>
```

再次传入相同的 `src` 不会重新加载图片，因此会保留编辑结果。要恢复原图，调用 `instance.reload()`。

## 类型 {#types}

`@paperpic/vue` 导出了 `@paperpic/core` 的所有类型，因此无需安装 `@paperpic/core`。[类型](./types)逐一列出了这些类型。它还导出了组件的类型：表示 props 的 [`PaperPicProps`](./types#paperpicprops)，以及表示 `instance` 中查看器的 [`PaperPicInstance`](./types#paperpicinstance)。

## 服务端渲染

在服务端渲染中，例如在 Nuxt 里，组件在服务器上渲染一个空元素，并在浏览器中创建查看器。
