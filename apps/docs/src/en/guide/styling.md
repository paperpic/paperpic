---
title: Styling
description: How to fit PaperPic into the look of your app, with its stylesheet, its CSS tokens, dark mode, your own icons and a cascade layer that lets your CSS win.
---

# Styling

PaperPic should look like part of your app. It ships one stylesheet, takes its colors and corners from a few CSS tokens, follows the color scheme of your page, and keeps its rules in a cascade layer, so your own CSS always wins.

## Import the stylesheet

Import it once in your app:

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

## Give it a size

The viewer fills its container and has no height of its own, so the container needs one. Any CSS that gives it a height works:

```css
.document-viewer {
  height: 70dvh;
}
```

The viewer follows the size of its container, not the size of the screen. It reacts when the container changes, such as when a side panel opens.

## Colors and corners

Five [CSS tokens](../reference/css-tokens) set the surface, the text, the accent, the corner radius and the length of the transitions. Set them on `:root`, on an ancestor of the viewer or on `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

The tokens are inherited, so a class on the container of one viewer, or on the Vue or React component, changes that viewer only:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Use the colors of your design system {#design-system}

If your app keeps its colors in CSS variables, point the tokens at them instead of copying their values. The viewer then follows your theme, dark mode included:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Set them on `.paperpic`, as here. A token that uses `var()` reads the variable on the element where you set it, so on `:root` it would miss a theme that you switch on one part of the page.

Any design system with CSS variables works, such as the theme variables of Tailwind CSS 4: `var(--color-blue-600)` or `var(--radius-md)`.

## Dark mode {#dark-mode}

The colors follow the `color-scheme` of your page, as the form controls of the browser do:

- With `color-scheme: light dark`, they turn dark when the user's system prefers a dark color scheme.
- With `color-scheme: dark`, they are always dark. This also works on one part of the page.
- Without `color-scheme`, they stay light, so a page without a dark theme keeps a light viewer.

If your site follows the system, declare it once:

```css
:root {
  color-scheme: light dark;
}
```

If your site switches themes with a class, such as on `<html>`, set `color-scheme` with that class. The scroll bars and form controls of the browser follow it too:

```css
:root.dark {
  color-scheme: dark;
}
```

To choose your own dark colors, give a token both values with `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

Tokens that point at the variables of your [design system](#design-system) follow your theme instead.

## Icons {#icons}

The [`icons`](../reference/options#icons) option replaces any icon with your own markup, usually an `<svg>` from the icon set of your app:

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

- Each key names an icon, and some icons appear on two buttons: `apply` is also on Done, and `cancel` also closes Crop and Straighten. [Options](../reference/options#icons) lists every key.
- PaperPic gives the icon the class `paperpic-icon`, which sets its size, and hides it from screen readers, because the button already has a name.
- Draw the icon with `currentColor`, so it takes the color of the button in every theme.
- The markup goes into the page as HTML, so pass only markup you trust.
- With Vite, `import zoomIn from './zoom-in.svg?raw'` gives you the markup of an `.svg` file.

To change every icon at once, such as their size or the width of their lines, style the class:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## Your CSS wins

The rules of PaperPic live in the `paperpic` cascade layer, and any CSS outside a layer overrides them, whatever its specificity. That makes overrides easy, but a global reset outside a layer, such as a rule on `button`, also reaches the buttons of the viewer.

If your reset breaks the viewer, move it into a layer that comes before `paperpic`. The first statement that names the layers fixes their order, so put it in CSS that loads before the stylesheet of PaperPic:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Tailwind CSS 4 keeps its rules in cascade layers too. Name every layer, in order, before you import Tailwind and PaperPic, so the reset of Tailwind comes before `paperpic` and its utilities come after it:

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

Import the stylesheet of PaperPic here, in your CSS, and not from JavaScript. In another order, the reset of Tailwind removes padding and borders from the viewer, or the viewer overrides utilities such as `h-96` on the component.

## Class names {#class-names}

The [CSS reference](../reference/css-tokens#classes) lists the classes you can target, such as `paperpic-toolbar` and `paperpic-button`, and their names stay stable. Other classes hold the layout together and can change in any release. Prefer the tokens when they cover what you need.

Every button, slider and corner handle also carries `data-paperpic-control`, with the key of its [label](../reference/labels). Select it to style one control:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Layout

The interface adapts to its container on its own:

- The toolbar sits at the right and scrolls when the viewer is too short for its buttons.
- The edit bar sits at the bottom, on one row, or on two in a viewer narrower than 28rem.
- On touch screens, buttons and corner handles grow to at least 44 pixels.

## Your own controls

When styling is not enough, hide the built-in toolbar and edit bar with `toolbar: false`, and drive the viewer from controls of your own. [Custom toolbar](../examples/custom-toolbar) shows how.
