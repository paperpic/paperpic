---
title: Desempenho e compatibilidade
description: Onde o PaperPic faz o trabalho, o que bundlers, Content Security Policy e renderização no servidor precisam, como ele lida com fotos grandes de celular e quais navegadores suporta.
---

# Desempenho e compatibilidade

Fotos de celular têm 12 megapixels ou mais, e editá-las dá trabalho de verdade. Esta página explica onde esse trabalho roda, o que o seu build e o seu servidor precisam e quais navegadores o PaperPic suporta.

## Um Web Worker faz o trabalho

O preto e branco e Endireitar levam cerca de um segundo e meio em uma foto de 12 megapixels num celular recente, como mostram os [tempos medidos](#measurements). Na thread principal, a página travaria esse tempo todo. Por isso o PaperPic os roda em um Web Worker, e a página não trava enquanto as alterações são aplicadas. A busca do documento também roda ali.

O worker vem dentro do pacote e inicia com o padrão `new Worker(new URL(…, import.meta.url))`, que bundlers como Vite e webpack 5 reconhecem sozinhos, sem configuração. Se o worker não conseguir iniciar, a edição roda na thread principal: continua funcionando, mas a página pode travar por um instante com imagens grandes.

## Content Security Policy

Com uma Content Security Policy, permita:

- `worker-src 'self'`, para o worker.
- `img-src blob:`, porque o visualizador mostra arquivos anexados e os resultados editados por URLs `blob:`.
- `paperpic` em `trusted-types`, se a sua política limita as políticas de Trusted Types, porque os ícones dos botões passam por essa política.
- Uma política `default` de Trusted Types cujo `createScriptURL` aceite a URL do worker, se a sua política exige Trusted Types. Os bundlers só reconhecem um worker criado com uma URL simples, que o Trusted Types bloqueia, então sem essa política a edição roda na thread principal.

## Fotos grandes

- **Durante a edição**, a pré-visualização trabalha numa cópia de cerca de 2 megapixels, então réguas e ferramentas continuam fluidas com qualquer foto.
- **Ao aplicar as alterações**, cada uma é calculada na resolução completa. Fotos grandes levam alguns segundos, então o visualizador mostra uma mensagem e bloqueia os controles nesse tempo.
- **Para economizar tempo e memória**, defina [`maxOutputSize`](../reference/options#maxoutputsize). Um limite como 2000 ou 3000 pixels mantém os documentos legíveis, torna a aplicação das alterações mais rápida e os arquivos menores.

## Tempos medidos {#measurements}

Cada etapa da aplicação das alterações, no worker, em um Pixel 10 Pro com Chrome 156:

| Etapa                             | 2 MP   | 12 MP  | 37,5 MP |
| --------------------------------- | ------ | ------ | ------- |
| Preto e branco                    | 256 ms | 1,5 s  | 4,8 s   |
| Endireitar                        | 251 ms | 1,6 s  | 5,0 s   |
| Exportar para PNG                 | 92 ms  | 378 ms | 979 ms  |
| Exportar para JPEG, qualidade 0,9 | 33 ms  | 142 ms | 525 ms  |

- Mover a régua do Limpar leva cerca de 40 ms no mesmo celular, porque trabalha sobre a pré-visualização de cerca de 2 MP.
- Um computador de mesa com 8 núcleos faz cada etapa cerca de seis vezes mais rápido.
- Com 37,5 MP, o preto e branco precisa de cerca de 340 MB de memória no pico.
- Celulares Android intermediários e iPhones ainda não foram medidos.

## Renderização no servidor

O PaperPic precisa de um navegador. Os componentes Vue e React renderizam um elemento vazio no servidor, como no Nuxt ou no Next.js, e criam o visualizador no navegador. Com o core, crie você mesmo o visualizador no navegador, por exemplo quando o seu componente é montado.

## Navegadores suportados

O PaperPic suporta os navegadores do [Baseline Widely Available](https://web.dev/baseline): os recursos que funcionam em todos os principais navegadores há pelo menos 30 meses. Os pacotes são compilados para esse alvo, ou seja, Chrome e Edge 124, Firefox 125 e Safari 17.5 ou mais recentes, então você não precisa transpilá-los.
