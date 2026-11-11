---
title: CSS tokens
description: The CSS custom properties that theme PaperPic, with their light and dark values, plus its stylesheet, its cascade layer, its public classes and the names of its controls.
---

# CSS tokens

The tokens are CSS custom properties that change the look of the component without overriding its rules. Set them on `:root`, on an ancestor of the viewer or on `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Light     | Dark      | Description                           |
| -------------------------------- | --------- | --------- | ------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Accent of the interface               |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Background of the interface           |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Text of the interface                 |
| `--paperpic-radius`              | `6px`     | `6px`     | Corner radius of the interface        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Duration of the interface transitions |

## Dark mode

The color tokens take their light or dark value with `light-dark()`, from the `color-scheme` of the page. Without `color-scheme` they are light. With `color-scheme: dark` they are dark, and with `color-scheme: light dark` they are dark when the system prefers a dark color scheme. [Styling](../guide/styling#dark-mode) shows how to set it.

To choose both values of a token, use `light-dark()` too:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
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

Its rules live in the `paperpic` cascade layer, so any CSS of yours outside a layer overrides them, whatever its specificity. This includes global resets, such as a rule on `button`. With Tailwind CSS, name the order of the layers, as [Styling](../guide/styling#tailwind) shows.

## Classes {#classes}

These classes are public: their names, and the elements they mark, stay stable between releases. The other classes of the component hold its layout together and can change in any release.

| Class                     | Element                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `paperpic`                | The root of the viewer                                                                                      |
| `paperpic-button`         | Every button of the toolbar and the edit bar                                                                |
| `paperpic-button-danger`  | Discard, in the question before discarding the changes                                                      |
| `paperpic-button-primary` | Apply, and Done in Crop and Straighten                                                                      |
| `paperpic-button-text`    | The buttons of the question before discarding the changes                                                   |
| `paperpic-edit-bar`       | The edit bar at the bottom                                                                                  |
| `paperpic-editing`        | The root, while editing                                                                                     |
| `paperpic-handle`         | A corner handle of Crop and Straighten                                                                      |
| `paperpic-host`           | The element that the Vue and React components render around the viewer                                      |
| `paperpic-icon`           | The icon of a button                                                                                        |
| `paperpic-status`         | The message for screen readers, which also shows while the image loads or the changes apply, and on failure |
| `paperpic-status-visible` | The message, while it shows in the middle of the viewer                                                     |
| `paperpic-toolbar`        | The toolbar at the right                                                                                    |
| `paperpic-viewport`       | The area that shows the image and takes the keyboard focus                                                  |

Buttons show their state with ARIA attributes, which you can select too:

| Attribute                | State                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | The button cannot act now. It keeps the keyboard focus, so it is not `disabled` |
| `[aria-expanded='true']` | Adjust, while its sliders show                                                  |
| `[aria-pressed='true']`  | A button that is on, such as Clean up or the fit in effect                      |

The hover and these states paint with `box-shadow`, which global resets of buttons leave alone. To restyle them, override `box-shadow` too.

## Controls {#controls}

Every button, slider and corner handle carries `data-paperpic-control`, with the key of its [label](./labels). Select it to style one control:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Place                      | Values                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Toolbar                    | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| Edit bar                   | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| Sliders                    | `thresholdSensitivity`, `brightness`, `contrast`                                                      |
| Crop and Straighten        | `cancelTool`, `confirm`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`   |
| Question before discarding | `keepEditing`, `discard`                                                                              |

`rotateLeft` names two buttons that never show at the same time: the one of a read-only viewer, which turns the display, and the one of the edit bar, which turns the image.
