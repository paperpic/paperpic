---
title: Ereignisse
description: Die Ereignisse von PaperPic und was jedes liefert, load, error, change, apply und download, und wie du in JavaScript, Vue und React auf sie hörst.
---

# Ereignisse

Ereignisse teilen deinem Code mit, was im Viewer passiert. Höre mit [`on()`](./methods#on) auf sie. In Vue sind sie Komponentenereignisse wie `@apply`, in React Props wie `onApply`.

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

Das Bild ist geladen und wird angezeigt. `width` und `height` sind seine Größe in Pixeln.

## `error`

- **Daten:** `{ error: Error }`

Das Bild konnte nicht geladen oder die Änderungen nicht übernommen werden. Nach einem fehlgeschlagenen Übernehmen bleibt die Bearbeitung offen.

## `change`

- **Daten:** [`PaperPicState`](./state)

Der Nutzer hat die Ansicht oder die Bearbeitung geändert, etwa durch Zoomen, das Öffnen eines Werkzeugs oder Rückgängig. Es meldet auch den Start von Übernehmen, mit `busy: true`. `setOptions()` und die Props der Komponenten lösen es nie aus.

## `apply`

- **Daten:** [`ExportedImage`](./types#exportedimage)

Der Nutzer hat die Änderungen übernommen, und das Ergebnis wird schon angezeigt. `blob` enthält das Bild im Format `type`, das [`output`](./options#output) bestimmt.

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
