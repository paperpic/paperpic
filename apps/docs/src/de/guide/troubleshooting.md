---
title: Fehlerbehebung
description: Was zu tun ist, wenn der Viewer von PaperPic keine Höhe oder keine Gestaltung hat, Tailwind CSS ihn verändert, ein Bild nicht lädt oder sich nicht bearbeiten lässt, die Seite beim Übernehmen einfriert oder ein großes Foto fehlschlägt.
---

# Fehlerbehebung

Die meisten Probleme mit PaperPic kommen von der Einrichtung und nicht vom Bild. Such, was du siehst, und darunter die Lösung.

## Der Viewer ist ein dünner Streifen oder nicht zu sehen {#no-height}

Der Viewer füllt seinen Container, und ein Container ohne Höhe schrumpft auf die Mindesthöhe des Viewers, 16rem. Gib dem Container eine Höhe, etwa `height: 480px`, oder einen Platz in einem Flex- oder Grid-Layout, das ihm eine gibt. [Gestaltung](./styling) zeigt beides.

## Die Schaltflächen haben keine Gestaltung, und die Konsole warnt {#no-stylesheet}

Die Konsole meldet `PaperPic: the stylesheet is missing, so the viewer has no layout.` Importiere das Stylesheet einmal in deiner App: `@paperpic/core/style.css` oder die `style.css` von `@paperpic/vue` oder `@paperpic/react`.

## Tailwind CSS entfernt Rahmen und Innenabstand des Viewers {#tailwind}

Der Reset von Tailwind CSS 4 gewinnt gegen das Stylesheet von PaperPic, wenn die Kaskadenebenen in der falschen Reihenfolge kommen. Benenne die Ebenen, bevor du beide importierst, wie [Gestaltung](./styling#tailwind) zeigt.

## Das Bild wird angezeigt, aber die Bearbeitung schlägt fehl {#other-origin}

Der [`error`](../reference/events#error) sagt, dass das Bild von einem anderen Ursprung kommt. Browser lassen PaperPic die Pixel eines solchen Bildes nicht lesen. Ruf es selbst ab und übergib den `Blob`, wie [Bilder laden](./loading#fetch) zeigt.

## Das Bild lädt nicht {#load-error}

Der Viewer zeigt, dass das Bild nicht geladen werden konnte, und `error` trägt `phase: 'load'`. Prüfe, ob die URL existiert und der Browser das Format öffnet: HEIC öffnet sich nur in Safari, und ein SVG braucht die Attribute `width` und `height`. [Bilder laden](./loading#formats) listet die Formate auf.

## Die Seite friert beim Übernehmen ein {#worker}

Der Worker ist nicht gestartet, also läuft die Bearbeitung im Hauptthread. Sie funktioniert, aber große Fotos lassen die Seite kurz einfrieren. Die üblichen Ursachen sind:

- Eine Content Security Policy ohne `worker-src 'self'`, oder eine, die Trusted Types ohne `default`-Policy verlangt. [Leistung und Kompatibilität](./performance) listet auf, was zu erlauben ist.
- Das Paket wird von einem CDN geladen, von einem anderen Ursprung als die Seite. Browser starten einen Worker nur vom Ursprung der Seite.

Das Netzwerk-Panel des Browsers zeigt, ob die Seite die Datei des Workers angefordert hat, deren Name mit `worker` beginnt.

## Das Übernehmen schlägt bei einem großen Foto fehl {#too-large}

Der `error` meldet `The browser could not read an image of …` oder `could not save an image of …`. Browser begrenzen die Größe eines Canvas, Safari auf iOS am stärksten. Setze [`maxOutputSize`](../reference/options#maxoutputsize), etwa auf 3000 Pixel, wobei Dokumente lesbar bleiben.

## Das Mausrad zoomt das Bild, statt die Seite zu scrollen {#wheel}

Setze [`wheelZoom: false`](../reference/options#wheelzoom). Die Schaltflächen, die Tastatur und das Zusammenziehen mit zwei Fingern zoomen weiterhin.
