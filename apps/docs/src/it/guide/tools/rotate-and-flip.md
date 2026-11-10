---
title: Ruota e capovolgi
description: Come ruotare e capovolgere l’immagine di un documento in PaperPic, nella modalità di modifica, in un visualizzatore di sola lettura e dal codice.
---

# Ruota e capovolgi

I telefoni salvano spesso la foto di un documento di lato o sottosopra, e alcune scansioni escono specchiate. Ruota a sinistra e Capovolgi correggono l’orientamento e lasciano il resto dell’immagine com’è.

## Ruotare

Nella barra di modifica, Ruota a sinistra ruota l’immagine di un quarto di giro in senso antiorario, come nelle gallerie di foto. Premilo due volte per mezzo giro, o tre volte per un quarto di giro in senso orario.

Una rotazione è un cambiamento: Annulla l’ultima azione la toglie, e Applica la rende permanente. Quattro rotazioni riportano l’immagine dov’era, e allora non c’è nulla da applicare.

Dal codice, [`rotate()`](../../reference/methods#rotate) ruota in senso orario con `1`, e in senso antiorario con `-1`:

```ts
pic.rotate(1)
pic.rotate(-1)
```

## Capovolgere

Capovolgi specchia l’immagine da sinistra a destra così come appare, quindi dopo un quarto di giro la specchia ancora da sinistra a destra sullo schermo. Per mettere un’immagine sottosopra, capovolgila e ruotala due volte.

Capovolgimenti e rotazioni che si annullano non lasciano nulla da applicare. Dal codice, chiama [`flip()`](../../reference/methods#flip).

## In un visualizzatore di sola lettura

Con [`editable: false`](../viewer#read-only), la barra degli strumenti ha i pulsanti Ruota a sinistra e Ruota a destra. Ruotano solo l’immagine visualizzata: non si salva nulla, e l’evento `apply` non arriva mai. [`rotate()`](../../reference/methods#rotate) fa lo stesso dal codice. Un visualizzatore di sola lettura non ha Capovolgi.

## Id

Nell’opzione [`tools`](../../reference/options#tools), Ruota a sinistra è `'rotate'` e Capovolgi è `'flip'`.
