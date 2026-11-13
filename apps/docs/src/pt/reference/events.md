---
title: Eventos
description: Os eventos do PaperPic e o que cada um traz, load, error, change, apply e download, e como escutá-los em JavaScript, Vue e React.
---

# Eventos

Os eventos contam ao seu código o que acontece no visualizador. Escute-os com [`on()`](./methods#on). Em Vue, são eventos do componente, como `@apply`, e em React são props, como `onApply`.

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

A imagem foi carregada e está na tela. `width` e `height` são o tamanho dela em pixels.

## `error`

- **Dados:** `{ error: Error }`

Não foi possível carregar a imagem ou aplicar as alterações. Depois de um Aplicar que falhou, a edição continua aberta.

## `change`

- **Dados:** [`PaperPicState`](./state)

O usuário mudou a visualização ou a edição, por exemplo ao dar zoom, abrir uma ferramenta ou desfazer. Também avisa o início do Aplicar, com `busy: true`. `setOptions()` e as props dos componentes nunca o emitem.

## `apply`

- **Dados:** [`ExportedImage`](./types#exportedimage)

O usuário aplicou as alterações, e o resultado já está na tela. `blob` contém a imagem no formato `type`, que [`output`](./options#output) escolhe.

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
