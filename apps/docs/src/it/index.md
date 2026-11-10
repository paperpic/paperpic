---
layout: home
title: PaperPic
titleTemplate: Visualizzatore ed editor di immagini di documenti
description: Visualizzatore ed editor open source di immagini di documenti. Zoom, rotazione, correzione della prospettiva, luminosità e contrasto, bianco e nero e rimozione delle ombre.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Immagini di documenti, fatte bene
  tagline: Visualizza e modifica le foto dei documenti. Ingrandisci, ruota, correggi la prospettiva, regola luminosità e contrasto, converti in un bianco e nero pulito e rimuovi le ombre.
  actions:
    - theme: brand
      text: Inizia
      link: /it/guide/getting-started
    - theme: alt
      text: Playground
      link: /it/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visualizzatore"
    details: "Zooma con i pulsanti, la rotellina o il pizzico, sposta l’immagine e adatta la larghezza degli scontrini lunghi. In sola lettura se serve."
    link: /it/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Raddrizza e ritaglia"
    details: "Trascina quattro angoli per trasformare una foto scattata di sbieco in una pagina piatta, con le proporzioni stimate o fissate."
    link: /it/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Pulisci"
    details: "Trasforma una foto piena di ombre in un bianco e nero nitido, e regola luminosità e contrasto dei documenti a colori."
    link: /it/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Risoluzione piena"
    details: "Applica consegna al tuo codice l’immagine modificata come Blob, elaborata in un Web Worker così la pagina resta reattiva."
    link: /it/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessibile"
    details: "Scorciatoie da tastiera, maniglie d’angolo che si spostano con le frecce e annunci per i lettori di schermo."
    link: /it/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Qualsiasi framework"
    details: "Un core per JavaScript senza framework, wrapper leggeri per Vue e React, e nessuna dipendenza a runtime."
    link: /it/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Confronta la foto e il risultato"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto di uno scontrino su un tavolo, scattata di sbieco e in parte in ombra"
  afterAlt: "Lo stesso scontrino, raddrizzato e pulito in bianco e nero"
---
