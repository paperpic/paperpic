---
title: Solução de problemas
description: O que fazer quando o visualizador do PaperPic não tem altura nem estilo, o Tailwind CSS o altera, uma imagem não carrega ou não pode ser editada, a página trava no Aplicar ou uma foto grande falha.
---

# Solução de problemas

A maioria dos problemas com o PaperPic vem da configuração, e não da imagem. Procure o que você vê, e logo abaixo está a solução.

## O visualizador é uma faixa fina, ou não aparece {#no-height}

O visualizador preenche o seu contêiner, e um contêiner sem altura encolhe para a altura mínima do visualizador, 16rem. Dê uma altura ao contêiner, como `height: 480px`, ou um lugar em um layout flex ou grid que lhe dê uma. [Estilos](./styling) mostra as duas formas.

## Os botões não têm estilo, e o console avisa {#no-stylesheet}

O console diz `PaperPic: the stylesheet is missing, so the viewer has no layout.` Importe a folha de estilos uma vez no seu app: `@paperpic/core/style.css`, ou o `style.css` de `@paperpic/vue` ou de `@paperpic/react`.

## O Tailwind CSS tira as bordas e o padding do visualizador {#tailwind}

O reset do Tailwind CSS 4 vence a folha de estilos do PaperPic quando as camadas da cascata vêm na ordem errada. Nomeie as camadas antes de importar as duas, como mostra [Estilos](./styling#tailwind).

## A imagem aparece, mas editá-la falha {#other-origin}

O [`error`](../reference/events#error) diz que a imagem vem de outra origem. Os navegadores não deixam o PaperPic ler os pixels dessa imagem. Busque-a você mesmo e passe o `Blob`, como mostra [Carregar imagens](./loading#fetch).

## A imagem não carrega {#load-error}

O visualizador mostra que não foi possível carregar a imagem, e `error` chega com `phase: 'load'`. Confira se a URL existe e se o navegador abre o formato: HEIC só abre no Safari, e um SVG precisa dos atributos `width` e `height`. [Carregar imagens](./loading#formats) lista os formatos.

## A página trava enquanto o Aplicar roda {#worker}

O worker não iniciou, então a edição roda na thread principal. Continua funcionando, mas fotos grandes travam a página por um momento. As causas mais comuns são:

- Uma Content Security Policy sem `worker-src 'self'`, ou uma que exige Trusted Types sem uma policy `default`. [Desempenho e compatibilidade](./performance) lista o que permitir.
- O pacote carregado de uma CDN, de uma origem diferente da página. Os navegadores só iniciam um worker da origem da página.

O painel de rede do navegador mostra se a página pediu o arquivo do worker, cujo nome começa com `worker`.

## O Aplicar falha com uma foto grande {#too-large}

O `error` diz `The browser could not read an image of …`, ou `could not save an image of …`. Os navegadores limitam o tamanho de um canvas, e o Safari no iOS mais que todos. Defina [`maxOutputSize`](../reference/options#maxoutputsize), por exemplo em 3000 pixels, o que mantém os documentos legíveis.

## A roda do mouse dá zoom na imagem em vez de rolar a página {#wheel}

Defina [`wheelZoom: false`](../reference/options#wheelzoom). Os botões, o teclado e o gesto de pinça continuam dando zoom.
