---
layout: home
title: PaperPic
titleTemplate: Document image viewer and editor
description: Open-source document image viewer and editor. Zoom, rotate, correct perspective, adjust brightness and contrast, convert to black & white and remove shadows.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Document images, done right
  tagline: View and edit document photos. Zoom, rotate, correct perspective, adjust brightness and contrast, convert to clean black & white and remove shadows.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Playground
      link: /playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Viewer"
    details: "Zoom with the buttons, the wheel or a pinch, pan, and fit the width of long receipts. Read-only when you need it."
    link: /guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Straighten and crop"
    details: "Drag four corners to turn a photo taken at an angle into a flat page, with its proportions estimated or set."
    link: /guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Clean up"
    details: "Turn a shadowed photo into crisp black and white, and adjust brightness and contrast for color documents."
    link: /guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Full resolution"
    details: "Apply hands your code the edited image as a Blob, processed in a Web Worker so the page stays responsive."
    link: /guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessible"
    details: "Keyboard shortcuts, corner handles that move with the arrow keys, and announcements for screen readers."
    link: /guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Any framework"
    details: "One core for plain JavaScript, with thin wrappers for Vue and React, and no runtime dependencies."
    link: /guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Compare the photo and the result"
  beforeLabel: "Photo"
  afterLabel: "PaperPic"
  beforeAlt: "Photo of a receipt on a table, taken at an angle and partly in shadow"
  afterAlt: "The same receipt, straightened and cleaned up into black and white"
---
