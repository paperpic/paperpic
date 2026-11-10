---
title: Raddrizza
description: Come lo strumento Raddrizza di PaperPic trasforma la foto di un documento scattata di sbieco in una pagina piatta, come stima le proporzioni e quando usare aspectRatio, con una demo dal vivo.
---

# Raddrizza

Un documento fotografato di sbieco sembra un trapezio: il bordo lontano è più corto e il testo pende. Raddrizza lo riporta a una pagina piatta e rettangolare, come se fosse stata scansionata. Il suo id nell’API è `perspective`.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :tools="['perspective']" />

## Come si usa

1. Premi Modifica, poi Raddrizza. Compare una maniglia per ogni angolo.
2. Trascina ogni maniglia su un angolo del documento. Ingrandisci per posizionarle con precisione.
3. Premi Fatto, o `Invio`. Il visualizzatore mostra la pagina piatta, ritagliata sui quattro angoli.

Le maniglie funzionano come in [Ritaglia](./crop): una lente d’ingrandimento sugli schermi touch, e Tab e le frecce con la tastiera. I quattro angoli formano sempre una figura convessa, così la pagina si può sempre rendere piatta.

## Proporzioni

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

Per un foglio in orizzontale, inverti i numeri, come `297 / 210`.

## Angoli tagliati dalla foto

A volte un angolo del documento finisce fuori dalla foto. Le maniglie restano dentro l’immagine, quindi metti quella maniglia sul bordo della foto, lungo il lato del documento che conserva il contenuto. Le ultime righe pendono un po’ e la stima delle proporzioni peggiora, cosa che [`aspectRatio`](../../reference/options#aspectratio) può correggere.

Nel [playground](../../playground) c’è uno scontrino di esempio con un angolo tagliato per provarlo.

## Dal codice

Raddrizza si apre con [`openTool('perspective')`](../../reference/methods#opentool) e si chiude con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('perspective')

// Più tardi, da un tuo pulsante
pic.confirmTool()
```
