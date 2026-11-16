---
title: Desempenho e compatibilidade
description: Onde o PaperPic faz o trabalho, o que bundlers, Content Security Policy e renderização no servidor precisam, como ele lida com fotos grandes de celular e quais navegadores suporta.
---

# Desempenho e compatibilidade

Fotos de celular têm 12 megapixels ou mais, e editá-las dá trabalho de verdade. Esta página explica onde esse trabalho roda, o que o seu build e o seu servidor precisam e quais navegadores o PaperPic suporta.

## Um Web Worker faz o trabalho

Limpar e Endireitar levam mais de um segundo numa foto de 12 megapixels num celular. Na thread principal, a página travaria todo esse tempo. Por isso o PaperPic os roda num Web Worker, e a página continua respondendo enquanto o Aplicar roda.

O worker vem dentro do pacote e inicia com o padrão `new Worker(new URL(…, import.meta.url))`, que bundlers como Vite e webpack 5 reconhecem sozinhos, sem configuração. Se o worker não conseguir iniciar, a edição roda na thread principal: continua funcionando, mas a página pode travar por um instante com imagens grandes.

## Content Security Policy

Com uma Content Security Policy, permita:

- `worker-src 'self'`, para o worker.
- `img-src blob:`, porque o visualizador mostra arquivos anexados e os resultados do Aplicar por URLs `blob:`.
- `paperpic` em `trusted-types`, se a sua política limita as políticas de Trusted Types, porque os ícones dos botões passam por essa política.
- Uma política `default` de Trusted Types cujo `createScriptURL` aceite a URL do worker, se a sua política exige Trusted Types. Os bundlers só reconhecem um worker criado com uma URL simples, que o Trusted Types bloqueia, então sem essa política a edição roda na thread principal.

## Fotos grandes

- **Durante a edição**, a pré-visualização trabalha numa cópia de cerca de 2 megapixels, então réguas e ferramentas continuam fluidas com qualquer foto.
- **No Aplicar**, cada alteração é calculada na resolução completa. Fotos grandes levam alguns segundos, então o visualizador mostra uma mensagem e bloqueia os controles nesse tempo.
- **Para economizar tempo e memória**, defina [`maxOutputSize`](../reference/options#maxoutputsize). Um limite como 2000 ou 3000 pixels mantém os documentos legíveis, deixa o Aplicar mais rápido e os arquivos menores.

## Renderização no servidor

O PaperPic precisa de um navegador. Os componentes Vue e React renderizam um elemento vazio no servidor, como no Nuxt ou no Next.js, e criam o visualizador no navegador. Com o core, crie você mesmo o visualizador no navegador, por exemplo quando o seu componente é montado.

## Navegadores suportados

O PaperPic suporta os navegadores do [Baseline Widely Available](https://web.dev/baseline): os recursos que funcionam em todos os principais navegadores há pelo menos 30 meses. Os pacotes são compilados para esse alvo, ou seja, Chrome e Edge 124, Firefox 125 e Safari 17.5 ou mais recentes, então você não precisa transpilá-los.
