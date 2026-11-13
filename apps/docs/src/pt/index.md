---
layout: home
title: PaperPic
titleTemplate: Visualizador e editor de imagens de documentos
description: Visualizador e editor de imagens de documentos de código aberto. Zoom, rotação, correção de perspectiva, brilho e contraste, preto e branco e remoção de sombras.

hero:
  name: Paper<span class="name-accent">Pic</span>
  text: Imagens de documentos, do jeito certo
  tagline: Visualize e edite fotos de documentos. Dê zoom, gire, corrija a perspectiva, ajuste o brilho e o contraste, converta para um preto e branco limpo e remova sombras.
  actions:
    - theme: brand
      text: Começar
      link: /pt/guide/getting-started
    - theme: alt
      text: Playground
      link: /pt/playground
    - theme: alt
      text: GitHub
      link: https://github.com/paperpic/paperpic

features:
  - icon: { src: /icons/viewer.svg, wrap: true, width: 24, height: 24 }
    title: "Visualizador"
    details: "Dê zoom com os botões, a roda ou a pinça, mova a imagem e ajuste a largura de recibos longos. Somente leitura quando precisar."
    link: /pt/guide/viewer
  - icon: { src: /icons/perspective.svg, wrap: true, width: 24, height: 24 }
    title: "Endireitar e recortar"
    details: "Arraste quatro cantos para transformar uma foto tirada em ângulo numa página plana, com as proporções estimadas ou definidas."
    link: /pt/guide/tools/straighten
  - icon: { src: /icons/contrast.svg, wrap: true, width: 24, height: 24 }
    title: "Limpar"
    details: "Transforme uma foto com sombras num preto e branco nítido, e ajuste brilho e contraste de documentos coloridos."
    link: /pt/guide/tools/clean-up
  - icon: { src: /icons/download.svg, wrap: true, width: 24, height: 24 }
    title: "Resolução completa"
    details: "Aplicar entrega ao seu código a imagem editada como um Blob, processada num Web Worker para a página continuar respondendo."
    link: /pt/guide/saving
  - icon: { src: /icons/keyboard.svg, wrap: true, width: 24, height: 24 }
    title: "Acessível"
    details: "Atalhos de teclado, alças de canto que se movem com as setas e anúncios para leitores de tela."
    link: /pt/guide/accessibility
  - icon: { src: /icons/frameworks.svg, wrap: true, width: 24, height: 24 }
    title: "Qualquer framework"
    details: "Um core para JavaScript sem framework, wrappers leves para Vue e React, e nenhuma dependência em tempo de execução."
    link: /pt/guide/getting-started

comparison:
  before: /home-before.webp
  after: /home-after.webp
  label: "Compare a foto e o resultado"
  beforeLabel: "Foto"
  afterLabel: "PaperPic"
  beforeAlt: "Foto de um recibo sobre uma mesa, tirada em ângulo e em parte na sombra"
  afterAlt: "O mesmo recibo, endireitado e limpo em preto e branco"
---
