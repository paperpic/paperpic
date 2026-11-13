---
title: Pulisci
description: Come lo strumento Pulisci di PaperPic trasforma la foto di un documento in un bianco e nero nitido senza ombre, e come sensibilità e morbidezza cambiano il risultato, con una demo dal vivo.
---

# Pulisci

Il testo su carta si legge meglio in bianco e nero, ma una foto ha ombre, luce non uniforme e carta grigia. Pulisci confronta ogni pixel con ciò che lo circonda per decidere se è inchiostro o carta, così le ombre e la luce non uniforme spariscono e il testo resta nitido. Il suo id nell’API è `threshold`.

<Demo src="/samples/receipt.jpg" alt="Uno scontrino" :tools="['perspective', 'threshold']" />

Raddrizza prima lo scontrino, poi puliscilo.

## Come si usa

1. Premi Modifica, poi Pulisci. Il suo pannello prende il posto degli strumenti, l’anteprima diventa in bianco e nero, e compare un righello Sensibilità.
2. Trascina il righello. Una sensibilità più alta scurisce più pixel, il che recupera il testo tenue o consumato. Una sensibilità più bassa dà una pagina più pulita, senza ciò che traspare dal retro.
3. Premi Fatto per conservarlo come un solo cambiamento, o Annulla questo strumento per lasciare l’immagine com’era.

Per disattivare un Pulisci che è già un cambiamento, riaprilo: un interruttore accanto al righello lo disattiva, e i cambiamenti venuti dopo restano. Annulla l’ultima azione toglierebbe prima quei cambiamenti.

Pulisci viene sempre dopo gli altri cambiamenti. Ritaglia mostra l’immagine pulita, come sarà. Raddrizza la mostra senza Pulisci, perché su una pagina pulita è difficile trovare i bordi della carta.

## Morbidezza

[`softness`](../../reference/options#softness) stabilisce quanto grigio conserva Pulisci ai bordi delle lettere, da 0 a 1, con 0.25 come valore predefinito. Un po’ di grigio ammorbidisce i bordi e rende più leggibile il testo piccolo. Usa `0` per un bianco e nero rigoroso, che dà file più piccoli ma spezza i tratti sottili.

## Formato del risultato

Un’immagine pulita esce in PNG, perché il JPEG aggiungerebbe artefatti intorno ai suoi bordi netti. L’opzione [`output`](../../reference/options#output) può scegliere un altro formato.

## Dal codice

[`setThreshold()`](../../reference/methods#setthreshold) attiva o disattiva Pulisci e ne imposta la sensibilità, da 0 a 1, con 0.5 come valore predefinito. [`getState()`](../../reference/methods#getstate) restituisce entrambi in `threshold`:

```ts
pic.edit()
pic.setThreshold({ enabled: true, sensitivity: 0.6 })
```

Mentre Pulisci è aperto, `setThreshold()` cambia ciò che mostra il suo pannello, e [`confirmTool()`](../../reference/methods#confirmtool) lo conserva come un solo cambiamento.
