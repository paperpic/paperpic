---
title: 标签
description: PaperPic 界面的所有文本，以及它们的键和英文默认值，用于翻译组件或修改措辞。
---

# 标签

标签是组件显示的文本，以及它向屏幕阅读器朗读的文本。默认是英文。把你想修改的传给 [`labels`](./options#labels) 选项，其余的保留英文。

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: '应用',
    cancel: '取消',
    zoomLevel: percent => `缩放 ${percent}%`,
  },
})
```

有五个标签是函数，因为它们的文本包含一个值。函数每次创建都是新的，查看器会把新函数当作一次变化，所以包含函数的标签请只创建一次，而不是每次渲染都创建。

| 键                  | 英文                                                             | 用途                                                       |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `adjust`            | Adjust                                                           | 打开亮度和对比度刻度尺的按钮                               |
| `adjustmentLevel`   | Brightness +30                                                   | 名称和 -100 到 100 的值的函数，移动“调整”的刻度尺后朗读    |
| `adjustUnavailable` | Not available in black and white                                 | 黑白模式下“调整”的描述，此时“调整”不可用                   |
| `applied`           | Changes applied                                                  | 修改应用后朗读                                             |
| `apply`             | Apply                                                            | 应用修改的按钮                                             |
| `applyError`        | The changes could not be applied                                 | 应用失败时显示                                             |
| `brightness`        | Brightness                                                       | 在“调整”中选择亮度的按钮，以及它的刻度尺的名称             |
| `cancel`            | Cancel                                                           | 退出编辑模式的按钮                                         |
| `cancelTool`        | Cancel this tool                                                 | 关闭工具并放弃其修改的按钮                                 |
| `confirm`           | Done                                                             | 关闭工具并保留其修改的按钮                                 |
| `contrast`          | Contrast                                                         | 在“调整”中选择对比度的按钮，以及它的刻度尺的名称           |
| `cornerBottomLeft`  | Bottom left corner                                               | 角点手柄的名称                                             |
| `cornerBottomRight` | Bottom right corner                                              | 角点手柄的名称                                             |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | 角点手柄的描述：按键的作用，以及按 Enter 完成              |
| `cornerMoved`       | Top left corner: 120, 80                                         | 角及其图片像素位置的函数，移动角后朗读                     |
| `cornerSelected`    | Top left corner: tap where it goes                               | 角的函数，按下角点手柄后显示并朗读，直到点按图片把它移过去 |
| `cornerTopLeft`     | Top left corner                                                  | 角点手柄的名称                                             |
| `cornerTopRight`    | Top right corner                                                 | 角点手柄的名称                                             |
| `crop`              | Crop                                                             | “裁剪”按钮                                                 |
| `cropHint`          | Drag the corners                                                 | 在“裁剪”中要做什么                                         |
| `discard`           | Discard                                                          | 确认丢弃修改的按钮                                         |
| `discardQuestion`   | Discard your changes?                                            | 丢弃修改前的提问                                           |
| `download`          | Download                                                         | 下载按钮                                                   |
| `edit`              | Edit                                                             | 开始编辑的按钮                                             |
| `editBar`           | Editing controls                                                 | 供屏幕阅读器使用的编辑栏名称                               |
| `editing`           | Editing                                                          | 编辑模式开始时朗读                                         |
| `finish`            | Clean up                                                         | “清理”按钮，以及它的效果选择的名称                         |
| `finishGray`        | Gray                                                             | 在“清理”中选择灰度                                         |
| `finishLevel`       | Sensitivity 50%                                                  | 百分比的函数，移动“清理”的刻度尺后朗读                     |
| `finishMono`        | Black and white                                                  | 在“清理”中选择黑白                                         |
| `finishOriginal`    | Original                                                         | 在“清理”中选择原始色调，即关闭它                           |
| `finishSensitivity` | Sensitivity                                                      | “清理”的刻度尺的名称                                       |
| `fitHeight`         | Fit to height                                                    | 让图片高度适合的按钮                                       |
| `fitWidth`          | Fit to width                                                     | 让图片宽度适合的按钮                                       |
| `flip`              | Flip                                                             | “翻转”按钮                                                 |
| `inUse`             | In use                                                           | “调整”或“清理”的设置生效时的描述，由圆点表示               |
| `keepEditing`       | Keep editing                                                     | 回到编辑而不丢弃修改的按钮                                 |
| `loadError`         | The image could not be loaded                                    | 图片无法加载时显示                                         |
| `loading`           | Loading image                                                    | 图片加载时显示                                             |
| `perspective`       | Straighten                                                       | “矫正”按钮                                                 |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | 在“矫正”中要做什么                                         |
| `previewError`      | The changes could not be shown                                   | 修改无法显示时显示                                         |
| `processing`        | Applying changes                                                 | 应用进行时显示                                             |
| `redact`            | Redact                                                           | “遮盖”按钮，以及它的颜色选择的名称                         |
| `redactAngle`       | Angle 12°                                                        | 角度（度）的函数，旋转“遮盖”的区域后播报                   |
| `redactArea`        | Area                                                             | “遮盖”的区域，用来整体移动它                               |
| `redactBlack`       | Black                                                            | 在“遮盖”中选择黑色                                         |
| `redactHint`        | Drag the area over what to hide                                  | 在“遮盖”中要做什么                                         |
| `redactTurn`        | Turn                                                             | 旋转“遮盖”区域的手柄                                       |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | 旋转区域的手柄的说明：各个键的作用，以及按 Enter 完成      |
| `redactWhite`       | White                                                            | 在“遮盖”中选择白色                                         |
| `redo`              | Redo                                                             | “重做”按钮                                                 |
| `rotateLeft`        | Rotate left                                                      | 编辑栏的旋转按钮，以及只读查看器两个旋转按钮之一           |
| `rotateRight`       | Rotate right                                                     | 只读查看器的另一个旋转按钮                                 |
| `toolbar`           | Image controls                                                   | 供屏幕阅读器使用的工具栏名称                               |
| `undo`              | Undo                                                             | “撤销”按钮                                                 |
| `viewer`            | Image viewer                                                     | 供屏幕阅读器使用的、显示图片区域的名称                     |
| `zoomIn`            | Zoom in                                                          | “放大”按钮，位于工具栏以及“裁剪”和“矫正”的面板中           |
| `zoomLevel`         | Zoom 150%                                                        | 百分比的函数，通过工具栏或键盘缩放后朗读                   |
| `zoomOut`           | Zoom out                                                         | “缩小”按钮，位于工具栏以及“裁剪”和“矫正”的面板中           |
