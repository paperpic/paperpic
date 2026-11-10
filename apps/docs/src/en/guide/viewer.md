---
title: Viewer
description: How people zoom, pan and fit a document image in PaperPic, what the toolbar offers, and how to show an image read-only, with a live demo.
---

# Viewer

Small print and long receipts are hard to read at a glance on a screen. The viewer fits the image when it loads and lets people zoom into any part of it.

<Demo src="/samples/receipt.jpg" alt="A receipt" :editable="false" />

## Zoom and pan

| Action                          | Mouse and trackpad            | Touch      | Keyboard    |
| ------------------------------- | ----------------------------- | ---------- | ----------- |
| Zoom                            | Wheel, or pinch on a trackpad | Pinch      | `+` and `-` |
| Pan                             | Drag                          | Drag       | Arrow keys  |
| Switch between the fit and 100% | Double click                  | Double tap |             |
| Fit the whole image             |                               |            | `0`         |

The keyboard works with the focus on the viewer. A pinch zooms around the point between the fingers. On a touch screen, one finger scrolls the page while the image is fitted, and pans the image once it is zoomed in.

The zoom goes from the fit of the whole image, or 100% for a small image, up to 800%. An image that fits stays centered, and one that overflows pans up to its edges.

When the image loads, it fits the viewer whole, and it keeps its fit when the viewer changes size, until the user zooms by hand.

In a long page, the wheel would zoom the image instead of scrolling the page. Set `wheelZoom: false` there: the buttons, the keyboard and a pinch on a touch screen still zoom.

## The toolbar

The toolbar sits at the right of the viewer, and scrolls when the viewer is too short for its buttons.

| Button                      | What it does                                                     |
| --------------------------- | ---------------------------------------------------------------- |
| Edit                        | Starts the [edit mode](./editing). Hidden with `editable: false` |
| Zoom in, Zoom out           | Zoom one step, around the center                                 |
| Fit to width, Fit to height | Fit the width, which suits long documents, or the height         |
| Rotate left, Rotate right   | Only in a read-only viewer: turn the image on display            |
| Download                    | Only with `download: true`: save the image on display            |

With `toolbar: false`, the toolbar and the edit bar are hidden, and you can build your own controls with the [methods](../reference/methods).

## Read-only viewer {#read-only}

With `editable: false`, the Edit button goes away, and the toolbar gets two buttons that rotate the image. That rotation only changes the display, and nothing is saved. Use it for documents that people should read but not change, such as the attachments of a record.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'A receipt',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="A receipt" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="A receipt" editable={false} />
```

:::

## Control the view from code

The methods [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) and [`fit()`](../reference/methods#fit) do what the buttons do, and [`getState()`](../reference/methods#getstate) tells you the zoom and the fit in effect:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
