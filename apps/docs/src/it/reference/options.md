---
title: Opzioni
description: Tutte le opzioni di PaperPic, con il loro tipo, il valore predefinito e cosa cambiano, per il costruttore, setOptions() e le props dei componenti Vue e React.
---

# Opzioni

Le opzioni stabiliscono cosa mostra il visualizzatore e cosa può farci l’utente. Passale quando crei il visualizzatore, o cambiale dopo con [`setOptions()`](./methods#setoptions). I componenti Vue e React le ricevono come props con gli stessi nomi.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Uno scontrino' })

pic.setOptions({ editable: false })
```

`setOptions()` cambia solo le opzioni che passi, e `undefined` riporta un’opzione al suo valore predefinito. Non emette mai `change`. Un’opzione fuori dal suo intervallo lancia un `RangeError` che la nomina, come un `softness` di 2.

## Immagine

### `src`

- **Tipo:** [`PaperPicSource`](./types#paperpicsource)
- **Valore predefinito:** nessuno

L’immagine da mostrare: un URL, oppure un `File` o un `Blob`. Un’immagine da un’altra origine si vede, ma non si può modificare: [Caricare le immagini](../guide/loading#fetch) spiega perché, e cosa fare.

Passare di nuovo lo stesso valore non ricarica l’immagine, quindi il risultato di una modifica resta visibile. Chiama [`reload()`](./methods#reload) per riavere l’originale. Un valore nuovo durante la modifica scarta i cambiamenti.

### `alt`

- **Tipo:** `string`
- **Valore predefinito:** `''`

Descrive l’immagine per i lettori di schermo. Senza `alt`, i lettori di schermo saltano l’immagine, come fanno con un `<img>` con `alt` vuoto.

## Interfaccia

### `editable`

- **Tipo:** `boolean`
- **Valore predefinito:** `true`

Se l’utente può modificare l’immagine. Con `false` è un visualizzatore di sola lettura, e la sua barra degli strumenti aggiunge pulsanti per ruotare l’immagine. Quella rotazione cambia solo la visualizzazione. Cambiare questa opzione durante la modifica scarta i cambiamenti.

### `toolbar`

- **Tipo:** `boolean`
- **Valore predefinito:** `true`

Se mostrare la barra degli strumenti e la barra di modifica integrate. Senza di esse, crea i tuoi controlli con i [metodi](./methods).

### `tools`

- **Tipo:** [`readonly ToolId[]`](./types#toolid)
- **Valore predefinito:** tutti gli strumenti

Gli strumenti che offre la barra di modifica. Mantengono l’ordine di questa tabella, qualunque sia l’ordine dell’array. Sceglie solo i pulsanti: i [metodi](./methods) funzionano con ogni strumento.

| Id              | Pulsante                                 |
| --------------- | ---------------------------------------- |
| `'crop'`        | Ritaglia                                 |
| `'perspective'` | Raddrizza                                |
| `'rotate'`      | Ruota a sinistra                         |
| `'flip'`        | Capovolgi                                |
| `'adjust'`      | Regola, per la luminosità e il contrasto |
| `'finish'`      | Pulisci                                  |

### `wheelZoom`

- **Tipo:** `boolean`
- **Valore predefinito:** `true`

Se la rotellina zooma l’immagine. Disattivala quando il visualizzatore sta in una pagina lunga, così la rotellina scorre la pagina. Anche un pizzico su un trackpad smette di zoomare l’immagine, perché il browser lo tratta come la rotellina.

### `download`

- **Tipo:** `boolean`
- **Valore predefinito:** `false`

Se la barra degli strumenti ha un pulsante che salva l’immagine visualizzata: il risultato dell’ultimo Applica, altrimenti l’immagine originale. Il pulsante è nascosto durante la modifica. L’evento [`download`](./events#download) ti permette di salvare il file in un altro modo. Prima del primo Applica, uno `src` da un’altra origine si apre nel browser invece di salvarsi: [Salvare il risultato](../guide/saving#download) spiega cosa fare.

### `labels`

- **Tipo:** [`Partial<PaperPicLabels>`](./types#paperpiclabels)
- **Valore predefinito:** i testi in inglese

Sostituisce qualsiasi testo che il componente mostra o annuncia. [Etichette](./labels) elenca tutte le chiavi.

### `icons`

- **Tipo:** [`Partial<PaperPicIcons>`](./types#paperpicicons)
- **Valore predefinito:** le icone incluse

Sostituisce qualsiasi icona con il tuo markup di un solo elemento, come un `<svg>`. Il markup entra nella pagina come HTML, quindi passa solo markup di cui ti fidi. Una stringa vuota lascia senza icona i pulsanti di quell’icona. [Stili](../guide/styling#icons) mostra un esempio.

Ogni chiave indica un’icona, e alcune icone compaiono su due pulsanti:

| Chiave           | Pulsante                                                                           |
| ---------------- | ---------------------------------------------------------------------------------- |
| `adjust`         | Regola                                                                             |
| `apply`          | Applica, e Fatto in ogni strumento                                                 |
| `brightness`     | Luminosità, nel pannello di Regola                                                 |
| `cancel`         | Annulla, e Annulla questo strumento                                                |
| `contrast`       | Contrasto, nel pannello di Regola                                                  |
| `crop`           | Ritaglia                                                                           |
| `download`       | Scarica                                                                            |
| `edit`           | Modifica                                                                           |
| `finish`         | Pulisci                                                                            |
| `fitHeight`      | Adatta all’altezza                                                                 |
| `fitWidth`       | Adatta alla larghezza                                                              |
| `flip`           | Capovolgi                                                                          |
| `perspective`    | Raddrizza                                                                          |
| `redo`           | Ripeti                                                                             |
| `rotateDocument` | Ruota a sinistra, nella barra di modifica                                          |
| `rotateLeft`     | Ruota a sinistra, nella barra degli strumenti di un visualizzatore di sola lettura |
| `rotateRight`    | Ruota a destra, nella barra degli strumenti di un visualizzatore di sola lettura   |
| `undo`           | Annulla l’ultima azione                                                            |
| `zoomIn`         | Ingrandisci                                                                        |
| `zoomOut`        | Riduci                                                                             |

## Risultato

### `output`

- **Tipo:** [`PaperPicOutput`](./types#paperpicoutput)
- **Valore predefinito:** il formato dell’immagine originale, o PNG

Il formato dell’immagine modificata. `type` è `'image/jpeg'`, `'image/png'` o `'image/webp'`, e `quality` va da 0 a 1 per JPEG e WebP, con `0.92` come valore predefinito.

Senza `type`, un’immagine in bianco e nero esce in PNG, perché il JPEG ne rovinerebbe i bordi netti. Ogni altra immagine mantiene il formato dell’originale quando è JPEG, PNG o WebP, che PaperPic ricava dall’estensione dell’URL o dal tipo del `File` o del `Blob`. Altrimenti il risultato è PNG, come quando il browser non sa codificare il formato.

### `maxOutputSize`

- **Tipo:** `number`
- **Valore predefinito:** la risoluzione piena

Il lato più lungo dell’immagine modificata, in pixel. Un risultato più grande viene ridotto.

### `filename`

- **Tipo:** `string`
- **Valore predefinito:** il nome dell’immagine originale

Il nome del file salvato. Scrivilo senza estensione: PaperPic aggiunge quella del formato, quindi un `receipt.jpg` in bianco e nero si salva come `receipt.png`. Se l’originale non ha un nome, come un `Blob`, il file si chiama `image`. Prima del primo Applica, un URL senza estensione si salva senza estensione, perché il suo formato è sconosciuto.

## Strumenti

### `aspectRatio`

- **Tipo:** `number`
- **Valore predefinito:** stimate

Le proporzioni reali del documento, come larghezza divisa per altezza, ad esempio `210 / 297` per un foglio A4. Raddrizza dà al suo risultato queste proporzioni. Senza di esse, le stima dalla foto. Ritaglia non le usa: il suo rettangolo resta libero.

### `softness`

- **Tipo:** `number`, da 0 a 1
- **Valore predefinito:** `0.25`

Quanto grigio conserva il bianco e nero ai bordi delle lettere, il che le rende più facili da leggere. Usa `0` per un bianco e nero rigoroso, che dà file più piccoli ma spezza i tratti sottili.
