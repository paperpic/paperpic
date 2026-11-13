---
title: Etichette
description: Tutti i testi dell’interfaccia di PaperPic, con la loro chiave e il valore inglese predefinito, per tradurre il componente o cambiarne le parole.
---

# Etichette

Le etichette sono i testi che il componente mostra e quelli che annuncia ai lettori di schermo. Per impostazione predefinita sono in inglese. Passa quelle che vuoi cambiare all’opzione [`labels`](./options#labels), e le altre mantengono il testo inglese.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: 'Applica',
    cancel: 'Annulla',
    zoomLevel: percent => `Zoom ${percent}%`,
  },
})
```

Cinque etichette sono funzioni, perché il loro testo include un valore. Crea l’oggetto una volta sola, e non a ogni render, così il visualizzatore non lo riceve di nuovo ogni volta.

| Chiave                 | Inglese                                      | Uso                                                                                                                              |
| ---------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | Il pulsante che apre il righello di luminosità e contrasto                                                                       |
| `adjustmentLevel`      | Brightness +30                               | Funzione del nome e del valore da -100 a 100, annunciata dopo aver spostato il righello di Regola                                |
| `applied`              | Changes applied                              | Annunciata quando i cambiamenti sono applicati                                                                                   |
| `apply`                | Apply                                        | Il pulsante che applica i cambiamenti                                                                                            |
| `applyError`           | The changes could not be applied             | Mostrata quando Applica fallisce                                                                                                 |
| `brightness`           | Brightness                                   | La scelta della luminosità in Regola, e il nome del suo righello                                                                 |
| `cancel`               | Cancel                                       | Il pulsante che esce dalla modalità di modifica                                                                                  |
| `cancelTool`           | Cancel this tool                             | Il pulsante che chiude uno strumento e scarta i suoi cambiamenti                                                                 |
| `confirm`              | Done                                         | Il pulsante che chiude uno strumento e conserva i suoi cambiamenti                                                               |
| `contrast`             | Contrast                                     | La scelta del contrasto in Regola, e il nome del suo righello                                                                    |
| `cornerBottomLeft`     | Bottom left corner                           | Il nome di una maniglia d’angolo                                                                                                 |
| `cornerBottomRight`    | Bottom right corner                          | Il nome di una maniglia d’angolo                                                                                                 |
| `cornerMoved`          | Top left corner: 120, 80                     | Funzione dell’angolo e della sua posizione in pixel dell’immagine, annunciata dopo averlo spostato                               |
| `cornerSelected`       | Top left corner: tap where it goes           | Funzione dell’angolo, mostrata e annunciata dopo aver premuto una maniglia d’angolo, finché un tocco sull’immagine non la sposta |
| `cornerTopLeft`        | Top left corner                              | Il nome di una maniglia d’angolo                                                                                                 |
| `cornerTopRight`       | Top right corner                             | Il nome di una maniglia d’angolo                                                                                                 |
| `crop`                 | Crop                                         | Il pulsante Ritaglia                                                                                                             |
| `cropHint`             | Drag the corners                             | Cosa fare in Ritaglia                                                                                                            |
| `discard`              | Discard                                      | Il pulsante che conferma di perdere i cambiamenti                                                                                |
| `discardQuestion`      | Discard your changes?                        | La domanda prima di perdere i cambiamenti                                                                                        |
| `download`             | Download                                     | Il pulsante di download                                                                                                          |
| `edit`                 | Edit                                         | Il pulsante che avvia la modifica                                                                                                |
| `editBar`              | Editing controls                             | Il nome della barra di modifica, per i lettori di schermo                                                                        |
| `editing`              | Editing                                      | Annunciata quando inizia la modalità di modifica                                                                                 |
| `fitHeight`            | Fit to height                                | Il pulsante che adatta l’altezza dell’immagine                                                                                   |
| `fitWidth`             | Fit to width                                 | Il pulsante che adatta la larghezza dell’immagine                                                                                |
| `flip`                 | Flip                                         | Il pulsante Capovolgi                                                                                                            |
| `inUse`                | In use                                       | La descrizione di Regola, di Pulisci o di una scelta di Regola mentre la sua impostazione è in uso, che un punto mostra          |
| `keepEditing`          | Keep editing                                 | Il pulsante che torna alla modifica invece di perdere i cambiamenti                                                              |
| `loadError`            | The image could not be loaded                | Mostrata quando l’immagine non si carica                                                                                         |
| `loading`              | Loading image                                | Mostrata mentre l’immagine si carica                                                                                             |
| `perspective`          | Straighten                                   | Il pulsante Raddrizza                                                                                                            |
| `perspectiveHint`      | Drag each corner to a corner of the document | Cosa fare in Raddrizza                                                                                                           |
| `processing`           | Applying changes                             | Mostrata mentre Applica è in corso                                                                                               |
| `redo`                 | Redo                                         | Il pulsante Ripeti                                                                                                               |
| `rotateLeft`           | Rotate left                                  | Il pulsante di rotazione della barra di modifica, e uno dei due di un visualizzatore di sola lettura                             |
| `rotateRight`          | Rotate right                                 | L’altro pulsante di rotazione di un visualizzatore di sola lettura                                                               |
| `threshold`            | Clean up                                     | Il pulsante Pulisci, e l’interruttore che lo attiva e lo disattiva                                                               |
| `thresholdLevel`       | Sensitivity 50%                              | Funzione della percentuale, annunciata dopo aver spostato il righello di Pulisci                                                 |
| `thresholdSensitivity` | Sensitivity                                  | Il nome del righello di Pulisci                                                                                                  |
| `toolbar`              | Image controls                               | Il nome della barra degli strumenti, per i lettori di schermo                                                                    |
| `undo`                 | Undo                                         | Il pulsante Annulla l’ultima azione                                                                                              |
| `viewer`               | Image viewer                                 | Il nome dell’area che mostra l’immagine, per i lettori di schermo                                                                |
| `zoomIn`               | Zoom in                                      | Il pulsante Ingrandisci, nella barra degli strumenti e nei pannelli di Ritaglia e Raddrizza                                      |
| `zoomLevel`            | Zoom 150%                                    | Funzione della percentuale, annunciata dopo uno zoom dalla barra degli strumenti o dalla tastiera                                |
| `zoomOut`              | Zoom out                                     | Il pulsante Riduci, nella barra degli strumenti e nei pannelli di Ritaglia e Raddrizza                                           |
