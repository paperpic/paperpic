---
title: Erste Schritte mit Vue
description: Installiere @paperpic/vue und zeige dein erstes Dokumentbild mit der PaperPic-Komponente in einer Vue-3-Anwendung an.
---

# Erste Schritte

PaperPic befindet sich in einer frühen Entwicklungsphase. Die unten gezeigte API ist vorläufig und wird sich ändern.

## Installation

```sh
pnpm add @paperpic/vue
```

`@paperpic/vue` benötigt Vue 3.5 oder neuer.

## Verwendung

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

function save({ blob }: { blob: Blob }) {
  // Lade das bearbeitete Bild hoch
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/document.jpg" alt="Gescanntes Dokument" @apply="save" />
  </div>
</template>
```

Der Viewer füllt sein Elternelement aus, gib diesem also eine Höhe. Der Stift öffnet den Bearbeitungsmodus, und `apply` liefert das bearbeitete Bild als `Blob`. Mit `:editable="false"` ist es ein schreibgeschützter Viewer.

Probiere es live im [Playground](/de/playground) aus.
