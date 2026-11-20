---
title: Copri
description: Come lo strumento Copri di PaperPic copre parte di una foto con nero o bianco pieni, come un numero di conto o una firma, così il risultato non la contiene più.
---

# Copri

La foto di un documento può mostrare più del dovuto: un numero di conto, una firma, un volto sullo sfondo. Copri copre un rettangolo, dritto o inclinato, con nero o bianco pieni, e il risultato non contiene più ciò che c’era sotto.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :tools="['redact']" />

## Come si usa

1. Premi Modifica, poi Copri. Al centro dell’immagine compare una fascia, con una maniglia a ogni angolo.
2. Trascina l’area su ciò che vuoi nascondere. Ruotala con la maniglia sopra di essa, perché segua una riga di testo inclinata, e trascina i suoi angoli per ridimensionarla. L’area mostra il suo colore, ancora trasparente, così puoi metterla sulle parole giuste.
3. Scegli Nero o Bianco nel pannello.
4. Premi Fatto, o `Invio`, per aggiungere l’area ai cambiamenti. Annulla questo strumento, o `Esc`, chiude Copri senza cambiare nulla.

Ogni Fatto aggiunge un’area, quindi riapri Copri per coprire un’altra parte. Annulla l’ultima azione toglie l’ultima area, e il colore resta per la successiva. Le maniglie d’angolo funzionano come in [Ritaglia](./crop): trascinale, toccane una e poi il punto di arrivo, o spostale con la tastiera. Sulla maniglia sopra l’area, le frecce la ruotano di 1 grado, o di 10 con Maiusc. Trascinata, si aggancia in orizzontale.

## Cosa garantisce {#guarantees}

- Le aree vengono coperte dopo tutti gli altri cambiamenti, quindi Regola e Pulisci non schiariscono mai il loro nero o bianco.
- Un’area segue i cambiamenti successivi: una rotazione, un capovolgimento o un ritaglio la spostano con l’immagine, e Raddrizza la deforma con la pagina.
- Copre ogni pixel che i suoi bordi toccano, anche in parte, ed è opaca anche in un PNG trasparente.
- Applica scrive pixel pieni nel risultato, quindi il file non conserva nulla di ciò che coprono.

Fino ad Applica, il visualizzatore conserva l’immagine originale, quindi Annulla l’ultima azione riporta ciò che un’area copre. Condividi il risultato di Applica, mai l’immagine originale.

## Dal codice

Copri è nella barra di modifica per impostazione predefinita, con l’id `'redact'` in [`tools`](../../reference/options#tools). Con `toolbar: false`, aprilo con [`openTool()`](../../reference/methods#opentool), scegli il colore con [`setRedaction()`](../../reference/methods#setredaction) e chiudilo con [`confirmTool()`](../../reference/methods#confirmtool) o [`cancelTool()`](../../reference/methods#canceltool):

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Più tardi, da un pulsante tuo
pic.confirmTool()
```

Il `redaction` dello [stato](../../reference/state) contiene il colore in uso.
