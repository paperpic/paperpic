---
title: Stili
description: Come adattare PaperPic all’aspetto della tua app, con il suo foglio di stile, i suoi token CSS, la modalità scura, le tue icone e un livello di cascata che lascia vincere il tuo CSS.
---

# Stili

PaperPic deve sembrare parte della tua app. Include un solo foglio di stile, prende colori e angoli da pochi token CSS, segue lo schema di colori della tua pagina e tiene le sue regole in un livello di cascata, così il tuo CSS vince sempre.

## Importare il foglio di stile

Importalo una volta nella tua app:

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

## Dargli una dimensione

Il visualizzatore riempie il suo contenitore e non ha un’altezza propria, quindi il contenitore ne ha bisogno. Va bene qualsiasi CSS che gli dia un’altezza:

```css
.document-viewer {
  height: 70dvh;
}
```

Il visualizzatore segue la dimensione del suo contenitore, non quella dello schermo. Reagisce quando il contenitore cambia, ad esempio quando si apre un pannello laterale.

## Colori e angoli

Cinque [token CSS](../reference/css-tokens) stabiliscono lo sfondo, il testo, il colore d’accento, il raggio degli angoli e la durata delle transizioni. Impostali su `:root`, su un antenato del visualizzatore o su `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

I token si ereditano, quindi una classe sul contenitore di un visualizzatore, o sul componente Vue o React, cambia solo quel visualizzatore:

```css
.signature-viewer {
  --paperpic-color-accent: #15803d;
}
```

## Usare i colori del tuo design system {#design-system}

Se la tua app tiene i suoi colori in variabili CSS, fai puntare i token a quelle invece di copiarne i valori. Così il visualizzatore segue il tuo tema, modalità scura compresa:

```css
.paperpic {
  --paperpic-color-surface: var(--app-surface);
  --paperpic-color-text: var(--app-text);
  --paperpic-color-accent: var(--app-primary);
  --paperpic-radius: var(--app-radius);
}
```

Impostali su `.paperpic`, come qui. Un token che usa `var()` legge la variabile sull’elemento dove lo imposti, quindi su `:root` non vedrebbe un tema che cambi in una parte della pagina.

Va bene qualsiasi design system con variabili CSS, come le variabili del tema di Tailwind CSS 4: `var(--color-blue-600)` o `var(--radius-md)`.

## Modalità scura {#dark-mode}

I colori seguono il `color-scheme` della tua pagina, come fanno i controlli dei moduli del browser:

- Con `color-scheme: light dark`, diventano scuri quando il sistema dell’utente preferisce uno schema di colori scuro.
- Con `color-scheme: dark`, sono sempre scuri. Funziona anche in una parte della pagina.
- Senza `color-scheme`, restano chiari, quindi una pagina senza tema scuro mantiene un visualizzatore chiaro.

Se il tuo sito segue il sistema, dichiaralo una volta:

```css
:root {
  color-scheme: light dark;
}
```

Se il tuo sito cambia tema con una classe, ad esempio su `<html>`, imposta `color-scheme` con quella classe. Anche le barre di scorrimento e i controlli dei moduli del browser lo seguono:

```css
:root.dark {
  color-scheme: dark;
}
```

Per scegliere i tuoi colori scuri, dai a un token entrambi i valori con `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

I token che puntano alle variabili del tuo [design system](#design-system) seguono invece il tuo tema.

## Icone {#icons}

L’opzione [`icons`](../reference/options#icons) sostituisce qualsiasi icona con il tuo markup, di solito un `<svg>` dal set di icone della tua app:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'
import '@paperpic/core/style.css'

const pic = new PaperPic(document.querySelector('#viewer'), {
  src: '/receipt.jpg',
  icons: {
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
  },
})
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import '@paperpic/vue/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}
</script>

<template>
  <div style="height: 480px">
    <PaperPic src="/receipt.jpg" :icons="icons" />
  </div>
</template>
```

== React

```tsx
import { PaperPic } from '@paperpic/react'
import '@paperpic/react/style.css'

const icons = {
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7" /><path d="M11 8v6M8 11h6M20 20l-4-4" /></svg>',
}

export function Receipt() {
  return (
    <div style={{ height: 480 }}>
      <PaperPic src="/receipt.jpg" icons={icons} />
    </div>
  )
}
```

:::

- Ogni chiave indica un’icona, e alcune icone compaiono su due pulsanti: `apply` è anche su Fatto, e `cancel` chiude anche uno strumento. [Opzioni](../reference/options#icons) elenca tutte le chiavi.
- PaperPic dà all’icona la classe `paperpic-icon`, che ne fissa la dimensione, e la nasconde ai lettori di schermo, perché il pulsante ha già un nome.
- Disegna l’icona con `currentColor`, così prende il colore del pulsante in ogni tema.
- Il markup entra nella pagina come HTML, quindi passa solo markup di cui ti fidi.
- Con Vite, `import zoomIn from './zoom-in.svg?raw'` ti dà il markup di un file `.svg`.

Per cambiare tutte le icone insieme, come la loro dimensione o lo spessore delle linee, dai stile alla classe:

```css
.paperpic-icon {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  stroke-width: 1.5;
}
```

## Il tuo CSS vince

Le regole di PaperPic stanno nel livello di cascata `paperpic`, e qualsiasi CSS fuori da un livello le sovrascrive, qualunque sia la sua specificità. Questo rende facile personalizzarlo, ma anche un reset globale fuori da un livello, come una regola su `button`, raggiunge i pulsanti del visualizzatore.

Se il tuo reset rompe il visualizzatore, spostalo in un livello che venga prima di `paperpic`. La prima istruzione che nomina i livelli ne fissa l’ordine, quindi mettila in un CSS che si carichi prima del foglio di stile di PaperPic:

```css
@layer reset, paperpic;

@layer reset {
  button {
    all: unset;
  }
}
```

## Tailwind CSS {#tailwind}

Anche Tailwind CSS 4 tiene le sue regole in livelli di cascata. Nomina tutti i livelli, in ordine, prima di importare Tailwind e PaperPic, così il reset di Tailwind viene prima di `paperpic` e le sue utility dopo:

:::tabs key:framework
== JavaScript

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/core/style.css';
```

== Vue

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/vue/style.css';
```

== React

```css
@layer theme, base, paperpic, components, utilities;

@import 'tailwindcss';
@import '@paperpic/react/style.css';
```

:::

Importa qui il foglio di stile di PaperPic, nel tuo CSS, e non da JavaScript. In un altro ordine, il reset di Tailwind toglie spaziature interne e bordi al visualizzatore, oppure il visualizzatore sovrascrive utility come `h-96` sul componente.

## Nomi di classe {#class-names}

Il [riferimento CSS](../reference/css-tokens#classes) elenca le classi che puoi usare nei tuoi selettori, come `paperpic-toolbar` e `paperpic-button`, e i loro nomi sono stabili. Le altre classi tengono insieme la disposizione e possono cambiare in qualsiasi versione. Preferisci i token quando coprono ciò che ti serve.

Ogni pulsante, righello e maniglia d’angolo porta anche `data-paperpic-control`, con la chiave della sua [etichetta](../reference/labels). Selezionalo per dare stile a un solo controllo:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

## Disposizione

L’interfaccia si adatta da sola al suo contenitore:

- La barra degli strumenti sta a destra e scorre quando il visualizzatore è troppo basso per i suoi pulsanti. Si nasconde durante la modifica.
- La barra di modifica è una scheda in basso con due righe di altezza fissa, o una riga in un visualizzatore largo almeno 28rem, così l’immagine resta al suo posto quando si apre uno strumento.
- Sugli schermi touch, i pulsanti e le maniglie d’angolo misurano almeno 44 pixel.

## I tuoi controlli

Quando gli stili non bastano, nascondi la barra degli strumenti e la barra di modifica con `toolbar: false`, e guida il visualizzatore con controlli tuoi. [Barra degli strumenti personalizzata](../examples/custom-toolbar) mostra come.
