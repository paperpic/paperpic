---
title: Bearbeitung
description: Wie der Bearbeitungsmodus von PaperPic funktioniert, von der Schaltfläche Bearbeiten bis Übernehmen, mit den Werkzeugen, Rückgängig und Wiederholen, der Vorschau und den Ereignissen für deinen Code.
---

# Bearbeitung

Das Foto eines Dokuments braucht meist ein paar Korrekturen, bevor es sich lohnt, es zu behalten. Der Bearbeitungsmodus bündelt sie: Der Nutzer macht die Änderungen, prüft sie und übernimmt alle auf einmal. Im [Playground](../playground) kannst du den ganzen Bearbeitungsmodus ausprobieren.

## Der Ablauf

1. Der Nutzer drückt Bearbeiten, den Stift in der Werkzeugleiste. Die Bearbeitungsleiste erscheint unten im Viewer.
2. Jedes Werkzeug der Bearbeitungsleiste fügt eine Änderung hinzu, die der Viewer sofort zeigt. Rückgängig und Wiederholen gehen durch die Änderungen.
3. Übernehmen berechnet das Ergebnis und kehrt zur Ansicht zurück. Abbrechen verwirft die Änderungen und fragt vorher nach, wenn es welche gibt.

Nichts verändert das Bild vor dem Übernehmen. Bis dahin sind die Änderungen eine Liste, die der Viewer als Vorschau zeigt.

## Werkzeuge

| Werkzeug          | Was es tut                                                  | Id            |
| ----------------- | ----------------------------------------------------------- | ------------- |
| Zuschneiden       | Behält den Teil des Bildes innerhalb von vier Ecken         | `crop`        |
| Begradigen        | Macht aus einem schräg aufgenommenen Foto eine flache Seite | `perspective` |
| Nach links drehen | Dreht das Bild um eine Vierteldrehung nach links            | `rotate`      |
| Spiegeln          | Spiegelt das Bild von links nach rechts                     | `flip`        |
| Anpassen          | Ändert Helligkeit und Kontrast                              | `adjust`      |
| Bereinigen        | Macht aus dem Dokument klares Schwarzweiß, ohne Schatten    | `threshold`   |

Die Option [`tools`](../reference/options#tools) wählt aus, welche die Bearbeitungsleiste anbietet:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  tools: ['crop', 'perspective', 'rotate'],
})
```

== Vue

```vue
<script setup lang="ts">
import type { ToolId } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']
</script>

<template>
  <PaperPic src="/receipt.jpg" :tools />
</template>
```

== React

```tsx
import type { ToolId } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const tools: ToolId[] = ['crop', 'perspective', 'rotate']

export function Receipt() {
  return <PaperPic src="/receipt.jpg" tools={tools} />
}
```

:::

Zuschneiden und Begradigen haben eine eigene Auswahl, deshalb wartet der Rest der Bearbeitungsleiste, solange eines von beiden offen ist. Fertig, oder `Enter`, fügt die Auswahl zu den Änderungen hinzu, und Dieses Werkzeug abbrechen, oder `Esc`, verwirft sie.

## Vorschau und Übernehmen

Während der Bearbeitung zeigt der Viewer die Änderungen als Vorschau auf einer Kopie des Bildes mit etwa 2 Megapixeln, damit er auch bei großen Fotos schnell bleibt. Stark vergrößert wirkt die Vorschau weicher als das Ergebnis. Übernehmen berechnet jede Änderung in voller Auflösung oder in [`maxOutputSize`](../reference/options#maxoutputsize), in einem Web Worker.

Übernehmen lässt sich nicht unterbrechen. Es sperrt die Bedienelemente und zeigt eine Meldung, solange es läuft. Danach ersetzt das Ergebnis das angezeigte Bild, der Verlauf leert sich, und der Viewer kehrt in den Ansichtsmodus zurück. Schlägt Übernehmen fehl, bleibt die Bearbeitung offen, damit der Nutzer es erneut versuchen kann.

## Was dein Code erhält

| Ereignis | Wann                                                                 |
| -------- | -------------------------------------------------------------------- |
| `change` | Nach jeder Aktion des Nutzers, mit dem [Zustand](../reference/state) |
| `apply`  | Wenn das Ergebnis fertig ist, mit `{ blob, width, height, type }`    |
| `error`  | Wenn Übernehmen fehlschlägt oder das Bild nicht geladen werden kann  |

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
pic.on('error', ({ error }) => console.error(error))
```

== Vue

```vue
<PaperPic
  src="/receipt.jpg"
  @apply="({ blob }) => upload(blob)"
  @error="({ error }) => console.error(error)"
/>
```

== React

```tsx
<PaperPic
  src="/receipt.jpg"
  onApply={({ blob }) => upload(blob)}
  onError={({ error }) => console.error(error)}
/>
```

:::

## Was die Änderungen verwirft

- Abbrechen, nachdem der Nutzer bestätigt hat, oder [`cancel()`](../reference/methods#cancel), das nicht nachfragt.
- Ein neuer `src` während der Bearbeitung.
- Eine Änderung von `editable` während der Bearbeitung.

Nach dem Übernehmen bewirkt derselbe `src` ein zweites Mal nichts, das Ergebnis bleibt also sichtbar. [`reload()`](../reference/methods#reload) holt das Original zurück.

## Tastatur

Wenn der Viewer den Fokus hat:

| Taste                           | Aktion                                                          |
| ------------------------------- | --------------------------------------------------------------- |
| `Strg+Z`                        | Rückgängig                                                      |
| `Strg+Umschalt+Z` oder `Strg+Y` | Wiederholen                                                     |
| `Enter`                         | Das offene Werkzeug bestätigen, sonst die Änderungen übernehmen |
| `Esc`                           | Das offene Werkzeug schließen, sonst die Änderungen abbrechen   |

Unter macOS funktioniert `Cmd` wie `Strg`.
