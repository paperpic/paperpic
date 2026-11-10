---
title: Token CSS
description: Le proprietà personalizzate CSS che danno stile a PaperPic, con i loro valori chiari e scuri, più il suo foglio di stile, il suo livello di cascata e i suoi nomi di classe.
---

# Token CSS

I token sono proprietà personalizzate CSS che cambiano l’aspetto del componente senza sovrascriverne le regole. Impostali su `:root`, su un antenato del visualizzatore o su `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Predefinito | Scuro     | Descrizione                               |
| -------------------------------- | ----------- | --------- | ----------------------------------------- |
| `--paperpic-color-surface`       | `#fff`      | `#151e2e` | Sfondo dell’interfaccia                   |
| `--paperpic-color-text`          | `#1a263c`   | `#f2f5f9` | Testo dell’interfaccia                    |
| `--paperpic-color-accent`        | `#0a84ff`   | `#5cb5ff` | Colore d’accento dell’interfaccia         |
| `--paperpic-radius`              | `6px`       | `6px`     | Raggio degli angoli dell’interfaccia      |
| `--paperpic-transition-duration` | `0.2s`      | `0.2s`    | Durata delle transizioni dell’interfaccia |

## Modalità scura

I valori scuri si applicano quando il sistema dell’utente preferisce uno schema di colori scuro. Se il tuo sito cambia tema in un altro modo, ad esempio con una classe su `<html>`, imposta tu i colori di ogni tema:

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

## Foglio di stile

Ogni pacchetto include un foglio di stile. Importalo una volta nella tua app:

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

Le sue regole stanno nel livello di cascata `paperpic`, quindi qualsiasi tuo CSS fuori da un livello le sovrascrive, qualunque sia la sua specificità. Questo vale anche per i reset globali, come una regola su `button`.

## Nomi di classe

`.paperpic` è la radice del visualizzatore, e `.paperpic-host` è l’elemento che i componenti Vue e React creano attorno a esso. Tutte le classi del componente iniziano con `paperpic`, e i loro nomi sono stabili. Preferisci i token quando coprono ciò che ti serve.
