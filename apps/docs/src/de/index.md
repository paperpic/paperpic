---
layout: home
title: PaperPic
titleTemplate: Betrachter und Editor für Dokumentbilder
description: "Viewer und Editor für Dokumentbilder im Browser: Smartphone-Fotos, Scans und jedes Bild mit Text begradigen, beschneiden, drehen und bereinigen. Für JavaScript, Vue und React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Saubere, lesbare Dokumentbilder, direkt im Browser
  tagline: Begradige, beschneide und bereinige ein Smartphone-Foto, einen Scan oder jedes Bild mit Text. Mit JavaScript, Vue oder React, und nichts verlässt das Gerät, bis dein Code es sendet.
  actions:
    - theme: brand
      text: Loslegen
      link: /de/guide/getting-started
    - theme: alt
      text: Playground
      link: /de/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Viewer"
    details: "Zoome mit den Schaltflächen, dem Mausrad oder zwei Fingern, verschiebe das Bild und passe die Breite langer Kassenbons ein. Schreibgeschützt, wenn nötig."
    link: /de/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Begradigen und zuschneiden"
    details: "Mach aus einem schrägen Foto eine flache Seite, mit geschätztem oder festem Seitenverhältnis. Der Viewer findet die Ecken, und du kannst sie ziehen."
    link: /de/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Bereinigen"
    details: "Mach aus einem Foto mit Schatten klares Schwarzweiß, und passe Helligkeit und Kontrast farbiger Dokumente an."
    link: /de/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Volle Auflösung"
    details: "Übernehmen gibt deinem Code das bearbeitete Bild als Blob, verarbeitet in einem Web Worker, damit die Seite reaktionsschnell bleibt."
    link: /de/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Barrierefrei"
    details: "Tastenkürzel, Eckgriffe, die sich mit den Pfeiltasten bewegen, und Ansagen für Screenreader."
    link: /de/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Jedes Framework"
    details: "Ein Kern für JavaScript ohne Framework, schlanke Wrapper für Vue und React, und keine Laufzeitabhängigkeiten."
    link: /de/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Foto und Ergebnis vergleichen"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto eines Kassenbons auf einem Tisch, schräg aufgenommen und teils im Schatten"
  afterAlt: "Derselbe Kassenbon, begradigt und zu Schwarzweiß bereinigt"
---

## Nichts verlässt den Browser

PaperPic bearbeitet das Bild auf dem Gerät des Nutzers, in einem Web Worker, ohne Server und ohne eigene Anfragen. Das Foto eines Kassenbons, eines Ausweises oder eines Vertrags verlässt das Gerät erst, wenn dein Code das Ergebnis sendet.

## In wenigen Zeilen loslegen

Installiere das Paket für dein Framework, gib dem Container eine Höhe und reagiere auf Übernehmen:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'Ein Kassenbon' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="Ein Kassenbon" onApply={({ blob }) => upload(blob)} />
}
```

:::

[Erste Schritte](./guide/getting-started) erklärt die Installation und jeden Schritt.
