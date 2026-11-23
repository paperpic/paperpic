---
title: Raddrizza
description: Come lo strumento Raddrizza di PaperPic trasforma la foto di un documento scattata di sbieco in una pagina piatta, come stima le proporzioni e quando usare aspectRatio, con una demo dal vivo.
---

# Raddrizza

Un documento fotografato di sbieco sembra un trapezio: il bordo lontano è più corto e il testo pende. Raddrizza lo riporta a una pagina piatta e rettangolare, come se fosse stata scansionata. Il suo id nell’API è `perspective`.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :tools="['perspective']" />

## Come si usa

1. Premi Modifica, poi Raddrizza. Compare una maniglia per ogni angolo.
2. Trascina ogni maniglia su un angolo del documento. Ingrandisci con i pulsanti del suo pannello per posizionarle con precisione.
3. Se conosci la carta, scegli il suo [formato](#paper-size): A4, Lettera o Tessera. Auto lo stima.
4. Premi Fatto, o `Invio`. Il visualizzatore mostra la pagina piatta, ritagliata sui quattro angoli. Fatto aspetta che sposti un angolo.

Le maniglie funzionano come in [Ritaglia](./crop): una lente d’ingrandimento sugli schermi touch, premere e toccare invece di trascinare, e Tab e le frecce con la tastiera. I quattro angoli formano sempre una figura convessa, così la pagina si può sempre rendere piatta.

Raddrizza mostra la foto senza il bianco e nero di [Pulisci](./clean-up), perché i bordi della carta sono difficili da trovare su una pagina pulita. Il bianco e nero torna dopo Fatto, e il grigio resta.

## Formato carta {#paper-size}

Il pannello di Raddrizza offre formati carta, che danno al risultato le proporzioni esatte di quella carta:

| Scelta  | Proporzioni                                                                                  |
| ------- | -------------------------------------------------------------------------------------------- |
| Auto    | [`aspectRatio`](../../reference/options#aspectratio), o altrimenti una [stima](#proportions) |
| A4      | 210 × 297 mm, le stesse di A3 e A5                                                           |
| Lettera | 8,5 × 11 pollici, Lettera USA                                                                |
| Tessera | 85,6 × 53,98 mm, una carta d’identità o bancaria                                             |

Un formato fissa solo le proporzioni: non sposta gli angoli e non trova il documento. La carta sta in verticale o in orizzontale come gli angoli, quindi non c’è un orientamento da scegliere. Un formato che non è quello del documento lo deforma, quindi Raddrizza comincia da Auto ogni volta che si apre.

Con i quattro angoli sugli angoli dell’immagine, Auto non cambia nulla, e un formato dà a tutta l’immagine le proporzioni di quella carta.

## Proporzioni {#proportions}

Una foto non dice la forma reale della pagina, quindi Raddrizza ne stima le proporzioni da dove stanno gli angoli nella foto. La stima va bene per le foto scattate da una distanza normale, ma non può essere esatta.

La stima usa la foto originale, anche dopo un ritaglio o una rotazione nella stessa modifica. Appena l’utente applica, il risultato conta come la nuova foto, quindi raddrizza prima di applicare.

Se conosci il documento, imposta [`aspectRatio`](../../reference/options#aspectratio) alla sua larghezza divisa per l’altezza, e il risultato prende quelle proporzioni:

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Documento                     | `aspectRatio`  |
| ----------------------------- | -------------- |
| Foglio A4, verticale          | `210 / 297`    |
| Foglio US Letter, verticale   | `8.5 / 11`     |
| Carta d’identità, orizzontale | `85.6 / 53.98` |

Per un foglio in orizzontale, inverti i numeri, come `297 / 210`. Le proporzioni valgono per la pagina come appare sullo schermo, quindi, se la foto è di lato, ruotala con [Ruota a sinistra](./rotate-and-flip) prima di raddrizzarla.

## Angoli tagliati dalla foto

A volte un angolo del documento finisce fuori dalla foto. Le maniglie restano dentro l’immagine, quindi metti quella maniglia sul bordo della foto, lungo il lato del documento che conserva il contenuto. Le ultime righe pendono un po’ e la stima delle proporzioni peggiora, cosa che [`aspectRatio`](../../reference/options#aspectratio) può correggere.

Nel [playground](../../playground) c’è uno scontrino di esempio con un angolo tagliato per provarlo.

## Dal codice

Raddrizza si apre con [`openTool('perspective')`](../../reference/methods#opentool) e si chiude con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')
pic.setPaper({ size: 'a4' })

// Più tardi, da un tuo pulsante
pic.confirmTool()
```

Scegli il formato carta con [`setPaper()`](../../reference/methods#setpaper) mentre lo strumento è aperto. `confirmTool()` aspetta che si sposti un angolo, e il `canConfirm` dello [stato](../../reference/state) dice quando può.
