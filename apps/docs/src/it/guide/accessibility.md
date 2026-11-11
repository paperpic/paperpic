---
title: Accessibilità
description: Come funziona PaperPic con la tastiera, i lettori di schermo e gli schermi touch, quali preferenze rispetta e cosa deve fornire la tua app.
---

# Accessibilità

Le persone leggono e sistemano documenti con il mouse, con un dito, con la tastiera o con un lettore di schermo. PaperPic punta alle WCAG 2.2 AA, e quasi tutto il lavoro è già incluso. Questa pagina spiega cosa fa e cosa deve aggiungere la tua app.

## Cosa fornisce la tua app

- **Una descrizione.** Passa [`alt`](../reference/options#alt), come «Scontrino del 5 novembre». I lettori di schermo lo leggono come nome dell’immagine.
- **Testi nella lingua dell’utente.** I lettori di schermo annunciano i pulsanti e i cambiamenti, quindi traducili con [`labels`](./labels).
- **I tuoi controlli, se ce ne sono.** Con `toolbar: false`, i pulsanti che crei sostituiscono quelli integrati, e servono loro nomi propri e supporto da tastiera.
- **Un focus visibile.** Evita che il tuo CSS nasconda il contorno del focus del visualizzatore.

## Tastiera

Con il focus sul visualizzatore:

| Tasto                      | Azione                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `+` e `-`                  | Ingrandire e ridurre                                                                        |
| Frecce                     | Spostare                                                                                    |
| `0`                        | Adattare l’immagine intera                                                                  |
| `Ctrl+Z`                   | Annulla l’ultima azione                                                                     |
| `Ctrl+Maiusc+Z` o `Ctrl+Y` | Ripeti                                                                                      |
| `Invio`                    | Conferma lo strumento aperto, altrimenti applica le modifiche                               |
| `Esc`                      | Rilascia un angolo selezionato, chiude lo strumento aperto, altrimenti annulla le modifiche |

Su macOS, `Cmd` funziona come `Ctrl`. Prima di annullare le modifiche, `Esc` chiede conferma. Con `toolbar: false`, le lascia alla tua interfaccia.

- **Barra degli strumenti e barra di modifica.** Tab raggiunge ogni barra, e al suo interno le frecce passano da un pulsante all’altro, con `Home` e `Fine` per il primo e l’ultimo.
- **Maniglie d’angolo.** Con Ritaglia o Raddrizza aperto, Tab passa da una maniglia all’altra, e le frecce spostano quella con il focus di 1 pixel dello schermo, o di 10 con Maiusc.
- **Cursori.** Le frecce spostano i cursori di Regola e di Pulisci.

## Lettori di schermo

- L’immagine ha il ruolo di immagine, con `alt` come nome. Senza `alt`, i lettori di schermo la saltano.
- La barra degli strumenti e la barra di modifica hanno un nome proprio, come «Controlli dell’immagine» e «Controlli di modifica».
- Un annuncio segnala ogni cambiamento che l’utente non vede dal solo focus: il livello di zoom, l’inizio della modalità di modifica, la posizione di un angolo spostato, il valore di un cursore e il risultato di Applica.

## Schermi touch

- Con `pointer: coarse`, i pulsanti e le maniglie d’angolo misurano almeno 44 pixel.
- Mentre un dito trascina un angolo, una lente d’ingrandimento mostra la zona sotto il dito.
- Un angolo si sposta anche senza trascinare: premi la sua maniglia e poi tocca il punto in cui va. Funziona anche con il mouse.
- Finché l’immagine è adattata, un dito scorre la pagina, così il visualizzatore non intrappola nessuno. Con lo zoom, sposta l’immagine.

## Preferenze

- **Movimento ridotto.** Con `prefers-reduced-motion: reduce`, i pulsanti cambiano stato senza transizioni.
- **Colori forzati.** Nel contrasto elevato di Windows e negli altri modi a colori forzati, i pulsanti premuti e le azioni principali mantengono un contorno visibile.
- **Modalità scura.** I colori seguono il `color-scheme` della tua pagina, che può seguire il sistema. Vedi [Stili](./styling#dark-mode).
