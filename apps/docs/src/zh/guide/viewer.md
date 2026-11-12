---
title: 查看器
description: 如何在 PaperPic 中缩放、平移文档图片并让它适合查看器，工具栏提供哪些功能，以及如何以只读方式显示图片，附在线演示。
---

# 查看器

小字和长收据在屏幕上很难一眼看清。查看器在加载图片时让它适合查看器，并让人们放大任何部分。

<Demo src="/samples/receipt.jpg" alt="一张收据" :editable="false" />

## 缩放和平移

| 操作                   | 鼠标和触控板               | 触摸     | 键盘       |
| ---------------------- | -------------------------- | -------- | ---------- |
| 缩放                   | 滚轮，或在触控板上双指缩放 | 双指缩放 | `+` 和 `-` |
| 平移                   | 拖动                       | 拖动     | 方向键     |
| 在适合和 100% 之间切换 | 双击                       | 双击     |            |
| 让整张图片适合         |                            |          | `0`        |

焦点在查看器上时键盘才起作用。双指缩放以两指之间的点为中心。在触摸屏上，图片处于适合状态时单指会滚动页面，放大后则平移图片。

缩放范围从适合整张图片（小图片为 100%）到 800%。能完整显示的图片保持居中，超出的图片可以平移到它的边缘。

图片加载后会整张适合查看器，并且在查看器尺寸变化时保持适合，直到用户手动缩放。

在长页面中，滚轮会缩放图片而不是滚动页面。这时请设置 `wheelZoom: false`：按钮、键盘和触摸屏上的双指缩放仍然可以缩放。

## 工具栏

工具栏位于查看器右侧，当查看器太矮放不下所有按钮时可以滚动。编辑时它会隐藏，因此不会遮住“裁剪”或“矫正”的角。

| 按钮                   | 作用                                                     |
| ---------------------- | -------------------------------------------------------- |
| “编辑”                 | 开启[编辑模式](./editing)。设置 `editable: false` 时隐藏 |
| “放大”、“缩小”         | 以中心为基准缩放一级                                     |
| “适合宽度”、“适合高度” | 让宽度（适合长文档）或高度适合查看器                     |
| “向左旋转”、“向右旋转” | 仅在只读查看器中：旋转显示的图片                         |
| “下载”                 | 仅在 `download: true` 时：保存显示的图片                 |

设置 `toolbar: false` 时，工具栏和编辑栏会隐藏，你可以用[方法](../reference/methods)构建自己的控件。

## 只读查看器 {#read-only}

设置 `editable: false` 时，“编辑”按钮消失，工具栏多出两个旋转图片的按钮。这种旋转只改变显示，不会保存任何东西。用它显示应该阅读但不应修改的文档，例如记录的附件。

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: '一张收据',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="一张收据" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="一张收据" editable={false} />
```

:::

## 用代码控制视图

方法 [`zoomIn()`](../reference/methods#zoomin)、[`zoomOut()`](../reference/methods#zoomout)、[`zoomTo()`](../reference/methods#zoomto) 和 [`fit()`](../reference/methods#fit) 与按钮作用相同，[`getState()`](../reference/methods#getstate) 会告诉你当前的缩放和适合方式：

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
