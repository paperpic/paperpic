---
title: Zustand
description: Was getState() zurückgibt und das Ereignis change liefert, etwa den Status des Bildes, den Modus, den Zoom, die Änderungen und ob es etwas zu übernehmen gibt.
---

# Zustand

Der Zustand beschreibt, was der Viewer in einem Moment zeigt. [`getState()`](./methods#getstate) gibt ihn zurück, und das Ereignis [`change`](./events#change) liefert ihn. Damit hältst du eigene Bedienelemente auf dem neuesten Stand, etwa eine Schaltfläche Übernehmen:

```ts
pic.on('change', ({ canApply, busy }) => {
  applyButton.disabled = !canApply || busy
})
```

| Feld          | Typ                                          | Beschreibung                                                                                                                 |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `activeTool`  | [`ToolId \| null`](./types#toolid)           | Das offene Werkzeug, etwa `'crop'` oder `'adjust'`, oder `null`                                                              |
| `adjustments` | `{ brightness, contrast }`                   | Helligkeit und Kontrast, jeweils von -1 bis 1. Bereinigen lässt sie weg. Solange Anpassen offen ist, die Werte, die es zeigt |
| `busy`        | `boolean`                                    | Ob Übernehmen gerade läuft                                                                                                   |
| `canApply`    | `boolean`                                    | Ob es Änderungen zum Übernehmen gibt. Drehungen und Spiegelungen, die sich aufheben, zählen nicht                            |
| `canRedo`     | `boolean`                                    | Ob es eine Änderung zum Wiederherstellen gibt                                                                                |
| `canUndo`     | `boolean`                                    | Ob es eine Änderung zum Rückgängigmachen gibt                                                                                |
| `fit`         | [`Fit \| null`](./types#fit)                 | Die aktive Einpassung, oder `null`, sobald der Nutzer von Hand gezoomt hat                                                   |
| `image`       | [`Size \| null`](./types#size)               | Die Größe des angezeigten Bildes in Pixeln, mit den bisherigen Änderungen, oder `null` ohne Bild                             |
| `mode`        | `'view' \| 'edit'`                           | Ob der Nutzer das Bild ansieht oder bearbeitet                                                                               |
| `rotation`    | [`Rotation`](./types#rotation)               | Wie weit das angezeigte Bild gedreht ist, in Grad im Uhrzeigersinn                                                           |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Ob es ein Bild gibt und ob es geladen wurde                                                                                  |
| `threshold`   | `{ enabled, sensitivity }`                   | Ob Bereinigen eingeschaltet ist, und seine Empfindlichkeit von 0 bis 1. Solange Bereinigen offen ist, was es zeigt           |
| `zoom`        | `number`                                     | Bildschirmpixel pro Bildpixel                                                                                                |
