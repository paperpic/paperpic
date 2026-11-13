---
title: Regola
description: Come lo strumento Regola di PaperPic cambia la luminosità e il contrasto dell’immagine di un documento con un righello dal vivo, e come impostarli dal codice.
---

# Regola

Le foto scattate con poca luce escono scure o grigie. Regola cambia la luminosità e il contrasto e conserva i colori, per i documenti che non devono diventare in bianco e nero, come moduli a colori o foto.

## Come si usa

1. Premi Modifica, poi Regola. Il suo pannello prende il posto degli strumenti: un righello, con Luminosità e Contrasto per scegliere quale tono cambia.
2. Trascina il righello. L’anteprima cambia mentre trascini. Scegli Contrasto per cambiare l’altro tono con lo stesso righello.
3. Premi Fatto per conservare entrambi i toni come un solo cambiamento, che Annulla l’ultima azione toglie. Annulla questo strumento lascia l’immagine com’era.

Il centro del righello lascia l’immagine com’è, e l’ago vi si aggancia, così tornare a nessun cambiamento è facile. I lettori di schermo annunciano il valore da -100 a 100, come «Luminosità +30». Un punto su Regola segna valori diversi da 0.

Regola viene dopo gli altri cambiamenti, quindi Ritaglia e Raddrizza mostrano l’immagine con esso.

## Regola o Pulisci?

| Regola                                      | [Pulisci](./clean-up)                   |
| ------------------------------------------- | --------------------------------------- |
| Conserva i colori e i grigi                 | Trasforma il documento in bianco e nero |
| Per moduli a colori, timbri e foto          | Per testo su carta                      |
| Mantiene il formato dell’immagine originale | Dà PNG                                  |

Mentre Pulisci è attivo, Regola è disattivato, perché un documento pulito ha toni suoi.

## Dal codice

[`setAdjustments()`](../../reference/methods#setadjustments) accetta valori da -1 a 1, dove 0 non cambia nulla, e [`getState()`](../../reference/methods#getstate) li restituisce in `adjustments`:

```ts
pic.edit()
pic.setAdjustments({ brightness: 0.2, contrast: 0.3 })
```

Mentre Regola è aperto, `setAdjustments()` cambia ciò che mostra il suo pannello, e [`confirmTool()`](../../reference/methods#confirmtool) lo conserva come un solo cambiamento.

Nell’opzione [`tools`](../../reference/options#tools), Regola è `'adjust'`.
