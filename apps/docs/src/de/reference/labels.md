---
title: Beschriftungen
description: Alle Texte der Oberfläche von PaperPic, mit Schlüssel und englischem Standardtext, um die Komponente zu übersetzen oder ihre Wortwahl zu ändern.
---

# Beschriftungen

Beschriftungen sind die Texte, die die Komponente anzeigt, und die, die sie Screenreadern ansagt. Standardmäßig sind sie englisch. Übergib die, die du ändern willst, an die Option [`labels`](./options#labels), und die übrigen behalten ihren englischen Text.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: 'Übernehmen',
    cancel: 'Abbrechen',
    zoomLevel: percent => `Zoom ${percent} %`,
  },
})
```

Fünf Beschriftungen sind Funktionen, weil ihr Text einen Wert enthält. Erstelle das Objekt einmal und nicht bei jedem Rendern, damit der Viewer es nicht jedes Mal neu bekommt.

| Schlüssel              | Englisch                                     | Verwendung                                                                                                             |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `adjust`               | Adjust                                       | Die Schaltfläche, die die Regler für Helligkeit und Kontrast zeigt                                                     |
| `adjustmentLevel`      | Brightness +30                               | Funktion von Name und Wert von -100 bis 100, angesagt nach dem Bewegen eines Reglers von Anpassen                      |
| `applied`              | Changes applied                              | Angesagt, wenn die Änderungen übernommen sind                                                                          |
| `apply`                | Apply                                        | Die Schaltfläche, die die Änderungen übernimmt                                                                         |
| `applyError`           | The changes could not be applied             | Angezeigt, wenn Übernehmen fehlschlägt                                                                                 |
| `brightness`           | Brightness                                   | Der Name des Helligkeitsreglers                                                                                        |
| `cancel`               | Cancel                                       | Die Schaltfläche, die den Bearbeitungsmodus verlässt                                                                   |
| `cancelTool`           | Cancel this tool                             | Die Schaltfläche, die ein Werkzeug schließt und seine Auswahl verwirft                                                 |
| `confirm`              | Done                                         | Die Schaltfläche, die ein Werkzeug schließt und seine Auswahl behält                                                   |
| `contrast`             | Contrast                                     | Der Name des Kontrastreglers                                                                                           |
| `cornerBottomLeft`     | Bottom left corner                           | Der Name eines Eckgriffs                                                                                               |
| `cornerBottomRight`    | Bottom right corner                          | Der Name eines Eckgriffs                                                                                               |
| `cornerMoved`          | Top left corner: 120, 80                     | Funktion der Ecke und ihrer Position in Bildpixeln, angesagt nach dem Verschieben einer Ecke                           |
| `cornerSelected`       | Top left corner: tap where it goes           | Funktion der Ecke, angezeigt und angesagt nach dem Drücken eines Eckgriffs, bis ein Tippen auf das Bild ihn verschiebt |
| `cornerTopLeft`        | Top left corner                              | Der Name eines Eckgriffs                                                                                               |
| `cornerTopRight`       | Top right corner                             | Der Name eines Eckgriffs                                                                                               |
| `crop`                 | Crop                                         | Die Schaltfläche Zuschneiden                                                                                           |
| `cropHint`             | Drag the corners                             | Was in Zuschneiden zu tun ist                                                                                          |
| `discard`              | Discard                                      | Die Schaltfläche, die das Verwerfen der Änderungen bestätigt                                                           |
| `discardQuestion`      | Discard your changes?                        | Die Frage, bevor Änderungen verloren gehen                                                                             |
| `download`             | Download                                     | Die Download-Schaltfläche                                                                                              |
| `edit`                 | Edit                                         | Die Schaltfläche, die die Bearbeitung startet                                                                          |
| `editBar`              | Editing controls                             | Der Name der Bearbeitungsleiste, für Screenreader                                                                      |
| `editing`              | Editing                                      | Angesagt, wenn der Bearbeitungsmodus beginnt                                                                           |
| `fitHeight`            | Fit to height                                | Die Schaltfläche, die die Höhe des Bildes einpasst                                                                     |
| `fitWidth`             | Fit to width                                 | Die Schaltfläche, die die Breite des Bildes einpasst                                                                   |
| `flip`                 | Flip                                         | Die Schaltfläche Spiegeln                                                                                              |
| `keepEditing`          | Keep editing                                 | Die Schaltfläche, die zur Bearbeitung zurückkehrt, statt die Änderungen zu verlieren                                   |
| `loadError`            | The image could not be loaded                | Angezeigt, wenn das Bild nicht geladen werden kann                                                                     |
| `loading`              | Loading image                                | Angezeigt, während das Bild lädt                                                                                       |
| `perspective`          | Straighten                                   | Die Schaltfläche Begradigen                                                                                            |
| `perspectiveHint`      | Drag each corner to a corner of the document | Was in Begradigen zu tun ist                                                                                           |
| `processing`           | Applying changes                             | Angezeigt, während Übernehmen läuft                                                                                    |
| `redo`                 | Redo                                         | Die Schaltfläche Wiederholen                                                                                           |
| `rotateLeft`           | Rotate left                                  | Die Drehen-Schaltfläche der Bearbeitungsleiste und eine der beiden eines schreibgeschützten Viewers                    |
| `rotateRight`          | Rotate right                                 | Die andere Drehen-Schaltfläche eines schreibgeschützten Viewers                                                        |
| `threshold`            | Clean up                                     | Die Schaltfläche Bereinigen                                                                                            |
| `thresholdLevel`       | Sensitivity 50%                              | Funktion des Prozentwerts, angesagt nach dem Bewegen des Empfindlichkeitsreglers                                       |
| `thresholdSensitivity` | Sensitivity                                  | Der Name des Empfindlichkeitsreglers                                                                                   |
| `toolbar`              | Image controls                               | Der Name der Werkzeugleiste, für Screenreader                                                                          |
| `undo`                 | Undo                                         | Die Schaltfläche Rückgängig                                                                                            |
| `viewer`               | Image viewer                                 | Der Name des Bereichs, der das Bild zeigt, für Screenreader                                                            |
| `zoomIn`               | Zoom in                                      | Die Schaltfläche Vergrößern                                                                                            |
| `zoomLevel`            | Zoom 150%                                    | Funktion des Prozentwerts, angesagt nach einem Zoom über die Werkzeugleiste oder die Tastatur                          |
| `zoomOut`              | Zoom out                                     | Die Schaltfläche Verkleinern                                                                                           |
