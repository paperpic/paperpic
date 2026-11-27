---
title: Pulisci
description: Come lo strumento Pulisci di PaperPic porta la foto di un documento in grigio, o in un bianco e nero nitido senza ombre, e come sensibilità e morbidezza cambiano il risultato, con una demo dal vivo.
---

# Pulisci

Pulisci sceglie la finitura dell’immagine: i toni originali, il grigio, o il bianco e nero. Il suo id nell’API è `finish`.

Il testo su carta si legge meglio in bianco e nero, ma una foto ha ombre, luce non uniforme e carta grigia. Il bianco e nero confronta ogni pixel con ciò che lo circonda per decidere se è inchiostro o carta, così ombre e luce non uniforme spariscono e il testo resta nitido. Il grigio conserva ogni tono e toglie solo il colore, per i documenti con foto o timbri che il bianco e nero perderebbe.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :tools="['perspective', 'finish']" />

Raddrizza prima lo scontrino, poi puliscilo.

## Come si usa

1. Premi Modifica, poi Pulisci. Il suo pannello prende il posto degli strumenti, con tre finiture: Originale, Grigio e Bianco e nero. Si apre in bianco e nero, quindi l’anteprima diventa in bianco e nero e il righello Sensibilità funziona.
2. Trascina il righello. Una sensibilità più alta scurisce più pixel, il che recupera un testo tenue o consumato. Una sensibilità più bassa dà una pagina più pulita, senza la stampa che traspare dal retro.
3. Scegli invece Grigio per un’immagine in grigio, o Originale per i toni della foto. Il righello funziona solo in bianco e nero.
4. Premi Fatto per conservarlo come un solo cambiamento, o Annulla questo strumento per lasciare l’immagine com’era.

Se Pulisci è già tra i cambiamenti, si riapre con la sua finitura. Per disattivarlo, scegli Originale: i cambiamenti venuti dopo restano. Con Annulla l’ultima azione, invece, toglieresti anche quei cambiamenti.

Pulisci viene sempre dopo gli altri cambiamenti. Ritaglia mostra l’immagine con la sua finitura, come sarà. Raddrizza la mostra senza il bianco e nero, perché i bordi della carta sono difficili da trovare su una pagina pulita, e conserva il grigio.

[Regola](./adjust) funziona con il grigio, che viene dopo, ed è disattivato in bianco e nero, che ha toni propri.

## Morbidezza

[`softness`](../../reference/options#softness) imposta quanto grigio il bianco e nero conserva ai bordi delle lettere, da 0 a 1, con 0.25 come valore predefinito. Un po’ di grigio ammorbidisce i bordi e rende il testo piccolo più leggibile. Usa `0` per un bianco e nero rigoroso, che dà file più piccoli ma spezza i tratti sottili.

## Formato del risultato

Un’immagine in bianco e nero è PNG, perché il JPEG aggiungerebbe artefatti attorno ai suoi bordi netti. Un’immagine in grigio conserva il formato della sorgente. L’opzione [`output`](../../reference/options#output) può scegliere un altro formato.

## Dal codice

[`setFinish()`](../../reference/methods#setfinish) sceglie la finitura, `'original'`, `'gray'` o `'mono'` per il bianco e nero, e imposta la sensibilità del bianco e nero, da 0 a 1, con 0.5 come valore predefinito. [`getState()`](../../reference/methods#getstate) restituisce entrambi in `finish`:

```ts
pic.edit()
pic.setFinish({ mode: 'mono', sensitivity: 0.6 })
```

Mentre Pulisci è aperto, `setFinish()` cambia ciò che mostra il suo pannello, e [`confirmTool()`](../../reference/methods#confirmtool) lo conserva come un solo cambiamento.
