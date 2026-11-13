---
title: CSS 令牌
description: 为 PaperPic 设置样式的 CSS 自定义属性及其浅色和深色值，以及它的样式表、层叠层、公开的类和控件的名称。
---

# CSS 令牌

令牌是 CSS 自定义属性，可以在不覆盖组件规则的情况下改变它的外观。在 `:root`、查看器的祖先元素或 `.paperpic` 上设置它们：

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| 令牌                             | 浅色      | 深色      | 说明           |
| -------------------------------- | --------- | --------- | -------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | 界面的强调色   |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | 界面的背景     |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | 界面的文字     |
| `--paperpic-radius`              | `6px`     | `6px`     | 界面的圆角半径 |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | 界面过渡的时长 |

## 深色模式

颜色令牌根据页面的 `color-scheme`，用 `light-dark()` 取浅色或深色的值。没有 `color-scheme` 时为浅色。使用 `color-scheme: dark` 时为深色，使用 `color-scheme: light dark` 时，在系统偏好深色配色时为深色。设置方法见[样式](../guide/styling#dark-mode)。

要自己选择令牌的两个值，同样使用 `light-dark()`：

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

## 样式表

每个包都带有一个样式表。在你的应用中导入一次：

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

它的规则位于 `paperpic` 层叠层中，因此你在层之外的任何 CSS 都会覆盖它们，无论特异性如何。这也包括全局重置，例如针对 `button` 的规则。使用 Tailwind CSS 时，请按[样式](../guide/styling#tailwind)中的做法列出层的顺序。

## 类 {#classes}

这些类是公开的：它们的名称，以及它们所标记的元素，在各个版本之间保持稳定。组件的其他类用于支撑布局，可能在任何版本中改变。

| 类                        | 元素                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `paperpic`                | 查看器的根元素                                             |
| `paperpic-button`         | 工具栏和编辑栏中的每个按钮                                 |
| `paperpic-button-danger`  | 放弃更改前的提问中的放弃                                   |
| `paperpic-button-primary` | 应用，以及每个工具中的完成                                 |
| `paperpic-button-text`    | 放弃更改前的提问中的按钮                                   |
| `paperpic-edit-bar`       | 编辑时位于底部的卡片式编辑栏                               |
| `paperpic-editing`        | 编辑时的根元素                                             |
| `paperpic-handle`         | 裁剪和矫正中的角点手柄                                     |
| `paperpic-host`           | Vue 和 React 组件在查看器外面创建的元素                    |
| `paperpic-icon`           | 按钮的图标                                                 |
| `paperpic-status`         | 给屏幕阅读器的消息，在图片加载、应用更改以及失败时也会显示 |
| `paperpic-status-visible` | 显示在查看器中央时的消息                                   |
| `paperpic-toolbar`        | 右侧的工具栏，编辑时隐藏                                   |
| `paperpic-viewport`       | 显示图片并接收键盘焦点的区域                               |

按钮用 ARIA 属性表示状态，你也可以选择这些属性：

| 属性                     | 状态                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `[aria-disabled='true']` | 按钮暂时无法操作。它会保留键盘焦点，因此不是 `disabled`              |
| `[aria-pressed='true']`  | 正在生效的适合方式（适合宽度或适合高度），或刻度尺所修改的“调整”选项 |

悬停和这些状态都用 `box-shadow` 绘制，按钮的全局重置不会影响它。要修改它们，也请覆盖 `box-shadow`。

## 控件 {#controls}

每个按钮、刻度尺和角点手柄都带有 `data-paperpic-control`，值是它的[标签](./labels)的键。要只为一个控件设置样式，就选择它：

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| 位置         | 值                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| 工具栏       | `edit`、`zoomIn`、`zoomOut`、`fitWidth`、`fitHeight`、`rotateLeft`、`rotateRight`、`download`           |
| 编辑栏       | `cancel`、`crop`、`perspective`、`rotateLeft`、`flip`、`adjust`、`threshold`、`undo`、`redo`、`apply`   |
| 调整和清理   | `brightness` 和 `contrast`（选项及其刻度尺）、`threshold`（开关）、`thresholdSensitivity`（它的刻度尺） |
| 每个工具     | `cancelTool`、`confirm`                                                                                 |
| 裁剪和矫正   | `zoomIn`、`zoomOut`、`cornerTopLeft`、`cornerTopRight`、`cornerBottomRight`、`cornerBottomLeft`         |
| 放弃前的提问 | `keepEditing`、`discard`                                                                                |

`rotateLeft` 对应两个不会同时显示的按钮：只旋转显示的只读查看器的按钮，以及旋转图片本身的编辑栏按钮。`zoomIn` 和 `zoomOut`（工具栏和面板中）以及 `threshold`（“清理”按钮和它的开关）也是如此。`brightness` 和 `contrast` 对应一个选项及其刻度尺，两者同时显示：在选择器中加上 `button` 或 `input` 即可区分。
