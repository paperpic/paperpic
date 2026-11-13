---
title: Optionen
description: Alle Optionen von PaperPic mit Typ, Standardwert und Wirkung, für den Konstruktor, setOptions() und die Props der Vue- und React-Komponenten.
---

# Optionen

Optionen legen fest, was der Viewer zeigt und was der Nutzer damit tun kann. Übergib sie beim Erstellen des Viewers, oder ändere sie später mit [`setOptions()`](./methods#setoptions). Die Vue- und React-Komponenten nehmen sie als Props mit denselben Namen.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Ein Kassenbon' })

pic.setOptions({ editable: false })
```

`setOptions()` ändert nur die Optionen, die du übergibst, und `undefined` setzt eine Option auf ihren Standardwert zurück. Es löst nie `change` aus.

## Bild

### `src`

- **Typ:** [`PaperPicSource`](./types#paperpicsource)
- **Standard:** keiner

Das anzuzeigende Bild: eine URL vom selben Ursprung, oder ein `File` oder `Blob`, das im Client angehängt wurde.

Derselbe Wert ein zweites Mal lädt das Bild nicht neu, das Ergebnis einer Bearbeitung bleibt also sichtbar. Rufe [`reload()`](./methods#reload) auf, um das Original zurückzuholen. Ein neuer Wert während der Bearbeitung verwirft die Änderungen.

### `alt`

- **Typ:** `string`
- **Standard:** `''`

Beschreibt das Bild für Screenreader. Ohne `alt` überspringen Screenreader das Bild, wie bei einem `<img>` mit leerem `alt`.

## Oberfläche

### `editable`

- **Typ:** `boolean`
- **Standard:** `true`

Ob der Nutzer das Bild bearbeiten kann. Mit `false` ist es ein schreibgeschützter Viewer, und seine Werkzeugleiste bekommt Schaltflächen zum Drehen des Bildes. Diese Drehung ändert nur die Anzeige. Eine Änderung dieser Option während der Bearbeitung verwirft die Änderungen.

### `toolbar`

- **Typ:** `boolean`
- **Standard:** `true`

Ob die eingebaute Werkzeugleiste und Bearbeitungsleiste angezeigt werden. Ohne sie baust du eigene Bedienelemente mit den [Methoden](./methods).

### `tools`

- **Typ:** [`readonly ToolId[]`](./types#toolid)
- **Standard:** alle Werkzeuge

Die Werkzeuge, die die Bearbeitungsleiste anbietet. Sie behalten die Reihenfolge dieser Tabelle, egal in welcher Reihenfolge das Array sie nennt.

| Id              | Schaltfläche                          |
| --------------- | ------------------------------------- |
| `'crop'`        | Zuschneiden                           |
| `'perspective'` | Begradigen                            |
| `'rotate'`      | Nach links drehen                     |
| `'flip'`        | Spiegeln                              |
| `'adjust'`      | Anpassen, für Helligkeit und Kontrast |
| `'threshold'`   | Bereinigen                            |

### `wheelZoom`

- **Typ:** `boolean`
- **Standard:** `true`

Ob das Mausrad das Bild zoomt. Schalte es aus, wenn der Viewer in einer langen Seite sitzt, damit das Mausrad die Seite scrollt.

### `download`

- **Typ:** `boolean`
- **Standard:** `false`

Ob die Werkzeugleiste eine Schaltfläche hat, die das angezeigte Bild speichert: das Ergebnis des letzten Übernehmens, sonst das Quellbild. Während der Bearbeitung ist die Schaltfläche ausgeblendet. Mit dem Ereignis [`download`](./events#download) kannst du die Datei auf andere Weise speichern.

### `labels`

- **Typ:** [`Partial<PaperPicLabels>`](./types#paperpiclabels)
- **Standard:** die englischen Texte

Ersetzt beliebige Texte, die die Komponente anzeigt oder ansagt. [Beschriftungen](./labels) listet alle Schlüssel.

### `icons`

- **Typ:** [`Partial<PaperPicIcons>`](./types#paperpicicons)
- **Standard:** die eingebauten Icons

Ersetzt beliebige Icons durch dein eigenes Markup aus einem einzigen Element, etwa ein `<svg>`. Das Markup kommt als HTML in die Seite, übergib also nur Markup, dem du vertraust. Ein leerer String lässt die Schaltflächen dieses Icons ohne Icon. [Gestaltung](../guide/styling#icons) zeigt ein Beispiel.

Jeder Schlüssel benennt ein Icon, und manche Icons stehen auf zwei Schaltflächen:

| Schlüssel        | Schaltfläche                                                               |
| ---------------- | -------------------------------------------------------------------------- |
| `adjust`         | Anpassen                                                                   |
| `apply`          | Übernehmen, und Fertig in jedem Werkzeug                                   |
| `brightness`     | Helligkeit, im Bedienfeld von Anpassen                                     |
| `cancel`         | Abbrechen, und Dieses Werkzeug abbrechen                                   |
| `contrast`       | Kontrast, im Bedienfeld von Anpassen                                       |
| `crop`           | Zuschneiden                                                                |
| `download`       | Herunterladen                                                              |
| `edit`           | Bearbeiten                                                                 |
| `fitHeight`      | An Höhe anpassen                                                           |
| `fitWidth`       | An Breite anpassen                                                         |
| `flip`           | Spiegeln                                                                   |
| `perspective`    | Begradigen                                                                 |
| `redo`           | Wiederholen                                                                |
| `rotateDocument` | Nach links drehen, in der Bearbeitungsleiste                               |
| `rotateLeft`     | Nach links drehen, in der Werkzeugleiste eines schreibgeschützten Viewers  |
| `rotateRight`    | Nach rechts drehen, in der Werkzeugleiste eines schreibgeschützten Viewers |
| `threshold`      | Bereinigen                                                                 |
| `undo`           | Rückgängig                                                                 |
| `zoomIn`         | Vergrößern                                                                 |
| `zoomOut`        | Verkleinern                                                                |

## Ergebnis

### `output`

- **Typ:** [`PaperPicOutput`](./types#paperpicoutput)
- **Standard:** das Format des Quellbilds

Das Format des bearbeiteten Bildes. `type` ist `'image/jpeg'`, `'image/png'` oder `'image/webp'`, und `quality` reicht von 0 bis 1 für JPEG und WebP, standardmäßig `0.92`.

Ohne `type` wird ein bereinigtes Bild zu PNG, weil JPEG seine scharfen Kanten beschädigen würde, und jedes andere Bild behält das Format der Quelle. Ein Format, das der Browser nicht kodieren kann, ergibt PNG.

### `maxOutputSize`

- **Typ:** `number`
- **Standard:** die volle Auflösung

Die längste Seite des bearbeiteten Bildes in Pixeln. Ein größeres Ergebnis wird verkleinert.

### `filename`

- **Typ:** `string`
- **Standard:** der Name des Quellbilds

Der Name der gespeicherten Datei. Ihre Endung folgt dem Format des Bildes, ein bereinigtes `receipt.jpg` wird also als `receipt.png` gespeichert. Hat die Quelle keinen Namen, etwa ein `Blob`, heißt die Datei `image`.

## Werkzeuge

### `aspectRatio`

- **Typ:** `number`
- **Standard:** geschätzt

Das echte Seitenverhältnis des Dokuments, als Breite geteilt durch Höhe, etwa `210 / 297` für ein A4-Blatt. Begradigen gibt seinem Ergebnis dieses Seitenverhältnis. Ohne diese Option schätzt es das Verhältnis aus dem Foto.

### `softness`

- **Typ:** `number`, von 0 bis 1
- **Standard:** `0.25`

Wie viel Grau Bereinigen an den Rändern der Buchstaben behält, was sie leichter lesbar macht. Nimm `0` für strenges Schwarzweiß, das kleinere Dateien ergibt, aber dünne Striche zerbricht.
