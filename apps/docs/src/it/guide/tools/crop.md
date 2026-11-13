---
title: Ritaglia
description: Come lo strumento Ritaglia di PaperPic tiene la parte della foto che contiene il documento, con maniglie d’angolo, una lente d’ingrandimento sugli schermi touch e la tastiera.
---

# Ritaglia

La foto di un documento mostra spesso il tavolo, una mano o altri fogli intorno. Ritaglia tiene il rettangolo che contiene il documento e scarta il resto.

## Come si usa

1. Premi Modifica, poi Ritaglia. Dentro l’immagine compare un rettangolo, con una maniglia a ogni angolo.
2. Trascina gli angoli finché il rettangolo non inquadra il documento. Il pannello di Ritaglia ha i pulsanti dello zoom, così puoi ingrandire per posizionarli con precisione.
3. Premi Fatto, o `Invio`, per aggiungere il ritaglio ai cambiamenti. Annulla questo strumento, o `Esc`, chiude Ritaglia senza cambiare nulla.

Mentre Ritaglia è aperto, l’immagine appare come sarà il risultato, con Regola e Pulisci compresi. Il ritaglio è un cambiamento come gli altri: Annulla l’ultima azione lo toglie, e Applica lo rende permanente.

## Maniglie d’angolo

- Le maniglie restano dentro l’immagine, e il rettangolo non si capovolge mai.
- Su uno schermo touch, una lente d’ingrandimento mostra la zona sotto il dito mentre trascina un angolo, così il dito non nasconde dove finisce.
- Senza trascinare, premi una maniglia e poi tocca il punto in cui va il suo angolo. Fino ad allora la maniglia resta evidenziata, i pulsanti dello zoom ingrandiscono verso il suo angolo, e `Esc` la rilascia.
- Con la tastiera, Tab passa da una maniglia all’altra, e le frecce spostano quella con il focus di 1 pixel dello schermo, o di 10 con Maiusc. `+` e `-` ingrandiscono e riducono verso la maniglia con il focus. I lettori di schermo annunciano ogni spostamento.

## Ritaglia o Raddrizza?

Ritaglia tiene un rettangolo così com’è. In una foto scattata di sbieco, il documento sembra un trapezio, e nessun rettangolo lo contiene bene. In quei casi usa [Raddrizza](./straighten): sposta ogni angolo per conto suo e rende la pagina piatta.

## Dal codice

Ritaglia è nella barra di modifica per impostazione predefinita, con l’id `'crop'` in [`tools`](../../reference/options#tools). Con `toolbar: false`, aprilo con [`openTool()`](../../reference/methods#opentool) e chiudilo con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('crop')

// Più tardi, da un tuo pulsante
pic.confirmTool()
```
