---
title: 清理
description: 如何用 PaperPic 的“清理”工具把文档照片变成没有阴影的清晰黑白，以及灵敏度和柔和度如何影响结果，附在线演示。
---

# 清理

纸上的文字在黑白下最易读，但照片里有阴影、不均匀的光线和发灰的纸张。“清理”把每个像素与周围比较，判断它是墨迹还是纸张，因此阴影和不均匀的光线会消失，文字保持清晰。它在 API 中的 id 是 `threshold`。

<Demo src="/samples/receipt.jpg" alt="一张收据" :tools="['perspective', 'threshold']" />

先矫正收据，再清理它。

## 使用方法

1. 按“编辑”，再按“清理”。预览变为黑白，并出现“灵敏度”滑块。
2. 拖动滑块。灵敏度越高，变暗的像素越多，可以找回浅淡或磨损的文字。灵敏度越低，页面越干净，不会出现从背面透过来的字迹。松开滑块会留下一项修改。
3. 再按一次“清理”即可关闭。

“清理”总是在其他修改之后进行。“裁剪”和“矫正”显示的是未清理的图片，因为在清理后的页面上很难找到纸张的边缘。

## 柔和度

[`softness`](../../reference/options#softness) 设置“清理”在字母边缘保留多少灰色，范围 0 到 1，默认为 0.25。保留一点灰色可以让边缘更平滑，小字更易读。使用 `0` 得到严格的黑白，文件更小，但细笔画会断开。

## 结果的格式

清理后的图片为 PNG，因为 JPEG 会在清晰的边缘周围产生噪点。[`output`](../../reference/options#output) 选项可以选择其他格式。

## 通过代码使用

[`setThreshold()`](../../reference/methods#setthreshold) 开启或关闭“清理”，并设置灵敏度，范围 0 到 1，默认为 0.5。[`getState()`](../../reference/methods#getstate) 会在 `threshold` 中返回两者：

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```
