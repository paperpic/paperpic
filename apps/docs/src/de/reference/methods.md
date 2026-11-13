---
title: Methoden
description: Alle Methoden der Klasse PaperPic, um den Viewer aus deinem Code zu steuern, etwa zoomen, anpassen, drehen, bearbeiten, übernehmen, herunterladen und neu laden.
---

# Methoden

Die Methoden steuern den Viewer aus deinem Code, etwa über eigene Schaltflächen mit [`toolbar: false`](./options#toolbar). In Vue und React gibt dir die Ref der Komponente den Viewer: siehe [Vue](./vue) und [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Erstellen und entfernen

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Erstellt den Viewer in `container`, den er ausfüllt. Gib dem Container eine Höhe, sonst bleibt der Viewer bei seiner Mindesthöhe. [Optionen](./options) beschreibt, was `options` annimmt.

Wirft einen `TypeError`, wenn `container` kein Element ist. Erstelle den Viewer, sobald das Element existiert, etwa beim Mounten.

### `destroy()`

```ts
function destroy(): void
```

Entfernt den Viewer und gibt alles frei, was er hält, etwa seinen Worker und den Speicher seiner Bilder. Ein zweiter Aufruf ist unbedenklich.

## Optionen und Zustand

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Ändert die Optionen, die du übergibst, und behält die übrigen. `undefined` setzt eine Option auf ihren Standardwert zurück. Es löst nie `change` aus, damit Zwei-Wege-Bindungen keine Schleife bilden.

### `getState()`

```ts
function getState(): PaperPicState
```

Gibt zurück, was der Viewer zeigt, etwa den Zoom, den Modus und ob es Änderungen zum Übernehmen gibt. [Zustand](./state) beschreibt jedes Feld.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Hört auf ein Ereignis und gibt eine Funktion zurück, die das Zuhören beendet. [Ereignisse](./events) beschreibt jedes Ereignis.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

## Ansicht

### `zoomIn()`

```ts
function zoomIn(): void
```

Zoomt eine Stufe hinein, um die Mitte des Viewers.

### `zoomOut()`

```ts
function zoomOut(): void
```

Zoomt eine Stufe heraus, um die Mitte des Viewers.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: ViewPoint): void
```

Setzt den Zoom, wobei `1` ein Bildpixel pro Bildschirmpixel zeigt. [`point`](./types#viewpoint) bleibt an seiner Stelle: Er ist in CSS-Pixeln von der oberen linken Ecke des Viewers angegeben und standardmäßig dessen Mitte.

Der Zoom reicht von der Einpassung des ganzen Bildes, oder `1`, falls das kleiner ist, bis `8`. Ein Wert außerhalb wird begrenzt.

### `fit()`

```ts
function fit(fit: Fit): void
```

Passt das ganze Bild, seine Breite oder seine Höhe in den Viewer ein. `fit` ist ein [`Fit`](./types#fit): `'image'`, `'width'` oder `'height'`.

## Bearbeitung

### `edit()`

```ts
function edit(): void
```

Startet die Bearbeitung. Tut nichts, wenn das Bild nicht bereit ist oder [`editable`](./options#editable) `false` ist.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Dreht das Bild um eine Vierteldrehung: im Uhrzeigersinn mit `1`, dem Standard, und gegen den Uhrzeigersinn mit `-1`. Während der Bearbeitung ist es eine Änderung, die [`apply()`](#apply) dauerhaft macht. In einem schreibgeschützten Viewer ändert es nur die Anzeige. Sonst tut es nichts.

### `flip()`

```ts
function flip(): void
```

Spiegelt das Bild von links nach rechts, so wie es angezeigt wird, nach einer Vierteldrehung also immer noch von links nach rechts. Um das Bild auf den Kopf zu stellen, spiegle es und drehe es zweimal. Es ist eine Änderung und tut nichts außerhalb des Bearbeitungsmodus oder bei offenem Werkzeug.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Öffnet ein Werkzeug mit Bedienfeld: Zuschneiden mit `'crop'`, Begradigen mit `'perspective'`, Anpassen mit `'adjust'` oder Bereinigen mit `'threshold'`, das sich beim Öffnen einschaltet. Das Werkzeug bleibt offen bis [`confirmTool()`](#confirmtool) oder [`cancelTool()`](#canceltool), und solange tun die übrigen Änderungen, Rückgängig, Wiederholen und Übernehmen nichts. Tut nichts außerhalb des Bearbeitungsmodus, bei einem anderen offenen Werkzeug, für Anpassen bei eingeschaltetem Bereinigen und für Zuschneiden und Begradigen, solange eine Vorschau unterwegs ist.

### `confirmTool()`

```ts
function confirmTool(): void
```

Schließt das offene Werkzeug und fügt das, was es gewählt hat, zu den Änderungen hinzu, wie `Enter`: die Auswahl von Zuschneiden oder Begradigen, oder die Einstellungen von Anpassen oder Bereinigen, als eine Änderung.

### `cancelTool()`

```ts
function cancelTool(): void
```

Schließt das offene Werkzeug und verwirft seine Änderungen, wie `Esc`.

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Schaltet Bereinigen ein oder aus, oder ändert seine Empfindlichkeit, von 0 bis 1. Bereinigen läuft immer nach den übrigen Änderungen. Solange Bereinigen offen ist, ändert es, was Bereinigen zeigt, und [`confirmTool()`](#confirmtool) behält es als eine Änderung. Tut nichts außerhalb des Bearbeitungsmodus oder bei einem anderen offenen Werkzeug.

Wirft einen `RangeError`, wenn `sensitivity` nicht zwischen 0 und 1 liegt.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Ändert die Helligkeit oder den Kontrast, jeweils von -1 bis 1, wobei 0 das Bild lässt, wie es ist. Sie laufen nach den übrigen Änderungen. Solange Anpassen offen ist, ändert es, was Anpassen zeigt, und [`confirmTool()`](#confirmtool) behält es als eine Änderung. Tut nichts außerhalb des Bearbeitungsmodus, bei einem anderen offenen Werkzeug oder wenn Bereinigen eingeschaltet ist, weil ein bereinigtes Dokument eigene Töne hat.

Wirft einen `RangeError`, wenn ein Wert nicht zwischen -1 und 1 liegt.

### `undo()`

```ts
function undo(): void
```

Macht die letzte Änderung rückgängig.

### `redo()`

```ts
function redo(): void
```

Stellt die zuletzt rückgängig gemachte Änderung wieder her.

### `apply()`

```ts
function apply(): Promise<void>
```

Übernimmt die Änderungen in voller Auflösung oder in [`maxOutputSize`](./options#maxoutputsize). Das Ergebnis wird zum angezeigten Bild, der Verlauf leert sich, der Viewer kehrt in den Ansichtsmodus zurück, und das Ereignis [`apply`](./events#apply) liefert das Ergebnis. Übernehmen lässt sich nicht unterbrechen und sperrt die Bedienelemente, solange es läuft.

Schlägt es fehl, meldet das Ereignis [`error`](./events#error) den Fehler, und die Bearbeitung bleibt offen.

### `cancel()`

```ts
function cancel(): void
```

Verwirft die Änderungen und kehrt in den Ansichtsmodus zurück. Es fragt nicht nach: Das tun die eingebaute Schaltfläche Abbrechen und `Esc`.

## Bild

### `download()`

```ts
function download(): void
```

Speichert das angezeigte Bild als Datei: das Ergebnis des letzten Übernehmens, sonst das Quellbild. Es funktioniert ohne die Option [`download`](./options#download), die nur eine Schaltfläche zeigt. Das Ereignis [`download`](./events#download) kommt vorher und kann es verhindern. Tut nichts während der Bearbeitung, weil die Änderungen noch nicht übernommen sind.

### `reload()`

```ts
function reload(): void
```

Lädt den aktuellen [`src`](./options#src) erneut, was nach einem Übernehmen das Original zurückholt.
