---
title: Visualizzatore
description: Come si zooma, si sposta e si adatta l’immagine di un documento in PaperPic, cosa offre la barra degli strumenti e come mostrare un’immagine in sola lettura, con una demo dal vivo.
---

# Visualizzatore

I caratteri piccoli e gli scontrini lunghi sono difficili da leggere a colpo d’occhio su uno schermo. Il visualizzatore adatta l’immagine quando si carica e permette di zoomare su qualsiasi parte.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :editable="false" />

## Zoomare e spostare

| Azione                                        | Mouse e trackpad                  | Touch        | Tastiera  |
| --------------------------------------------- | --------------------------------- | ------------ | --------- |
| Zoomare                                       | Rotellina, o pizzico sul trackpad | Pizzico      | `+` e `-` |
| Spostare                                      | Trascinare                        | Trascinare   | Frecce    |
| Passare dall’adattamento al 100 % e viceversa | Doppio clic                       | Doppio tocco |           |
| Adattare l’immagine intera                    |                                   |              | `0`       |

La tastiera funziona con il focus sul visualizzatore. Un pizzico zooma attorno al punto tra le dita.

Lo zoom va dall’adattamento dell’immagine intera, o dal 100 % per un’immagine piccola, fino all’800 %. Un’immagine che ci sta resta centrata, e una che sborda si sposta fino ai suoi bordi.

Quando si carica, l’immagine si adatta intera al visualizzatore, e mantiene il suo adattamento quando il visualizzatore cambia dimensione, finché l’utente non zooma a mano.

In una pagina lunga, la rotellina zoomerebbe l’immagine invece di scorrere la pagina. Lì usa `wheelZoom: false`: i pulsanti, la tastiera e il pizzico su uno schermo touch continuano a zoomare.

## La barra degli strumenti

La barra degli strumenti sta a destra del visualizzatore, e scorre quando il visualizzatore è troppo basso per i suoi pulsanti.

| Pulsante                                  | Cosa fa                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Modifica                                  | Avvia la [modalità di modifica](./editing). Nascosto con `editable: false` |
| Ingrandisci, Riduci                       | Zoomano di un passo, attorno al centro                                     |
| Adatta alla larghezza, Adatta all’altezza | Adattano la larghezza, comodo per i documenti lunghi, o l’altezza          |
| Ruota a sinistra, Ruota a destra          | Solo in un visualizzatore di sola lettura: ruotano l’immagine visualizzata |
| Scarica                                   | Solo con `download: true`: salva l’immagine visualizzata                   |

Con `toolbar: false`, la barra degli strumenti e la barra di modifica sono nascoste, e puoi creare i tuoi controlli con i [metodi](../reference/methods).

## Visualizzatore di sola lettura

Con `editable: false`, il pulsante Modifica sparisce, e la barra degli strumenti riceve due pulsanti che ruotano l’immagine. Quella rotazione cambia solo la visualizzazione, e non si salva nulla. Usalo per documenti da leggere ma non da modificare, come gli allegati di una pratica.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'Uno scontrino',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Uno scontrino" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Uno scontrino" editable={false} />
```

:::

## Controllare la vista dal codice

I metodi [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) e [`fit()`](../reference/methods#fit) fanno ciò che fanno i pulsanti, e [`getState()`](../reference/methods#getstate) ti dice lo zoom e l’adattamento in vigore:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
