---
title: 样式
description: 如何让 PaperPic 融入你应用的外观，包括它的样式表、CSS 令牌、深色模式，以及让你的 CSS 优先的层叠层。
---

# 样式

PaperPic 应该看起来像你应用的一部分。它只带一个样式表，颜色和圆角取自几个 CSS 令牌，规则放在一个层叠层中，因此你自己的 CSS 总是优先。

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

## 深色模式 {#dark-mode}

当用户的系统偏好深色配色时，颜色会切换为深色。如果你的网站用其他方式切换主题，例如 `<html>` 上的类，请自己设置每个主题的颜色：

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

## 布局

界面会自动适应它的容器：

- 工具栏位于右侧，当查看器太矮放不下所有按钮时可以滚动。
- 编辑栏位于底部，通常是一行；查看器宽度小于 28rem 时变成两行。
- 在触摸屏上，按钮和角点手柄至少为 44 像素。

## 类名

组件的所有类都以 `paperpic` 开头，名称保持稳定，因此你可以在选择器中使用它们。如果令牌能满足需要，请优先使用令牌，因为内部结构变化时它们依然有效。
