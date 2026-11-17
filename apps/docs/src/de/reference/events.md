---
title: Ereignisse
description: Die Ereignisse von PaperPic (load, error, change, apply und download), was jedes liefert, und wie du in JavaScript, Vue und React auf sie hörst.
---

# Ereignisse

Ereignisse teilen deinem Code mit, was im Viewer passiert. Höre mit [`on()`](./methods#on) auf sie. In Vue sind sie Komponentenereignisse wie `@apply`, in React Props wie `onApply`. Wirft eine zuhörende Funktion einen Fehler, läuft der Viewer weiter: Die Seite erhält den Fehler wie jeden nicht abgefangenen, und die anderen Funktionen laufen trotzdem.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Daten:** [`Size`](./types#size)

Das Bild ist geladen und wird angezeigt. `width` und `height` sind seine Größe in Pixeln. Es wird bei jedem Laden eines `src` ausgelöst, auch mit [`reload()`](./methods#reload), aber nicht nach dem Übernehmen, dessen Ergebnis mit [`apply`](#apply) kommt.

## `error`

- **Daten:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Etwas ist fehlgeschlagen, und `phase` sagt, was:

- `'load'`: Das Bild konnte nicht geladen werden.
- `'preview'`: Eine Bearbeitung konnte nicht angezeigt werden, etwa weil das Bild für den Browser zu groß ist. Die Bearbeitung bleibt offen.
- `'apply'`: Die Änderungen konnten nicht übernommen werden. Die Bearbeitung bleibt offen.

## `change`

- **Daten:** [`PaperPicState`](./state)

Der Zustand hat sich geändert, durch den Nutzer oder durch eine Methode, etwa durch Zoomen, das Öffnen eines Werkzeugs oder Rückgängig. Es liefert den ganzen Zustand, denselben, den [`getState()`](./methods#getstate) in diesem Moment zurückgeben würde. Übernehmen löst es zweimal aus: beim Start, mit `busy: true`, und beim erfolgreichen Ende, nach [`apply`](#apply).

Diese Dinge ändern den Zustand, ohne `change` auszulösen:

- Das Laden eines Bildes, das [`load`](#load) oder [`error`](#error) meldet.
- Ein Übernehmen, das fehlschlägt, was [`error`](#error) meldet. `busy` ist wieder `false`.
- `setOptions()` und die Props der Komponenten, damit Zwei-Wege-Bindungen keine Schleife bilden.
- Eine Größenänderung des Viewers, die `zoom` ändert, solange eine Einpassung aktiv ist.

Das Verschieben des Bildes löst nichts aus, weil der Zustand seine Position nicht enthält. [Zustand](./state#in-step) zeigt, wie du eigene Bedienelemente synchron hältst.

## `apply`

- **Daten:** [`ExportedImage`](./types#exportedimage)

Übernehmen ist fertig, über die Schaltfläche, `Enter` oder [`apply()`](./methods#apply), und das Ergebnis wird schon angezeigt. `blob` enthält das Bild im Format `type`, das [`output`](./options#output) bestimmt.

## `download`

- **Daten:** [`PaperPicDownload`](./types#paperpicdownload)

Das Bild wird gleich gespeichert, über die Download-Schaltfläche oder über [`download()`](./methods#download). `source` ist das angezeigte Bild: das Ergebnis des letzten Übernehmens, sonst der `src`. `filename` ist der Name der Datei.

Rufe `preventDefault()` auf, damit der Browser die Datei nicht speichert, etwa um sie auf andere Weise zu speichern:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
