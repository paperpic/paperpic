---
title: 编辑
description: PaperPic 的编辑模式如何工作，从“编辑”按钮到“应用”，包括工具、撤销和重做、预览以及你的代码收到的事件。
---

# 编辑

文档照片通常需要稍作修整才值得保存。编辑模式把这些修整集中在一起：用户进行修改、检查，然后一次性应用。你可以在[演练场](../playground)中试用完整的编辑模式。

## 编辑流程

1. 用户按下工具栏中的铅笔“编辑”。编辑栏出现在查看器底部。
2. 编辑栏中的每个工具都会添加一项修改，查看器会立即显示它。“撤销”和“重做”在修改之间前后移动。
3. “应用”计算结果并回到查看模式。“取消”放弃修改，如果有修改会先询问。

在“应用”之前，图片不会改变。在此之前，修改只是一个列表，查看器显示它的预览。

## 工具

| 工具                                  | 作用                         | Id            |
| ------------------------------------- | ---------------------------- | ------------- |
| [“裁剪”](./tools/crop)                | 保留四个角以内的部分         | `crop`        |
| [“矫正”](./tools/straighten)          | 把斜着拍的照片变成平整的页面 | `perspective` |
| [“向左旋转”](./tools/rotate-and-flip) | 把图片向左旋转四分之一圈     | `rotate`      |
| [“翻转”](./tools/rotate-and-flip)     | 把图片左右翻转               | `flip`        |
| [“调整”](./tools/adjust)              | 修改亮度和对比度             | `adjust`      |
| [“清理”](./tools/clean-up)            | 把文档变成没有阴影的清晰黑白 | `threshold`   |

[`tools`](../reference/options#tools) 选项决定编辑栏提供哪些工具：

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

“裁剪”和“矫正”有自己的选区，因此其中一个打开时，编辑栏的其余部分会等待。“完成”或 `Enter` 把选区加入修改，“取消此工具”或 `Esc` 放弃它。

## 预览和应用

编辑时，查看器在一份约 200 万像素的图片副本上预览修改，因此处理大照片时依然迅速。放大后，预览看起来比结果更柔和。“应用”在 Web Worker 中以完整分辨率或 [`maxOutputSize`](../reference/options#maxoutputsize) 计算所有修改。

应用无法中断。运行期间它会锁定控件并显示一条消息。之后结果替换显示的图片，历史记录清空，查看器回到查看模式。如果应用失败，编辑保持打开，以便用户重试。

## 你的代码会收到什么

| 事件     | 时机                                             |
| -------- | ------------------------------------------------ |
| `apply`  | 结果就绪时，附带 `{ blob, width, height, type }` |
| `change` | 用户每次操作之后，附带[状态](../reference/state) |
| `error`  | 应用失败，或图片无法加载时                       |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## 什么会放弃修改

- 用户确认后的“取消”，或不询问的 [`cancel()`](../reference/methods#cancel)。
- 编辑时传入新的 `src`。
- 编辑时修改 `editable`。

应用之后再次传入相同的 `src` 不会有任何作用，因此结果会继续显示。[`reload()`](../reference/methods#reload) 可以恢复原图。

## 键盘

焦点在查看器上时：

| 按键                       | 操作                         |
| -------------------------- | ---------------------------- |
| `Ctrl+Z`                   | 撤销                         |
| `Ctrl+Shift+Z` 或 `Ctrl+Y` | 重做                         |
| `Enter`                    | 确认打开的工具，否则应用修改 |
| `Esc`                      | 关闭打开的工具，否则取消修改 |

在 macOS 上，`Cmd` 与 `Ctrl` 作用相同。
