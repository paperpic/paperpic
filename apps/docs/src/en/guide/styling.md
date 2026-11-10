---
title: Styling
description: How to fit PaperPic into the look of your app, with its stylesheet, its CSS tokens, dark mode and a cascade layer that lets your CSS win.
---

# Styling

PaperPic should look like part of your app. It ships one stylesheet, takes its colors and corners from a few CSS tokens, and keeps its rules in a cascade layer, so your own CSS always wins.

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

## Dark mode {#dark-mode}

The colors switch to dark ones when the user's system prefers a dark color scheme. If your site switches themes another way, such as with a class on `<html>`, set the colors of each theme yourself:

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

## Layout

The interface adapts to its container on its own:

- The toolbar sits at the right and scrolls when the viewer is too short for its buttons.
- The edit bar sits at the bottom, on one row, or on two in a viewer narrower than 28rem.
- On touch screens, buttons and corner handles grow to at least 44 pixels.

## Class names

Every class of the component starts with `paperpic`, and the names are stable, so you can target them. Prefer the tokens when they cover what you need, because they keep working when the inner structure changes.
