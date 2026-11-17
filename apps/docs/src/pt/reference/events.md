---
title: Eventos
description: Os eventos do PaperPic (load, error, change, apply e download), os dados de cada um e como escutá-los em JavaScript, Vue e React.
---

# Eventos

Os eventos contam ao seu código o que acontece no visualizador. Escute-os com [`on()`](./methods#on). Em Vue, são eventos do componente, como `@apply`, e em React são props, como `onApply`. Se uma função que escuta lança um erro, o visualizador segue em frente: a página recebe o erro como qualquer erro não capturado, e as outras funções são executadas mesmo assim.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Dados:** [`Size`](./types#size)

A imagem foi carregada e está na tela. `width` e `height` são o tamanho dela em pixels. É emitido a cada carregamento de um `src`, também com [`reload()`](./methods#reload), mas não depois do Aplicar, cujo resultado chega com [`apply`](#apply).

## `error`

- **Dados:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Algo falhou, e `phase` diz o quê:

- `'load'`: não foi possível carregar a imagem.
- `'preview'`: não foi possível mostrar uma edição, como quando a imagem é grande demais para o navegador. A edição continua aberta.
- `'apply'`: não foi possível aplicar as alterações. A edição continua aberta.

## `change`

- **Dados:** [`PaperPicState`](./state)

O estado mudou, pelo usuário ou por um método, por exemplo ao dar zoom, abrir uma ferramenta ou desfazer. Envia o estado completo, o mesmo que [`getState()`](./methods#getstate) retornaria naquele momento. O Aplicar o emite duas vezes: ao começar, com `busy: true`, e ao terminar bem, depois de [`apply`](#apply).

Estas coisas mudam o estado sem emitir `change`:

- Carregar uma imagem, o que [`load`](#load) ou [`error`](#error) avisa.
- Um Aplicar que falha, o que [`error`](#error) avisa. `busy` volta a ser `false`.
- `setOptions()` e as props dos componentes, para que vínculos bidirecionais não entrem em loop.
- Uma mudança de tamanho do visualizador, que muda `zoom` enquanto há um encaixe em vigor.

Mover a imagem não emite nada, porque o estado não guarda a posição dela. [Estado](./state#in-step) mostra como sincronizar seus próprios controles.

## `apply`

- **Dados:** [`ExportedImage`](./types#exportedimage)

O Aplicar terminou, pelo botão, `Enter` ou [`apply()`](./methods#apply), e o resultado já está na tela. `blob` contém a imagem no formato `type`, que [`output`](./options#output) escolhe.

## `download`

- **Dados:** [`PaperPicDownload`](./types#paperpicdownload)

A imagem está prestes a ser salva, pelo botão de download ou por [`download()`](./methods#download). `source` é a imagem na tela: o resultado do último Aplicar, ou então o `src`. `filename` é o nome do arquivo.

Chame `preventDefault()` para que o navegador não salve o arquivo, por exemplo para salvá-lo de outro jeito:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
