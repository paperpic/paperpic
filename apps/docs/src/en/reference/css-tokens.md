---
title: CSS tokens
description: The CSS custom properties that theme PaperPic, with their light and dark defaults, plus its stylesheet, its cascade layer and its class names.
---

# CSS tokens

The tokens are CSS custom properties that change the look of the component without overriding its rules. Set them on `:root`, on an ancestor of the viewer or on `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Default   | Dark default | Description                           |
| -------------------------------- | --------- | ------------ | ------------------------------------- |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e`    | Background of the interface           |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9`    | Text of the interface                 |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff`    | Accent of the interface               |
| `--paperpic-radius`              | `6px`     | `6px`        | Corner radius of the interface        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`       | Duration of the interface transitions |

## Dark mode

The dark defaults apply when the user's system prefers a dark color scheme. If your site switches themes another way, such as with a class on `<html>`, set the colors of each theme yourself:

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

## Stylesheet

Each package ships one stylesheet. Import it once in your app:

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

Its rules live in the `paperpic` cascade layer, so any CSS of yours outside a layer overrides them, whatever its specificity. This includes global resets, such as a rule on `button`.

## Class names

`.paperpic` is the root of the viewer, and `.paperpic-host` is the element that the Vue and React components render around it. Every class of the component starts with `paperpic`, and the names are stable. Prefer the tokens when they cover what you need.
