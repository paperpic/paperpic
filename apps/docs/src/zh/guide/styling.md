---
title: 样式
description: 如何让 PaperPic 融入你应用的外观，包括它的样式表、CSS 令牌、深色模式、你自己的图标，以及让你的 CSS 优先的层叠层。
---

# 样式

PaperPic 应该看起来像你应用的一部分。它只带一个样式表，颜色和圆角取自几个 CSS 令牌，跟随页面的配色方案，规则放在一个层叠层中，因此你自己的 CSS 总是优先。

## 导入样式表

在你的应用中导入一次：

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

## 设置尺寸

查看器会填满它的容器，自身没有高度，因此容器需要一个高度。任何为它设置高度的 CSS 都可以：

```css
.document-viewer {
  height: 70dvh;
}
```

查看器跟随容器的尺寸，而不是屏幕的尺寸。容器变化时它会跟着调整，例如打开侧边栏时。

## 颜色和圆角

五个 [CSS 令牌](../reference/css-tokens)设置背景、文字、强调色、圆角半径和过渡时长。在 `:root`、查看器的祖先元素或 `.paperpic` 上设置它们：

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

令牌会被继承，因此在某个查看器的容器上，或在 Vue 或 React 组件上加一个类，只会改变这个查看器：

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## 使用你的设计系统的颜色 {#design-system}

如果你的应用把颜色放在 CSS 变量中，请让令牌指向这些变量，而不是复制它们的值。这样查看器会跟随你的主题，包括深色模式：

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

像这里一样把它们设置在 `.paperpic` 上。使用 `var()` 的令牌会在你设置它的元素上读取变量，因此设置在 `:root` 上时，会错过只在页面某一部分切换的主题。

任何带 CSS 变量的设计系统都可以，例如 Tailwind CSS 4 的主题变量 `var(--color-blue-600)` 或 `var(--radius-md)`。

## 深色模式 {#dark-mode}

颜色跟随页面的 `color-scheme`，就像浏览器的表单控件一样：

- 使用 `color-scheme: light dark` 时，当用户的系统偏好深色配色，颜色会变深。
- 使用 `color-scheme: dark` 时，颜色始终是深色。这也适用于页面的某一部分。
- 没有 `color-scheme` 时，颜色保持浅色，因此没有深色主题的页面会保留浅色的查看器。

如果你的网站跟随系统，声明一次即可：

```css
:root {
  color-scheme: light dark;
}
```

如果你的网站用类切换主题，例如 `<html>` 上的类，请和这个类一起设置 `color-scheme`。浏览器的滚动条和表单控件也会跟随它：

```css
:root.dark {
  color-scheme: dark;
}
```

要选择你自己的深色颜色，用 `light-dark()` 给令牌设置两个值：

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

指向你的[设计系统](#design-system)变量的令牌则会跟随你的主题。

## 图标 {#icons}

[`icons`](../reference/options#icons) 选项可以用你自己的标记替换任意图标，通常是你应用图标集里的 `<svg>`：

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- 每个键对应一个图标，有些图标会出现在两个按钮上：`apply` 也用于完成，`cancel` 也用于关闭裁剪和矫正。所有键都列在[选项](../reference/options#icons)中。
- PaperPic 会给图标加上设置尺寸的 `paperpic-icon` 类，并对屏幕阅读器隐藏它，因为按钮已经有名称。
- 用 `currentColor` 绘制图标，这样它在任何主题下都会取按钮的颜色。
- 标记会作为 HTML 插入页面，因此只传入你信任的标记。
- 在 Vite 中，`import zoomIn from './zoom-in.svg?raw'` 可以拿到一个 `.svg` 文件的标记。

要一次改变所有图标，例如尺寸或线条粗细，请为这个类设置样式：

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## 你的 CSS 优先

PaperPic 的规则位于 `paperpic` 层叠层中，层之外的任何 CSS 都会覆盖它们，无论特异性如何。这让定制很容易，但层之外的全局重置，例如针对 `button` 的规则，也会影响查看器的按钮。

如果你的重置破坏了查看器，把它移到排在 `paperpic` 之前的层中。第一个列出层名的声明决定层的顺序，因此要把它放在比 PaperPic 样式表更早加载的 CSS 中：

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Tailwind CSS 4 也把规则放在层叠层中。在导入 Tailwind 和 PaperPic 之前，按顺序列出所有层，让 Tailwind 的重置排在 `paperpic` 之前，它的工具类排在之后：

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

请在这里，也就是你的 CSS 中导入 PaperPic 的样式表，而不是从 JavaScript 导入。顺序不同时，Tailwind 的重置会去掉查看器的内边距和边框，或者查看器会覆盖组件上的 `h-96` 等工具类。

## 类名 {#class-names}

可以在选择器中使用的类列在 [CSS 参考](../reference/css-tokens#classes)中，例如 `paperpic-toolbar` 和 `paperpic-button`，它们的名称保持稳定。其他类用于支撑布局，可能在任何版本中改变。如果令牌能满足需要，请优先使用令牌。

每个按钮、滑块和角点手柄还带有 `data-paperpic-control`，值是它的[标签](../reference/labels)的键。要只为一个控件设置样式，就选择它：

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## 布局

界面会自动适应它的容器：

- 工具栏位于右侧，当查看器太矮放不下所有按钮时可以滚动。
- 编辑栏位于底部，通常是一行；查看器宽度小于 28rem 时变成两行。
- 在触摸屏上，按钮和角点手柄至少为 44 像素。

## 你自己的控件

当样式不够用时，用 `toolbar: false` 隐藏工具栏和编辑栏，再用你自己的控件操作查看器。[自定义工具栏](../examples/custom-toolbar)展示了做法。
