---
layout: home
title: PaperPic
titleTemplate: Visor y editor de imágenes de documentos
description: Visor y editor de imágenes de documentos de código abierto. Zoom, rotación, corrección de perspectiva, brillo y contraste, blanco y negro y eliminación de sombras.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Imágenes de documentos, bien hechas
  tagline: Visualiza y edita fotos de documentos. Haz zoom, gira, corrige la perspectiva, ajusta el brillo y el contraste, conviértelas a un blanco y negro limpio y elimina las sombras.
  actions:
    - theme: brand
      text: Empezar
      link: /es/guide/getting-started
    - theme: alt
      text: Playground
      link: /es/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visor"
    details: "Haz zoom con los botones, la rueda o pellizcando, desplázate y ajusta el ancho de los tiques largos. De solo lectura si lo necesitas."
    link: /es/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Enderezar y recortar"
    details: "Arrastra cuatro esquinas para convertir una foto hecha en ángulo en una página plana, con sus proporciones estimadas o fijadas."
    link: /es/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Limpiar"
    details: "Convierte una foto con sombras en un blanco y negro nítido, y ajusta el brillo y el contraste de los documentos en color."
    link: /es/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Resolución completa"
    details: "Aplicar entrega a tu código la imagen editada como un Blob, procesada en un Web Worker para que la página siga respondiendo."
    link: /es/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Accesible"
    details: "Atajos de teclado, tiradores de esquina que se mueven con las flechas y anuncios para lectores de pantalla."
    link: /es/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Cualquier framework"
    details: "Un core para JavaScript sin framework, con wrappers ligeros para Vue y React, y sin dependencias en tiempo de ejecución."
    link: /es/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Compara la foto y el resultado"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto de un tique sobre una mesa, hecha en ángulo y en parte a la sombra"
  afterAlt: "El mismo tique, enderezado y limpiado en blanco y negro"
---
