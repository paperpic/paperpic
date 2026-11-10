---
title: Regola
description: Come lo strumento Regola di PaperPic cambia la luminosità e il contrasto dell’immagine di un documento con due cursori dal vivo, e come impostarli dal codice.
---

# Regola

Le foto scattate con poca luce escono scure o grigie. Regola cambia la luminosità e il contrasto e conserva i colori, per i documenti che non devono diventare in bianco e nero, come moduli a colori o foto.

## Come si usa

1. Premi Modifica, poi Regola. Nella barra di modifica compaiono due cursori: Luminosità e Contrasto.
2. Trascina un cursore. L’anteprima cambia mentre trascini, e rilasciare il cursore lascia un cambiamento, che Annulla l’ultima azione toglie.
3. Premi di nuovo Regola per nascondere i cursori.

Il centro di ogni cursore lascia l’immagine com’è, e un cursore riportato al centro non conta come cambiamento. I lettori di schermo annunciano il valore da -100 a 100, come «Luminosità +30».

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

Nell’opzione [`tools`](../../reference/options#tools), Regola è `'adjust'`.
