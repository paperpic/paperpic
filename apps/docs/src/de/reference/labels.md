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

Fünf Beschriftungen sind Funktionen, weil ihr Text einen Wert enthält. Eine Funktion ist bei jedem Erstellen neu, und der Viewer nimmt eine neue als Änderung, also erstelle die Beschriftungen mit Funktionen einmal und nicht bei jedem Rendern.

| Schlüssel           | Englisch                                                         | Verwendung                                                                                                             |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | Die Schaltfläche, die die Skala für Helligkeit und Kontrast öffnet                                                     |
| `adjustmentLevel`   | Brightness +30                                                   | Funktion von Name und Wert von -100 bis 100, angesagt nach dem Bewegen der Skala von Anpassen                          |
| `adjustUnavailable` | Not available in black and white                                 | Die Beschreibung von Anpassen in Schwarzweiß, was es deaktiviert                                                       |
| `applied`           | Changes applied                                                  | Angesagt, wenn die Änderungen übernommen sind                                                                          |
| `apply`             | Apply                                                            | Die Schaltfläche, die die Änderungen übernimmt                                                                         |
| `applyError`        | The changes could not be applied                                 | Angezeigt, wenn das Übernehmen fehlschlägt                                                                             |
| `brightness`        | Brightness                                                       | Die Wahl der Helligkeit in Anpassen, und der Name ihrer Skala                                                          |
| `cancel`            | Cancel                                                           | Die Schaltfläche, die den Bearbeitungsmodus verlässt                                                                   |
| `cancelTool`        | Cancel this tool                                                 | Die Schaltfläche, die ein Werkzeug schließt und seine Änderungen verwirft                                              |
| `confirm`           | Done                                                             | Die Schaltfläche, die ein Werkzeug schließt und seine Änderungen behält                                                |
| `contrast`          | Contrast                                                         | Die Wahl des Kontrasts in Anpassen, und der Name seiner Skala                                                          |
| `cornerBottomLeft`  | Bottom left corner                                               | Der Name eines Eckgriffs                                                                                               |
| `cornerBottomRight` | Bottom right corner                                              | Der Name eines Eckgriffs                                                                                               |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | Die Beschreibung eines Eckgriffs: was die Tasten tun und dass die Eingabetaste abschließt                              |
| `cornerMoved`       | Top left corner: 120, 80                                         | Funktion der Ecke und ihrer Position in Bildpixeln, angesagt nach dem Verschieben einer Ecke                           |
| `cornerSelected`    | Top left corner: tap where it goes                               | Funktion der Ecke, angezeigt und angesagt nach dem Drücken eines Eckgriffs, bis ein Tippen auf das Bild ihn verschiebt |
| `cornerTopLeft`     | Top left corner                                                  | Der Name eines Eckgriffs                                                                                               |
| `cornerTopRight`    | Top right corner                                                 | Der Name eines Eckgriffs                                                                                               |
| `crop`              | Crop                                                             | Die Schaltfläche Zuschneiden                                                                                           |
| `cropHint`          | Drag the corners                                                 | Was in Zuschneiden zu tun ist                                                                                          |
| `discard`           | Discard                                                          | Die Schaltfläche, die das Verwerfen der Änderungen bestätigt                                                           |
| `discardQuestion`   | Discard your changes?                                            | Die Frage, bevor Änderungen verloren gehen                                                                             |
| `download`          | Download                                                         | Die Download-Schaltfläche                                                                                              |
| `edit`              | Edit                                                             | Die Schaltfläche, die die Bearbeitung startet                                                                          |
| `editBar`           | Editing controls                                                 | Der Name der Bearbeitungsleiste, für Screenreader                                                                      |
| `editing`           | Editing                                                          | Angesagt, wenn der Bearbeitungsmodus beginnt                                                                           |
| `finish`            | Clean up                                                         | Die Schaltfläche Bereinigen, und der Name seiner Auswahl des Finishs                                                   |
| `finishGray`        | Gray                                                             | Wählt Graustufen in Bereinigen                                                                                         |
| `finishLevel`       | Sensitivity 50%                                                  | Funktion des Prozentwerts, angesagt nach dem Bewegen der Skala von Bereinigen                                          |
| `finishMono`        | Black and white                                                  | Wählt Schwarzweiß in Bereinigen                                                                                        |
| `finishOriginal`    | Original                                                         | Wählt die ursprünglichen Töne in Bereinigen, was es ausschaltet                                                        |
| `finishSensitivity` | Sensitivity                                                      | Der Name der Skala von Bereinigen                                                                                      |
| `fitHeight`         | Fit to height                                                    | Die Schaltfläche, die die Höhe des Bildes einpasst                                                                     |
| `fitWidth`          | Fit to width                                                     | Die Schaltfläche, die die Breite des Bildes einpasst                                                                   |
| `flip`              | Flip                                                             | Die Schaltfläche Spiegeln                                                                                              |
| `inUse`             | In use                                                           | Die Beschreibung von Anpassen oder Bereinigen, solange ihre Einstellung gilt, was ein Punkt zeigt                      |
| `keepEditing`       | Keep editing                                                     | Die Schaltfläche, die zur Bearbeitung zurückkehrt, statt die Änderungen zu verlieren                                   |
| `loadError`         | The image could not be loaded                                    | Angezeigt, wenn das Bild nicht geladen werden kann                                                                     |
| `loading`           | Loading image                                                    | Angezeigt, während das Bild lädt                                                                                       |
| `paper`             | Paper size                                                       | Der Name der Auswahl des Papierformats, in Begradigen                                                                  |
| `paperA4`           | A4                                                               | Wählt A4 in Begradigen                                                                                                 |
| `paperAuto`         | Auto                                                             | Wählt das automatische Seitenverhältnis in Begradigen                                                                  |
| `paperCard`         | Card                                                             | Wählt das Format einer Ausweis- oder Bankkarte in Begradigen                                                           |
| `paperLetter`       | Letter                                                           | Wählt US-Letter in Begradigen                                                                                          |
| `perspective`       | Straighten                                                       | Die Schaltfläche Begradigen                                                                                            |
| `perspectiveFound`  | Document found. Check its corners                                | Erscheint und wird angesagt, wenn Begradigen das Dokument findet                                                       |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | Was in Begradigen zu tun ist                                                                                           |
| `previewError`      | The changes could not be shown                                   | Angezeigt, wenn eine Änderung nicht angezeigt werden kann                                                              |
| `processing`        | Applying changes                                                 | Angezeigt, während die Änderungen übernommen werden                                                                    |
| `redact`            | Redact                                                           | Die Schaltfläche Abdecken, und der Name seiner Auswahl der Farbe                                                       |
| `redactAngle`       | Angle 12°                                                        | Funktion des Winkels in Grad, angesagt nach dem Drehen des Bereichs von Abdecken                                       |
| `redactArea`        | Area                                                             | Der Bereich von Abdecken, der ihn als Ganzes verschiebt                                                                |
| `redactBlack`       | Black                                                            | Wählt Schwarz in Abdecken                                                                                              |
| `redactHint`        | Draw an area over what to hide                                   | Was in Abdecken zu tun ist                                                                                             |
| `redactTurn`        | Turn                                                             | Der Griff, der den Bereich von Abdecken dreht                                                                          |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | Die Beschreibung des Griffs, der den Bereich dreht: was die Tasten tun, und dass die Eingabetaste abschließt           |
| `redactWhite`       | White                                                            | Wählt Weiß in Abdecken                                                                                                 |
| `redo`              | Redo                                                             | Die Schaltfläche Wiederholen                                                                                           |
| `rotateLeft`        | Rotate left                                                      | Die Drehen-Schaltfläche der Bearbeitungsleiste und eine der beiden eines schreibgeschützten Viewers                    |
| `rotateRight`       | Rotate right                                                     | Die andere Drehen-Schaltfläche eines schreibgeschützten Viewers                                                        |
| `toolbar`           | Image controls                                                   | Der Name der Werkzeugleiste, für Screenreader                                                                          |
| `undo`              | Undo                                                             | Die Schaltfläche Rückgängig                                                                                            |
| `viewer`            | Image viewer                                                     | Der Name des Bereichs, der das Bild zeigt, für Screenreader                                                            |
| `zoomIn`            | Zoom in                                                          | Die Schaltfläche Vergrößern, in der Werkzeugleiste und in den Bedienfeldern von Zuschneiden und Begradigen             |
| `zoomLevel`         | Zoom 150%                                                        | Funktion des Prozentwerts, angesagt nach einem Zoom über die Werkzeugleiste oder die Tastatur                          |
| `zoomOut`           | Zoom out                                                         | Die Schaltfläche Verkleinern, in der Werkzeugleiste und in den Bedienfeldern von Zuschneiden und Begradigen            |
