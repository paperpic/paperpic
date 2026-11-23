---
title: Methoden
description: Alle Methoden der Klasse PaperPic, um den Viewer aus deinem Code zu steuern, etwa zoomen, anpassen, drehen, bearbeiten, übernehmen, herunterladen und neu laden.
---

# Methoden

Die Methoden steuern den Viewer aus deinem Code, etwa über eigene Schaltflächen mit [`toolbar: false`](./options#toolbar). Mit dem Core rufst du sie auf dem `PaperPic` auf, das du erstellst. In Vue stellt die Komponente den Viewer als `instance` bereit, und in React bekommt ihn `ref`. Beide sind `null`, bis die Komponente gemountet ist:

:::tabs key:framework
== JavaScript

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

== Vue

```vue
<script setup lang="ts">
import { PaperPic } from '@paperpic/vue'
import { useTemplateRef } from 'vue'

const pic = useTemplateRef('pic')
</script>

<template>
  <button type="button" @click="pic?.instance?.zoomIn()">
    Vergrößern
  </button>
  <div style="height: 480px">
    <PaperPic ref="pic" src="/receipt.jpg" />
  </div>
</template>
```

== React

```tsx
import type { PaperPicInstance } from '@paperpic/react'
import { PaperPic } from '@paperpic/react'
import { useRef } from 'react'

export function Receipt() {
  const picRef = useRef<PaperPicInstance>(null)

  return (
    <>
      <button type="button" onClick={() => picRef.current?.zoomIn()}>Vergrößern</button>
      <div style={{ height: 480 }}>
        <PaperPic ref={picRef} src="/receipt.jpg" />
      </div>
    </>
  )
}
```

:::

In Vue und React erstellt und zerstört die Komponente den Viewer und nimmt die Optionen als Props und die Ereignisse als eigene Ereignisse. Rufe dort also nicht [`new PaperPic()`](#new-paperpic), [`destroy()`](#destroy), [`setOptions()`](#setoptions) oder [`on()`](#on) auf.

## Erstellen und entfernen

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Erstellt den Viewer in `container`, den er ausfüllt. Gib dem Container eine Höhe, sonst bleibt der Viewer bei seiner Mindesthöhe. [Optionen](./options) beschreibt, was `options` annimmt.

Wirft einen `TypeError`, wenn `container` kein Element ist. Erstelle den Viewer, sobald das Element existiert, etwa beim Mounten. Wirft einen `RangeError`, wenn eine Option außerhalb ihres Bereichs liegt.

Nur mit dem Core: Die Komponenten für Vue und React erstellen den Viewer, wenn sie gemountet werden.

### `destroy()`

```ts
function destroy(): void
```

Entfernt den Viewer und gibt alles frei, was er hält, etwa seinen Worker und den Speicher seiner Bilder. Ein zweiter Aufruf ist unbedenklich.

Nur mit dem Core: Die Komponenten für Vue und React rufen es auf, wenn sie entfernt werden. Auf ihrem Viewer aufgerufen, ließe es die Komponente leer.

## Optionen und Zustand

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Ändert die Optionen, die du übergibst, und behält die übrigen. `undefined` setzt eine Option auf ihren Standardwert zurück. Es löst nie `change` aus, damit Zwei-Wege-Bindungen keine Schleife bilden. Wirft einen `RangeError`, wenn eine Option außerhalb ihres Bereichs liegt, und ändert dann keine Option.

In Vue und React änderst du stattdessen die Props. Die nächste Änderung einer Prop sendet alle Optionen erneut und würde eine Änderung mit `setOptions()` rückgängig machen.

### `getState()`

```ts
function getState(): PaperPicState
```

Gibt den aktuellen Zustand des Viewers zurück, etwa den Zoom, den Modus und ob es Änderungen zum Übernehmen gibt. Um von jeder Änderung zu erfahren, ohne zu fragen, höre auf [`change`](./events#change). [Zustand](./state) beschreibt jedes Feld und wie beide zusammenspielen.

### `on()`

```ts
function on<Name extends keyof PaperPicEvents>(name: Name, listener: (payload: PaperPicEvents[Name]) => void): () => void
```

Hört auf ein Ereignis und gibt eine Funktion zurück, die das Zuhören beendet. [Ereignisse](./events) beschreibt jedes Ereignis.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

In Vue und React hörst du stattdessen auf die Ereignisse der Komponente, etwa `@apply` oder `onApply`.

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

Wirft einen `RangeError`, wenn `zoom` `NaN` ist oder eine Koordinate von `point` keine endliche Zahl ist, und der Zoom ändert sich dann nicht.

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

Dreht das Bild um eine Vierteldrehung: im Uhrzeigersinn mit `1`, dem Standard, und gegen den Uhrzeigersinn mit `-1`. Während der Bearbeitung fügt es eine Änderung hinzu, die [`apply()`](#apply) dauerhaft macht, und tut nichts, solange ein Werkzeug offen ist oder Übernehmen läuft. In einem schreibgeschützten Viewer ändert es nur die Anzeige. Sonst tut es nichts.

### `flip()`

```ts
function flip(): void
```

Spiegelt das Bild von links nach rechts, so wie es angezeigt wird, nach einer Vierteldrehung also immer noch von links nach rechts. Um das Bild von oben nach unten zu spiegeln, spiegle es und drehe es zweimal. Es ist eine Änderung und tut nichts außerhalb des Bearbeitungsmodus oder bei offenem Werkzeug.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Öffnet ein Werkzeug mit Bedienfeld: Zuschneiden (`'crop'`), Begradigen (`'perspective'`), Anpassen (`'adjust'`) oder Bereinigen (`'finish'`), das beim Öffnen Schwarzweiß wählt, wenn das Finish das Original ist. Das Werkzeug bleibt offen bis [`confirmTool()`](#confirmtool) oder [`cancelTool()`](#canceltool). Solange kann keine andere Änderung beginnen, und Rückgängig, Wiederholen und Übernehmen tun nichts. Tut nichts außerhalb des Bearbeitungsmodus, bei einem anderen offenen Werkzeug, für Anpassen in Schwarzweiß und für Zuschneiden und Begradigen, solange eine Vorschau unterwegs ist.

Abdecken (`'redact'`) öffnet sich ebenfalls mit Ecken, wie Zuschneiden.

### `confirmTool()`

```ts
function confirmTool(): void
```

Schließt das offene Werkzeug und fügt das, was es gewählt hat, zu den Änderungen hinzu, wie `Enter`: die Auswahl von Zuschneiden oder Begradigen, oder die Einstellungen von Anpassen oder Bereinigen, als eine Änderung. In Begradigen tut es nichts, bis sich eine Ecke bewegt, und `canConfirm` im [Zustand](./state) sagt, wann es geht.

### `cancelTool()`

```ts
function cancelTool(): void
```

Schließt das offene Werkzeug und verwirft seine Änderungen, wie `Esc`.

### `setFinish()`

```ts
function setFinish(setting: { mode?: FinishMode, sensitivity?: number }): void
```

Wählt das Finish von [Bereinigen](../guide/tools/clean-up): `'original'`, `'gray'` oder `'mono'` für Schwarzweiß. Es ändert auch die Empfindlichkeit von Schwarzweiß, von 0 bis 1. Das Finish läuft immer nach den übrigen Änderungen. Solange Bereinigen offen ist, ändert es, was Bereinigen zeigt, und [`confirmTool()`](#confirmtool) behält es als eine Änderung. Tut nichts außerhalb des Bearbeitungsmodus oder bei einem anderen offenen Werkzeug.

Wirft einen `RangeError`, wenn `mode` kein [`FinishMode`](./types#finishmode) ist oder `sensitivity` nicht zwischen 0 und 1 liegt.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Ändert die Helligkeit oder den Kontrast, jeweils von -1 bis 1, wobei 0 das Bild lässt, wie es ist. Sie laufen nach den übrigen Änderungen und vor Graustufen. Solange Anpassen offen ist, ändert es, was Anpassen zeigt, und [`confirmTool()`](#confirmtool) behält es als eine Änderung. Tut nichts außerhalb des Bearbeitungsmodus, bei einem anderen offenen Werkzeug oder in Schwarzweiß: Schwarzweiß vergleicht jedes Pixel mit seiner Umgebung, daher würden Helligkeit und Kontrast sein Ergebnis kaum ändern.

Wirft einen `RangeError`, wenn ein Wert nicht zwischen -1 und 1 liegt.

### `setPaper()`

```ts
function setPaper(setting: { size?: PaperSize }): void
```

Wählt das Papier, dessen Seitenverhältnis das Ergebnis von [Begradigen](../guide/tools/straighten#paper-size) bekommt: `'a4'`, `'letter'`, `'card'` für eine Ausweis- oder Bankkarte, oder `'auto'`, die Voreinstellung, die [`aspectRatio`](./options#aspectratio) nimmt oder sonst schätzt. Hoch- oder Querformat folgt den Ecken. Ohne offenes Begradigen tut es nichts, und jedes Begradigen beginnt mit `'auto'`.

Wirft einen `RangeError`, wenn `size` keine [`PaperSize`](./types#papersize) ist.

### `setRedaction()`

```ts
function setRedaction(setting: { color?: RedactColor }): void
```

Wählt die Farbe, mit der [Abdecken](../guide/tools/redact) überdeckt: `'black'`, die Voreinstellung, oder `'white'`. Solange Abdecken offen ist, ändert es den angezeigten Bereich, und [`confirmTool()`](#confirmtool) behält ihn. Sonst ist es die Farbe des nächsten Bereichs. Es funktioniert in jedem Modus.

Wirft einen `RangeError`, wenn `color` keine [`RedactColor`](./types#redactcolor) ist.

### `undo()`

```ts
function undo(): void
```

Macht die letzte Änderung rückgängig. Tut nichts außerhalb des Bearbeitungsmodus, bei einem offenen Werkzeug oder solange Übernehmen läuft.

### `redo()`

```ts
function redo(): void
```

Stellt die zuletzt rückgängig gemachte Änderung wieder her. Tut nichts außerhalb des Bearbeitungsmodus, bei einem offenen Werkzeug oder solange Übernehmen läuft.

### `apply()`

```ts
function apply(): Promise<void>
```

Übernimmt die Änderungen in voller Auflösung oder in [`maxOutputSize`](./options#maxoutputsize). Das Ergebnis wird zum angezeigten Bild, der Verlauf leert sich, der Viewer kehrt in den Ansichtsmodus zurück, und das Ereignis [`apply`](./events#apply) liefert das Ergebnis. Übernehmen lässt sich nicht unterbrechen und sperrt die Bedienelemente, solange es läuft. Es tut nichts außerhalb des Bearbeitungsmodus, bei einem offenen Werkzeug oder wenn es nichts zu übernehmen gibt.

Schlägt es fehl, meldet das Ereignis [`error`](./events#error) den Fehler, und die Bearbeitung bleibt offen. Das Promise wird aufgelöst, wenn Übernehmen endet, auch bei einem Fehler: Höre also auf `error`, statt ihn mit `try/catch` abzufangen.

### `cancel()`

```ts
function cancel(): void
```

Verwirft die Änderungen und kehrt in den Ansichtsmodus zurück. Es fragt nicht nach: Das tun die eingebaute Schaltfläche Abbrechen und `Esc`. Tut nichts, solange Übernehmen läuft.

## Bild

### `download()`

```ts
function download(): void
```

Speichert das angezeigte Bild als Datei: das Ergebnis des letzten Übernehmens, sonst das Quellbild. Es funktioniert ohne die Option [`download`](./options#download), die nur eine Schaltfläche zeigt. Das Ereignis [`download`](./events#download) kommt vorher und kann es verhindern. Tut nichts während der Bearbeitung, weil die Änderungen noch nicht übernommen sind. Vor dem ersten Übernehmen öffnet sich ein `src` von einem anderen Ursprung stattdessen im Browser: siehe [Das Ergebnis speichern](../guide/saving#download).

### `reload()`

```ts
function reload(): void
```

Lädt den aktuellen [`src`](./options#src) erneut, was nach einem Übernehmen das Original zurückholt. Während der Bearbeitung verwirft es die Änderungen. Ohne `src` tut es nichts.
