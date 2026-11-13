---
title: Stato
description: Cosa restituisce getState() e porta l’evento change, come lo stato dell’immagine, la modalità, lo zoom, i cambiamenti e se c’è qualcosa da applicare.
---

# Stato

Lo stato descrive cosa mostra il visualizzatore in un dato momento. [`getState()`](./methods#getstate) lo restituisce, e l’evento [`change`](./events#change) lo porta. Usalo per tenere aggiornati i tuoi controlli, come un pulsante Applica:

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Campo         | Tipo                                         | Descrizione                                                                                                       |
| ------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | Lo strumento aperto, come `'crop'` o `'adjust'`, o `null`                                                         |
| `adjustments` | `{ brightness, contrast }`                   | La luminosità e il contrasto, ciascuno da -1 a 1. Pulisci li esclude. Mentre Regola è aperto, i valori che mostra |
| `busy`        | `boolean`                                    | Se Applica è in corso                                                                                             |
| `canApply`    | `boolean`                                    | Se ci sono cambiamenti da applicare. Rotazioni e capovolgimenti che si annullano non contano                      |
| `canRedo`     | `boolean`                                    | Se c’è un cambiamento da ripristinare                                                                             |
| `canUndo`     | `boolean`                                    | Se c’è un cambiamento da annullare                                                                                |
| `fit`         | [`Fit \| null`](./types#fit)                 | L’adattamento in vigore, o `null` appena l’utente zooma a mano                                                    |
| `image`       | [`Size \| null`](./types#size)               | La dimensione dell’immagine visualizzata in pixel, con i cambiamenti fatti, o `null` senza immagine               |
| `mode`        | `'view' \| 'edit'`                           | Se l’utente sta guardando o modificando l’immagine                                                                |
| `rotation`    | [`Rotation`](./types#rotation)               | Quanto è ruotata l’immagine visualizzata, in gradi in senso orario                                                |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Se c’è un’immagine, e se si è caricata                                                                            |
| `threshold`   | `{ enabled, sensitivity }`                   | Se Pulisci è attivo, e la sua sensibilità da 0 a 1. Mentre Pulisci è aperto, ciò che mostra                       |
| `zoom`        | `number`                                     | Pixel dello schermo per pixel dell’immagine                                                                       |
