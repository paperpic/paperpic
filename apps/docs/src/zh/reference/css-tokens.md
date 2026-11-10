---
title: CSS 令牌
description: 为 PaperPic 设置样式的 CSS 自定义属性及其浅色和深色默认值，以及它的样式表、层叠层和类名。
---

# CSS 令牌

令牌是 CSS 自定义属性，可以在不覆盖组件规则的情况下改变它的外观。在 `:root`、查看器的祖先元素或 `.paperpic` 上设置它们：

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| 令牌                             | 默认值    | 深色      | 说明           |
| -------------------------------- | --------- | --------- | -------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | 界面的背景     |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | 界面的文字     |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | 界面的强调色   |
| `--paperpic-radius`              | `6px`     | `6px`     | 界面的圆角半径 |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | 界面过渡的时长 |

## 深色模式

当用户的系统偏好深色配色时，使用深色值。如果你的网站用其他方式切换主题，例如 `<html>` 上的类，请自己设置每个主题的颜色：

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

它的规则位于 `paperpic` 层叠层中，因此你在层之外的任何 CSS 都会覆盖它们，无论特异性如何。这也包括全局重置，例如针对 `button` 的规则。

## 类名

`.paperpic` 是查看器的根元素，`.paperpic-host` 是 Vue 和 React 组件在它外面创建的元素。组件的所有类都以 `paperpic` 开头，名称保持稳定。如果令牌能满足需要，请优先使用令牌。
