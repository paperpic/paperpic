---
title: Viewer
description: Wie man in PaperPic ein Dokumentbild zoomt, verschiebt und einpasst, was die Werkzeugleiste bietet und wie man ein Bild schreibgeschützt zeigt, mit einer Live-Demo.
---

# Viewer

Kleingedrucktes und lange Kassenbons sind auf einem Bildschirm schwer auf einen Blick zu lesen. Der Viewer passt das Bild beim Laden ein und lässt in jeden Teil hineinzoomen.

<Demo src="/samples/receipt.jpg" alt="Ein Kassenbon" :editable="false" />

## Zoomen und verschieben

| Aktion                                 | Maus und Trackpad                          | Touch        | Tastatur    |
| -------------------------------------- | ------------------------------------------ | ------------ | ----------- |
| Zoomen                                 | Mausrad, oder zwei Finger auf dem Trackpad | Zwei Finger  | `+` und `-` |
| Verschieben                            | Ziehen                                     | Ziehen       | Pfeiltasten |
| Zwischen Einpassung und 100 % wechseln | Doppelklick                                | Doppeltippen |             |
| Das ganze Bild einpassen               |                                            |              | `0`         |

Die Tastatur funktioniert, wenn der Viewer den Fokus hat. Mit zwei Fingern zoomt man um den Punkt zwischen den Fingern.

Der Zoom reicht von der Einpassung des ganzen Bildes, oder 100 % bei einem kleinen Bild, bis 800 %. Ein Bild, das hineinpasst, bleibt zentriert, und eines, das übersteht, lässt sich bis zu seinen Rändern verschieben.

Beim Laden wird das Bild ganz in den Viewer eingepasst, und es behält seine Einpassung, wenn der Viewer die Größe ändert, bis der Nutzer von Hand zoomt.

In einer langen Seite würde das Mausrad das Bild zoomen, statt die Seite zu scrollen. Setze dort `wheelZoom: false`: Die Schaltflächen, die Tastatur und zwei Finger auf einem Touchscreen zoomen weiterhin.

## Die Werkzeugleiste

Die Werkzeugleiste sitzt rechts im Viewer und scrollt, wenn der Viewer zu niedrig für ihre Schaltflächen ist.

| Schaltfläche                          | Was sie tut                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Bearbeiten                            | Startet den [Bearbeitungsmodus](./editing). Ausgeblendet mit `editable: false` |
| Vergrößern, Verkleinern               | Zoomen eine Stufe, um die Mitte                                                |
| An Breite anpassen, An Höhe anpassen  | Passen die Breite ein, gut für lange Dokumente, oder die Höhe                  |
| Nach links drehen, Nach rechts drehen | Nur in einem schreibgeschützten Viewer: drehen das angezeigte Bild             |
| Herunterladen                         | Nur mit `download: true`: speichert das angezeigte Bild                        |

Mit `toolbar: false` sind die Werkzeugleiste und die Bearbeitungsleiste ausgeblendet, und du kannst eigene Bedienelemente mit den [Methoden](../reference/methods) bauen.

## Schreibgeschützter Viewer

Mit `editable: false` verschwindet die Schaltfläche Bearbeiten, und die Werkzeugleiste bekommt zwei Schaltflächen, die das Bild drehen. Diese Drehung ändert nur die Anzeige, und nichts wird gespeichert. Nutze das für Dokumente, die man lesen, aber nicht ändern soll, etwa die Anhänge einer Akte.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'Ein Kassenbon',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Ein Kassenbon" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Ein Kassenbon" editable={false} />
```

:::

## Die Ansicht aus dem Code steuern

Die Methoden [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) und [`fit()`](../reference/methods#fit) tun, was die Schaltflächen tun, und [`getState()`](../reference/methods#getstate) nennt dir den Zoom und die aktive Einpassung:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
