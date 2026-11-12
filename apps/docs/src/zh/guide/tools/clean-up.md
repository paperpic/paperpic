---
title: 清理
description: 如何用 PaperPic 的“清理”工具把文档照片变成没有阴影的清晰黑白，以及灵敏度和柔和度如何影响结果，附在线演示。
---

# 清理

纸上的文字在黑白下最易读，但照片里有阴影、不均匀的光线和发灰的纸张。“清理”把每个像素与周围比较，判断它是墨迹还是纸张，因此阴影和不均匀的光线会消失，文字保持清晰。它在 API 中的 id 是 `threshold`。

<Demo src="/samples/receipt.jpg" alt="一张收据" :tools="['perspective', 'threshold']" />

先矫正收据，再清理它。

## 使用方法

1. 按“编辑”，再按“清理”。它的面板会代替工具出现，预览变为黑白，并出现“灵敏度”刻度尺。
2. 拖动刻度尺。灵敏度越高，变暗的像素越多，可以找回浅淡或磨损的文字。灵敏度越低，页面越干净，不会出现从背面透过来的字迹。
3. 按“完成”，把它作为一项修改保留；按“取消此工具”，图片保持原样。

要关闭已经成为修改的“清理”，请再次打开它：刻度尺旁的开关可以关闭它，之后的修改会保留。“撤销”则会先去掉这些修改。

“清理”总是在其他修改之后进行。“裁剪”按最终结果显示清理后的图片。“矫正”显示未清理的图片，因为在清理后的页面上很难找到纸张的边缘。

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

“清理”打开时，`setThreshold()` 会改变面板显示的内容，[`confirmTool()`](../../reference/methods#confirmtool) 会把它作为一项修改保留。
