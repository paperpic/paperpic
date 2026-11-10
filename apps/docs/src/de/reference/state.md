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

| Feld          | Typ                                          | Beschreibung                                                                                      |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `status`      | `'empty' \| 'loading' \| 'ready' \| 'error'` | Ob es ein Bild gibt und ob es geladen wurde                                                       |
| `mode`        | `'view' \| 'edit'`                           | Ob der Nutzer das Bild ansieht oder bearbeitet                                                    |
| `image`       | `{ width, height } \| null`                  | Die Größe des angezeigten Bildes in Pixeln, mit den bisherigen Änderungen, oder `null` ohne Bild  |
| `zoom`        | `number`                                     | Bildschirmpixel pro Bildpixel                                                                     |
| `fit`         | `'image' \| 'width' \| 'height' \| null`     | Die aktive Einpassung, oder `null`, sobald der Nutzer von Hand gezoomt hat                        |
| `rotation`    | `0 \| 90 \| 180 \| 270`                      | Wie weit das angezeigte Bild gedreht ist, in Grad im Uhrzeigersinn                                |
| `canUndo`     | `boolean`                                    | Ob es eine Änderung zum Rückgängigmachen gibt                                                     |
| `canRedo`     | `boolean`                                    | Ob es eine Änderung zum Wiederherstellen gibt                                                     |
| `canApply`    | `boolean`                                    | Ob es Änderungen zum Übernehmen gibt. Drehungen und Spiegelungen, die sich aufheben, zählen nicht |
| `busy`        | `boolean`                                    | Ob Übernehmen gerade läuft                                                                        |
| `activeTool`  | `ToolId \| null`                             | Das offene Werkzeug, `'crop'` oder `'perspective'`, oder `null`                                   |
| `threshold`   | `{ enabled, sensitivity }`                   | Ob Bereinigen eingeschaltet ist, und seine Empfindlichkeit von 0 bis 1                            |
| `adjustments` | `{ brightness, contrast }`                   | Helligkeit und Kontrast, jeweils von -1 bis 1. Bereinigen lässt sie weg                           |
