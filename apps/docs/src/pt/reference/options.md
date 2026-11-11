---
title: Opções
description: Todas as opções do PaperPic, com o tipo, o valor padrão e o que cada uma muda, para o construtor, setOptions() e as props dos componentes Vue e React.
---

# Opções

As opções definem o que o visualizador mostra e o que o usuário pode fazer com ele. Passe-as ao criar o visualizador, ou mude-as depois com [`setOptions()`](./methods#setoptions). Os componentes Vue e React as recebem como props com os mesmos nomes.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Um recibo' })

pic.setOptions({ editable: false })
```

`setOptions()` muda só as opções que você passa, e `undefined` devolve uma opção ao seu valor padrão. Nunca emite `change`.

## Imagem

### `src`

- **Tipo:** `string | Blob`
- **Padrão:** nenhum

A imagem a mostrar: uma URL da mesma origem, ou um `File` ou `Blob` anexado no cliente.

Passar o mesmo valor de novo não recarrega a imagem, então o resultado de uma edição continua na tela. Chame [`reload()`](./methods#reload) para trazer de volta a original. Um valor novo durante a edição descarta as alterações.

### `alt`

- **Tipo:** `string`
- **Padrão:** `''`

Descreve a imagem para leitores de tela.

## Interface

### `editable`

- **Tipo:** `boolean`
- **Padrão:** `true`

Se o usuário pode editar a imagem. Com `false`, é um visualizador somente leitura, e a barra de ferramentas ganha botões para girar a imagem. Esse giro muda só a exibição. Mudar esta opção durante a edição descarta as alterações.

### `toolbar`

- **Tipo:** `boolean`
- **Padrão:** `true`

Se a barra de ferramentas e a barra de edição integradas aparecem. Sem elas, crie seus próprios controles com os [métodos](./methods).

### `tools`

- **Tipo:** `readonly ToolId[]`
- **Padrão:** todas as ferramentas

As ferramentas que a barra de edição oferece. Elas mantêm a ordem desta tabela, seja qual for a ordem do array.

| Id              | Botão                                |
| --------------- | ------------------------------------ |
| `'crop'`        | Recortar                             |
| `'perspective'` | Endireitar                           |
| `'rotate'`      | Girar para a esquerda                |
| `'flip'`        | Espelhar                             |
| `'adjust'`      | Ajustar, para o brilho e o contraste |
| `'threshold'`   | Limpar                               |

### `wheelZoom`

- **Tipo:** `boolean`
- **Padrão:** `true`

Se a roda do mouse dá zoom na imagem. Desative quando o visualizador estiver numa página longa, para que a roda role a página.

### `download`

- **Tipo:** `boolean`
- **Padrão:** `false`

Se a barra de ferramentas tem um botão que salva a imagem na tela: o resultado do último Aplicar, ou então a imagem original. O botão fica oculto durante a edição. O evento [`download`](./events#download) permite salvar o arquivo de outro jeito.

### `labels`

- **Tipo:** `Partial<PaperPicLabels>`
- **Padrão:** os textos em inglês

Substitui qualquer texto que o componente mostra ou anuncia. [Rótulos](./labels) lista todas as chaves.

### `icons`

- **Tipo:** `Partial<PaperPicIcons>`
- **Padrão:** os ícones incluídos

Substitui qualquer ícone pela sua própria marcação de um único elemento, como um `<svg>`. A marcação entra na página como HTML, então passe apenas marcação confiável. Uma string vazia deixa sem ícone os botões desse ícone. [Estilos](../guide/styling#icons) mostra um exemplo.

Cada chave nomeia um ícone, e alguns ícones aparecem em dois botões:

| Chave            | Botão                                                                             |
| ---------------- | --------------------------------------------------------------------------------- |
| `adjust`         | Ajustar                                                                           |
| `apply`          | Aplicar, e Concluído em Recortar e Endireitar                                     |
| `cancel`         | Cancelar, e Cancelar esta ferramenta                                              |
| `crop`           | Recortar                                                                          |
| `download`       | Baixar                                                                            |
| `edit`           | Editar                                                                            |
| `fitHeight`      | Ajustar à altura                                                                  |
| `fitWidth`       | Ajustar à largura                                                                 |
| `flip`           | Espelhar                                                                          |
| `perspective`    | Endireitar                                                                        |
| `redo`           | Refazer                                                                           |
| `rotateDocument` | Girar para a esquerda, na barra de edição                                         |
| `rotateLeft`     | Girar para a esquerda, na barra de ferramentas de um visualizador somente leitura |
| `rotateRight`    | Girar para a direita, na barra de ferramentas de um visualizador somente leitura  |
| `threshold`      | Limpar                                                                            |
| `undo`           | Desfazer                                                                          |
| `zoomIn`         | Ampliar                                                                           |
| `zoomOut`        | Reduzir                                                                           |

## Resultado

### `output`

- **Tipo:** `{ type?: string, quality?: number }`
- **Padrão:** o formato da imagem original

O formato da imagem editada. `type` é `'image/jpeg'`, `'image/png'` ou `'image/webp'`, e `quality` vai de 0 a 1 para JPEG e WebP, com `0.92` como padrão.

Sem `type`, uma imagem limpa sai em PNG, porque o JPEG estragaria as bordas nítidas dela, e qualquer outra imagem mantém o formato da original. Um formato que o navegador não consegue codificar resulta em PNG.

### `maxOutputSize`

- **Tipo:** `number`
- **Padrão:** a resolução completa

O lado mais longo da imagem editada, em pixels. Um resultado maior é reduzido.

### `filename`

- **Tipo:** `string`
- **Padrão:** o nome da imagem original

O nome do arquivo salvo. A extensão segue o formato da imagem, então um `receipt.jpg` limpo é salvo como `receipt.png`. Quando a original não tem nome, como um `Blob`, o arquivo se chama `image`.

## Ferramentas

### `aspectRatio`

- **Tipo:** `number`
- **Padrão:** estimadas

As proporções reais do documento, como largura dividida pela altura, por exemplo `210 / 297` para uma folha A4. Endireitar dá essas proporções ao resultado. Sem elas, ele as estima a partir da foto.

### `softness`

- **Tipo:** `number`, de 0 a 1
- **Padrão:** `0.25`

Quanto cinza Limpar mantém nas bordas das letras, o que as deixa mais fáceis de ler. Use `0` para um preto e branco estrito, que gera arquivos menores mas quebra traços finos.
