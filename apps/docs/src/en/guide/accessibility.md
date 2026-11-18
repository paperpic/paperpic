---
title: Accessibility
description: How PaperPic works with the keyboard, screen readers and touch screens, which preferences it follows, and what your app needs to provide.
---

# Accessibility

People read and fix documents with a mouse, a finger, the keyboard or a screen reader. PaperPic aims at WCAG 2.2 AA, and most of the work is built in. This page lists what it does and what your app needs to add.

## What your app needs to do

- **A description.** Pass [`alt`](../reference/options#alt), such as "Receipt from 5 November". Screen readers read it as the name of the image.
- **Texts in the user's language.** Screen readers announce the buttons and the changes, so translate them with [`labels`](./labels).
- **Your own controls, if any.** With `toolbar: false`, the buttons you build replace the built-in ones, and they need their own names and keyboard support.
- **A visible focus.** Keep your CSS from hiding the focus outline of the viewer.

## Keyboard {#keyboard}

With the focus inside the viewer:

| Key                        | Action                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| `+` and `-`                | Zoom in and out                                                              |
| Arrow keys                 | Pan                                                                          |
| `0`                        | Fit the whole image                                                          |
| `Ctrl+Z`                   | Undo                                                                         |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo                                                                         |
| `Enter`                    | Confirm the open tool, or else apply the changes                             |
| `Esc`                      | Let go of a selected corner, close the open tool, or else cancel the changes |

On macOS, `Cmd` works like `Ctrl`. With the focus on a button, `Enter` presses that button instead. Before cancelling changes, `Esc` asks for confirmation. With `toolbar: false`, `Esc` still closes a tool, but it does not cancel the edit: your interface decides.

- **Toolbar and edit bar.** Tab reaches each bar, and inside it the arrow keys move between the buttons, with `Home` and `End` for the first and the last.
- **Corner handles.** With Crop or Straighten open, Tab moves between the handles, and the arrow keys move the focused one 1 screen pixel, or 10 with Shift.
- **Rulers.** The rulers of Adjust and Clean up are native ranges: the arrow keys, `Page Up`, `Page Down`, `Home` and `End` move them. `Enter` keeps the value, as Done does, and `Esc` closes the tool without it.

## Screen readers

- The image has the role of an image, named by `alt`. Without `alt`, screen readers skip it.
- The toolbar and the edit bar have their own names, such as "Image controls" and "Editing controls".
- An announcement reports what the user cannot see by the focus alone: the loading of the image, the zoom level, the start of the edit mode, a selected corner and the position of a moved corner, the value of a ruler, the result of Apply, and any failure.
- The switch of Clean up has the role of a switch. A tool in use, which a dot marks on screen, is described as "In use". While Clean up is on, Adjust is described with the reason it is disabled.

## Touch screens

- With `any-pointer: coarse`, buttons and corner handles measure at least 44 pixels. Any touch screen matches it, also on a laptop with a trackpad.
- While a finger drags a corner, a magnifier shows the area under it.
- A corner also moves without dragging: press its handle, and then tap where it goes. This works with a mouse too.
- While the image is fitted, one finger scrolls the page, so the viewer does not trap people inside it. Once zoomed, it pans the image.

## Preferences

- **Reduced motion.** With `prefers-reduced-motion: reduce`, the buttons change state without transitions.
- **Forced colors.** In Windows high contrast and other forced color modes, pressed buttons and the main actions keep a visible outline.
- **Dark mode.** The colors follow the `color-scheme` of your page, which can follow the system. See [Styling](./styling#dark-mode).
