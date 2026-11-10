---
title: Die Oberfläche übersetzen
description: Wie du PaperPic mit der Option labels übersetzt oder seine Wortwahl änderst, einschließlich der Texte für Screenreader, und wie es der Sprache deiner App folgt.
---

# Die Oberfläche übersetzen

PaperPic zeigt seine Schaltflächen, Hinweise und Meldungen auf Englisch, und Screenreader sagen Änderungen ebenfalls auf Englisch an. Die Option [`labels`](../reference/options#labels) ersetzt jeden dieser Texte, damit die Komponente die Sprache deiner App spricht. Die Pakete enthalten keine Übersetzungen.

## Einige Texte ersetzen

Übergib nur die Texte, die du ändern willst. Die übrigen behalten ihren englischen Text:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Speichern', threshold: 'Schwarzweiß' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Speichern', threshold: 'Schwarzweiß' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Speichern', threshold: 'Schwarzweiß' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Beschriftungen](../reference/labels) listet alle Schlüssel mit ihrem englischen Text und dem Ort, an dem sie erscheinen.

## Texte mit einem Wert

Vier Beschriftungen sind Funktionen, weil ihr Text einen Wert enthält: den Zoom, die Empfindlichkeit von Bereinigen, eine Ecke mit ihrer Position und einen Regler von Anpassen. Screenreader sagen sie an. Formatiere die Zahlen so, wie es deine Sprache tut:

```ts
const signed = new Intl.NumberFormat('de', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent} %`,
  thresholdLevel: percent => `Empfindlichkeit ${percent} %`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Der Sprache deiner App folgen

Wenn deine App die Sprache wechselt, übergib neue Beschriftungen, und der Viewer aktualisiert seine Texte sofort. Erstelle das Objekt nur, wenn sich die Sprache ändert, damit der Viewer nicht bei jedem Rendern ein neues bekommt:

:::tabs key:framework
== JavaScript

```ts
function setLanguage(language: string) {
  pic.setOptions({ labels: translations[language] })
}
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const labels = computed(() => translations[locale.value])
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import { useMemo } from 'react'

export function Receipt({ language }: { language: string }) {
  const labels = useMemo(() => translations[language], [language])
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

Hier steht `translations` für dein eigenes Objekt mit Beschriftungen für jede Sprache.

## Ein Ausgangspunkt

Diese Website zeigt die Komponente in neun Sprachen neben Englisch. Ihre Beschriftungen stehen in [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), und du kannst sie in deine App kopieren.
