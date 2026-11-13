---
layout: home
title: PaperPic
titleTemplate: Betrachter und Editor für Dokumentbilder
description: Open-Source-Betrachter und -Editor für Dokumentbilder. Zoom, Drehung, Perspektivkorrektur, Helligkeit und Kontrast, Schwarzweiß und Schattenentfernung.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Dokumentbilder, wie sie sein sollen
  tagline: Dokumentfotos ansehen und bearbeiten. Zoomen, drehen, die Perspektive korrigieren, Helligkeit und Kontrast anpassen, in sauberes Schwarzweiß umwandeln und Schatten entfernen.
  actions:
    - theme: brand
      text: Loslegen
      link: /de/guide/getting-started
    - theme: alt
      text: Playground
      link: /de/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Viewer"
    details: "Zoome mit den Schaltflächen, dem Mausrad oder zwei Fingern, verschiebe das Bild und passe die Breite langer Kassenbons ein. Schreibgeschützt, wenn nötig."
    link: /de/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Begradigen und zuschneiden"
    details: "Ziehe vier Ecken, um aus einem schrägen Foto eine flache Seite zu machen, mit geschätztem oder festem Seitenverhältnis."
    link: /de/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Bereinigen"
    details: "Mach aus einem Foto mit Schatten klares Schwarzweiß, und passe Helligkeit und Kontrast farbiger Dokumente an."
    link: /de/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Volle Auflösung"
    details: "Übernehmen gibt deinem Code das bearbeitete Bild als Blob, verarbeitet in einem Web Worker, damit die Seite reaktionsschnell bleibt."
    link: /de/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Barrierefrei"
    details: "Tastenkürzel, Eckgriffe, die sich mit den Pfeiltasten bewegen, und Ansagen für Screenreader."
    link: /de/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Jedes Framework"
    details: "Ein Kern für JavaScript ohne Framework, schlanke Wrapper für Vue und React, und keine Laufzeitabhängigkeiten."
    link: /de/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Foto und Ergebnis vergleichen"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto eines Kassenbons auf einem Tisch, schräg aufgenommen und teils im Schatten"
  afterAlt: "Derselbe Kassenbon, begradigt und zu Schwarzweiß bereinigt"
---
