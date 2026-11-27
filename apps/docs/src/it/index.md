---
layout: home
title: PaperPic
titleTemplate: Visualizzatore ed editor di immagini di documenti
description: "Visualizzatore ed editor di immagini di documenti per il browser: raddrizza, ritaglia, ruota e pulisci foto del telefono, scansioni e qualsiasi immagine con del testo. Per JavaScript, Vue e React."

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Immagini di documenti pulite e leggibili, direttamente nel browser
  tagline: Raddrizza, ritaglia e pulisci una foto del telefono, una scansione o qualsiasi immagine con del testo. Con JavaScript, Vue o React, e niente lascia il dispositivo finché il tuo codice non lo invia.
  image:
    src: /hero.svg
    alt: ""
  actions:
    - theme: brand
      text: Inizia
      link: /it/guide/getting-started
    - theme: alt
      text: Playground
      link: /it/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visualizzatore"
    details: "Zooma con i pulsanti, la rotellina o il pizzico, sposta l’immagine e adatta la larghezza degli scontrini lunghi. In sola lettura se serve."
    link: /it/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Raddrizza e ritaglia"
    details: "Trasforma una foto scattata di sbieco in una pagina piatta, con le proporzioni stimate o fissate. Il visualizzatore trova gli angoli, e puoi trascinarli."
    link: /it/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Pulisci"
    details: "Trasforma una foto piena di ombre in un bianco e nero nitido, e regola luminosità e contrasto dei documenti a colori."
    link: /it/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Risoluzione piena"
    details: "Quando applichi le modifiche, il tuo codice riceve l’immagine modificata come Blob, elaborata in un Web Worker così la pagina resta reattiva."
    link: /it/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessibile"
    details: "Scorciatoie da tastiera, maniglie d’angolo che si spostano con le frecce e annunci per i lettori di schermo."
    link: /it/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Qualsiasi framework"
    details: "Un core per JavaScript senza framework, wrapper leggeri per Vue e React, nessuna dipendenza a runtime e meno di 40 kB con gzip, stili inclusi."
    link: /it/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Confronta la foto e il risultato"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto di uno scontrino su un tavolo, scattata di sbieco e in parte in ombra"
  afterAlt: "Lo stesso scontrino, raddrizzato e pulito in bianco e nero"
---

## Inizia in poche righe

Installa il pacchetto del tuo framework, dai un’altezza al contenitore e ascolta l’evento `apply`:

:::tabs key:framework
== JavaScript

```sh
npm install @paperpic/core
```

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector<HTMLElement>('#viewer')!, { src: '/receipt.jpg', alt: 'Uno scontrino' })
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```sh
npm install @paperpic/vue
```

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'
</script>

<template>
  <PaperPic src="/receipt.jpg" alt="Uno scontrino" @apply="({ blob }) => upload(blob)" />
</template>
```

== React

```sh
npm install @paperpic/react
```

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

export function Receipt() {
  return <PaperPic src="/receipt.jpg" alt="Uno scontrino" onApply={({ blob }) => upload(blob)} />
}
```

:::

[Primi passi](./guide/getting-started) spiega l’installazione e ogni passo.
