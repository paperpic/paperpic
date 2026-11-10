---
layout: home
title: PaperPic
titleTemplate: Visionneuse et éditeur d’images de documents
description: Visionneuse et éditeur d’images de documents open source. Zoom, rotation, correction de perspective, luminosité et contraste, noir et blanc et suppression des ombres.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Des images de documents impeccables
  tagline: Affichez et modifiez des photos de documents. Zoomez, faites pivoter, corrigez la perspective, réglez la luminosité et le contraste, convertissez en noir et blanc net et supprimez les ombres.
  actions:
    - theme: brand
      text: Commencer
      link: /fr/guide/getting-started
    - theme: alt
      text: Playground
      link: /fr/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visionneuse"
    details: "Zoomez avec les boutons, la molette ou un pincement, déplacez l’image et ajustez la largeur des longs tickets. En lecture seule si besoin."
    link: /fr/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Redresser et recadrer"
    details: "Faites glisser quatre coins pour transformer une photo prise de biais en page à plat, avec ses proportions estimées ou fixées."
    link: /fr/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Nettoyer"
    details: "Transformez une photo pleine d’ombres en noir et blanc net, et réglez la luminosité et le contraste des documents en couleur."
    link: /fr/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Pleine résolution"
    details: "Appliquer remet à votre code l’image modifiée sous forme de Blob, traitée dans un Web Worker pour que la page reste réactive."
    link: /fr/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accessible"
    details: "Raccourcis clavier, poignées d’angle qui se déplacent avec les flèches et annonces pour les lecteurs d’écran."
    link: /fr/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Tout framework"
    details: "Un cœur pour JavaScript sans framework, des wrappers légers pour Vue et React, et aucune dépendance à l’exécution."
    link: /fr/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Comparer la photo et le résultat"
  beforeLabel: "Photo"
  afterLabel: "PaperPic"
  beforeAlt: "Photo d’un ticket de caisse sur une table, prise de biais et en partie dans l’ombre"
  afterAlt: "Le même ticket, redressé et nettoyé en noir et blanc"
---
