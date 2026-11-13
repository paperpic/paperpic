---
title: Token CSS
description: Le proprietà personalizzate CSS che danno stile a PaperPic, con i loro valori chiari e scuri, più il suo foglio di stile, il suo livello di cascata, le sue classi pubbliche e i nomi dei suoi controlli.
---

# Token CSS

I token sono proprietà personalizzate CSS che cambiano l’aspetto del componente senza sovrascriverne le regole. Impostali su `:root`, su un antenato del visualizzatore o su `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Chiaro    | Scuro     | Descrizione                               |
| -------------------------------- | --------- | --------- | ----------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Colore d’accento dell’interfaccia         |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Sfondo dell’interfaccia                   |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Testo dell’interfaccia                    |
| `--paperpic-radius`              | `6px`     | `6px`     | Raggio degli angoli dell’interfaccia      |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Durata delle transizioni dell’interfaccia |

## Modalità scura

I token di colore prendono il loro valore chiaro o scuro con `light-dark()`, secondo il `color-scheme` della pagina. Senza `color-scheme` sono chiari. Con `color-scheme: dark` sono scuri, e con `color-scheme: light dark` sono scuri quando il sistema preferisce uno schema di colori scuro. [Stili](../guide/styling#dark-mode) mostra come impostarlo.

Per scegliere entrambi i valori di un token, usa anche tu `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
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

Le sue regole stanno nel livello di cascata `paperpic`, quindi qualsiasi tuo CSS fuori da un livello le sovrascrive, qualunque sia la sua specificità. Questo vale anche per i reset globali, come una regola su `button`. Con Tailwind CSS, nomina l’ordine dei livelli, come mostra [Stili](../guide/styling#tailwind).

## Classi {#classes}

Queste classi sono pubbliche: i loro nomi, e gli elementi che marcano, restano stabili tra una versione e l’altra. Le altre classi del componente tengono insieme la sua disposizione e possono cambiare in qualsiasi versione.

| Classe                    | Elemento                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `paperpic`                | La radice del visualizzatore                                                                                                          |
| `paperpic-button`         | Ogni pulsante della barra degli strumenti e della barra di modifica                                                                   |
| `paperpic-button-danger`  | Elimina, nella domanda prima di eliminare le modifiche                                                                                |
| `paperpic-button-primary` | Applica, e Fatto in ogni strumento                                                                                                    |
| `paperpic-button-text`    | I pulsanti della domanda prima di eliminare le modifiche                                                                              |
| `paperpic-edit-bar`       | La barra di modifica, una scheda in basso durante la modifica                                                                         |
| `paperpic-editing`        | La radice, durante la modifica                                                                                                        |
| `paperpic-handle`         | Una maniglia d’angolo di Ritaglia e Raddrizza                                                                                         |
| `paperpic-host`           | L’elemento che i componenti Vue e React creano attorno al visualizzatore                                                              |
| `paperpic-icon`           | L’icona di un pulsante                                                                                                                |
| `paperpic-status`         | Il messaggio per i lettori di schermo, che si vede anche mentre l’immagine si carica o le modifiche si applicano, e in caso di errore |
| `paperpic-status-visible` | Il messaggio, mentre si vede al centro del visualizzatore                                                                             |
| `paperpic-toolbar`        | La barra degli strumenti, a destra, nascosta durante la modifica                                                                      |
| `paperpic-viewport`       | L’area che mostra l’immagine e riceve il focus della tastiera                                                                         |

I pulsanti mostrano il loro stato con attributi ARIA, che puoi selezionare anche tu:

| Attributo                | Stato                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | Il pulsante ora non può agire. Mantiene il focus della tastiera, quindi non è `disabled`                       |
| `[aria-pressed='true']`  | L’adattamento in uso, Adatta alla larghezza o Adatta all’altezza, o la scelta di Regola che il righello cambia |

Il passaggio del puntatore e questi stati si disegnano con `box-shadow`, che i reset globali dei pulsanti non toccano. Per cambiarli, sovrascrivi anche `box-shadow`.

## Controlli {#controls}

Ogni pulsante, righello e maniglia d’angolo porta `data-paperpic-control`, con la chiave della sua [etichetta](./labels). Selezionalo per dare stile a un solo controllo:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Posizione                  | Valori                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Barra degli strumenti      | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`                                  |
| Barra di modifica          | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply`                          |
| Regola e Pulisci           | `brightness` e `contrast`, le scelte e i loro righelli, `threshold`, l’interruttore, e `thresholdSensitivity`, il suo righello |
| Ogni strumento             | `cancelTool`, `confirm`                                                                                                        |
| Ritaglia e Raddrizza       | `zoomIn`, `zoomOut`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`                                |
| Domanda prima di eliminare | `keepEditing`, `discard`                                                                                                       |

`rotateLeft` indica due pulsanti che non si vedono mai insieme: quello di un visualizzatore di sola lettura, che ruota la vista, e quello della barra di modifica, che ruota l’immagine. Lo stesso vale per `zoomIn` e `zoomOut`, nella barra degli strumenti e in un pannello, e per `threshold`, il pulsante di Pulisci e il suo interruttore. `brightness` e `contrast` indicano una scelta e il suo righello, che si vedono insieme: aggiungi `button` o `input` al selettore per distinguerli.
