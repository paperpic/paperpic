---
title: Stili
description: Come adattare PaperPic all’aspetto della tua app, con il suo foglio di stile, i suoi token CSS, la modalità scura e un livello di cascata che lascia vincere il tuo CSS.
---

# Stili

PaperPic deve sembrare parte della tua app. Include un solo foglio di stile, prende colori e angoli da pochi token CSS e tiene le sue regole in un livello di cascata, così il tuo CSS vince sempre.

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

## Modalità scura {#dark-mode}

I colori passano a quelli scuri quando il sistema dell’utente preferisce uno schema di colori scuro. Se il tuo sito cambia tema in un altro modo, ad esempio con una classe su `<html>`, imposta tu i colori di ogni tema:

```css
:root {
  --paperpic-color-surface: #fff;
  --paperpic-color-text: #1a263c;
  --paperpic-color-accent: #0a84ff;
}

:root.dark {
  --paperpic-color-surface: #151e2e;
  --paperpic-color-text: #f2f5f9;
  --paperpic-color-accent: #5cb5ff;
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

## Disposizione

L’interfaccia si adatta da sola al suo contenitore:

- La barra degli strumenti sta a destra e scorre quando il visualizzatore è troppo basso per i suoi pulsanti.
- La barra di modifica sta in basso, su una riga, o su due in un visualizzatore più stretto di 28rem.
- Sugli schermi touch, i pulsanti e le maniglie d’angolo misurano almeno 44 pixel.

## Nomi di classe

Tutte le classi del componente iniziano con `paperpic`, e i loro nomi sono stabili, quindi puoi usarle nei tuoi selettori. Preferisci i token quando coprono ciò che ti serve, perché continuano a funzionare anche se cambia la struttura interna.
