---
title: 状态
description: getState() 返回和 change 事件携带的内容，例如图片状态、模式、缩放、修改以及是否有可应用的内容。
---

# 状态

状态描述查看器在某一时刻显示的内容。[`getState()`](./methods#getstate) 返回它，[`change`](./events#change) 事件携带它。用它让你自己的控件保持同步，例如一个“应用”按钮：

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| 字段          | 类型                                         | 说明                                                                     |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `activeTool`  | `ToolId \| null`                             | 打开的工具，例如 `'crop'` 或 `'adjust'`，或 `null`                       |
| `adjustments` | `{ brightness, contrast }`                   | 亮度和对比度，各自从 -1 到 1。清理时不使用它们。调整打开时，是它显示的值 |
| `busy`        | `boolean`                                    | 应用是否正在进行                                                         |
| `canApply`    | `boolean`                                    | 是否有可应用的修改。相互抵消的旋转和翻转不算修改                         |
| `canRedo`     | `boolean`                                    | 是否有可重做的修改                                                       |
| `canUndo`     | `boolean`                                    | 是否有可撤销的修改                                                       |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | 当前的适合方式，用户手动缩放后为 `null`                                  |
| `image`       | `{ width, height } \| null`                  | 包含已做修改的显示图片的像素尺寸，没有图片时为 `null`                    |
| `mode`        | `'view' \| 'edit'`                           | 用户是在查看还是在编辑图片                                               |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | 显示的图片顺时针旋转的角度                                               |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | 是否有图片，以及是否已加载                                               |
| `threshold`   | `{ enabled, sensitivity }`                   | 清理是否开启，以及 0 到 1 的灵敏度。清理打开时，是它显示的内容           |
| `zoom`        | `number`                                     | 每个图片像素对应的屏幕像素数                                             |
