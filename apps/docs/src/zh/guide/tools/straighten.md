---
title: 矫正
description: 如何用 PaperPic 的“矫正”工具把斜着拍的文档照片变成平整的页面，它如何估算宽高比，以及何时设置 aspectRatio，附在线演示。
---

# 矫正

斜着拍的文档看起来像梯形：远端的边更短，文字也是斜的。“矫正”把它还原成平整的矩形页面，就像扫描出来的一样。它在 API 中的 id 是 `perspective`。

<Demo src="/samples/receipt.jpg" alt="一张收据" :tools="['perspective']" />

## 使用方法

1. 按“编辑”，再按“矫正”。每个角都会出现一个手柄。
2. 把每个手柄拖到文档的一个角上。放大后可以精确放置。
3. 按“完成”或 `Enter`。查看器会显示按四个角裁剪后的平整页面。

手柄的用法与[“裁剪”](./crop)相同：触摸屏上有放大镜，也可以先按下再点按来代替拖动，键盘上用 Tab 和方向键。四个角始终保持凸形，因此页面总能被拉平。

## 宽高比

照片无法告诉我们页面的真实形状，因此“矫正”会根据照片中四个角的位置估算宽高比。对于在正常距离拍摄的照片，估算效果不错，但不可能完全准确。

估算使用的是原始照片，即使在同一次编辑中先做了裁剪或旋转也是如此。用户一旦应用，结果就会被当作新的照片，所以请在应用之前进行矫正。

如果你知道文档的规格，把 [`aspectRatio`](../../reference/options#aspectratio) 设为宽度除以高度，结果就会采用这个宽高比：

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| 文档               | `aspectRatio`  |
| ------------------ | -------------- |
| A4 纸，纵向        | `210 / 297`    |
| US Letter 纸，纵向 | `8.5 / 11`     |
| 身份证件卡片，横向 | `85.6 / 53.98` |

横向的纸张请把数字对调，例如 `297 / 210`。

## 超出照片的角

有时文档的某个角会落在照片之外。手柄始终留在图片内，因此请把这个手柄放在照片边缘上，沿着文档保留内容的那条边。最后几行会略微倾斜，估算的宽高比也会变差，这可以用 [`aspectRatio`](../../reference/options#aspectratio) 修正。

[演练场](../../playground)中有一张缺了一角的示例收据，可以试一试。

## 通过代码使用

“矫正”用 [`openTool('perspective')`](../../reference/methods#opentool) 打开，用 [`confirmTool()`](../../reference/methods#confirmtool) 或 [`cancelTool()`](../../reference/methods#canceltool) 关闭：

```ts
pic.edit()
pic.openTool('perspective')

// 稍后，从你自己的按钮调用
pic.confirmTool()
```
