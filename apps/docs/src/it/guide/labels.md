---
title: Tradurre l’interfaccia
description: Come tradurre PaperPic o cambiarne le parole con l’opzione labels, compresi i testi letti dai lettori di schermo, e come seguire la lingua della tua app.
---

# Tradurre l’interfaccia

PaperPic mostra pulsanti, suggerimenti e messaggi in inglese, e i lettori di schermo annunciano ciò che cambia, sempre in inglese. L’opzione [`labels`](../reference/options#labels) sostituisce qualsiasi di questi testi, così il componente parla la lingua della tua app. I pacchetti non includono traduzioni.

## Sostituire alcuni testi

Passa solo i testi che vuoi cambiare. Gli altri mantengono il testo inglese:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: { apply: 'Salva', finish: 'Migliora' },
})
```

== Vue

```vue
<script setup lang="ts">
import type { PaperPicLabels } from '@paperpic/vue'
import { PaperPic } from '@paperpic/vue'

const labels: Partial<PaperPicLabels> = { apply: 'Salva', finish: 'Migliora' }
</script>

<template>
  <PaperPic src="/receipt.jpg" :labels />
</template>
```

== React

```tsx
import type { PaperPicLabels } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'

const labels: Partial<PaperPicLabels> = { apply: 'Salva', finish: 'Migliora' }

export function Receipt() {
  return <PaperPic src="/receipt.jpg" labels={labels} />
}
```

:::

[Etichette](../reference/labels) elenca tutte le chiavi, con il loro testo inglese e dove compaiono.

## Testi con un valore

Cinque etichette sono funzioni, perché il loro testo include un valore: lo zoom, la sensibilità di Pulisci, un angolo e la sua posizione, un angolo selezionato, e il righello di Regola. I lettori di schermo le annunciano. Formatta i numeri come fa la tua lingua:

```ts
const signed = new Intl.NumberFormat('it', { signDisplay: 'exceptZero' })

const labels: Partial<PaperPicLabels> = {
  zoomLevel: percent => `Zoom ${percent}%`,
  finishLevel: percent => `Sensibilità ${percent}%`,
  cornerMoved: (corner, x, y) => `${corner}: ${x}, ${y}`,
  cornerSelected: corner => `${corner}: tocca il punto in cui va`,
  adjustmentLevel: (name, value) => `${name} ${signed.format(value)}`,
}
```

## Seguire la lingua della tua app

Quando la tua app cambia lingua, passa le etichette della nuova lingua, e il visualizzatore aggiorna subito i suoi testi. Tieni un oggetto di etichette per lingua, creato una volta sola, così ogni render passa lo stesso oggetto:

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

export function Receipt({ language }: { language: string }) {
  return <PaperPic src="/receipt.jpg" labels={translations[language]} />
}
```

:::

Qui `translations` rappresenta il tuo oggetto di etichette per ogni lingua.

## Un punto di partenza

Questo sito mostra il componente in nove lingue oltre all’inglese. Le loro etichette sono in [`paperpic-labels.ts`](https://github.com/paperpic/paperpic/blob/development/apps/docs/.vitepress/theme/components/paperpic-labels.ts), e puoi copiarle nella tua app.
