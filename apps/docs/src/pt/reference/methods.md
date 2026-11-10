---
title: Métodos
description: Todos os métodos da classe PaperPic, para controlar o visualizador pelo seu código, como dar zoom, ajustar, girar, editar, aplicar, baixar e recarregar.
---

# Métodos

Os métodos controlam o visualizador pelo seu código, por exemplo a partir de botões seus com [`toolbar: false`](./options#toolbar). Em Vue e React, a ref do componente dá acesso ao visualizador: veja [Vue](./vue) e [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Criar e destruir

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Cria o visualizador dentro de `container`, que ele preenche. Defina uma altura para o contêiner, senão o visualizador fica na altura mínima. [Opções](./options) explica o que `options` aceita.

Lança um `TypeError` se `container` não for um elemento. Crie o visualizador quando o elemento já existir, por exemplo na montagem.

### `destroy()`

```ts
function destroy(): void
```

Remove o visualizador e libera tudo o que ele ocupa, como o worker e a memória das imagens. Chamá-lo duas vezes não causa problemas.

## Opções e estado

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Muda as opções que você passa e mantém as outras. `undefined` devolve uma opção ao seu valor padrão. Nunca emite `change`, então vínculos bidirecionais não entram em loop.

### `getState()`

```ts
function getState(): PaperPicState
```

Retorna o que o visualizador está mostrando, como o zoom, o modo e se há alterações para aplicar. [Estado](./state) descreve cada campo.

### `on()`

```ts
function on(name: keyof PaperPicEvents, listener: (payload) => void): () => void
```

Escuta um evento e retorna uma função que para de escutar. [Eventos](./events) descreve cada evento.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

## Visualização

### `zoomIn()`

```ts
function zoomIn(): void
```

Amplia um passo, em torno do centro do visualizador.

### `zoomOut()`

```ts
function zoomOut(): void
```

Reduz um passo, em torno do centro do visualizador.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: { x: number, y: number }): void
```

Define o zoom, em que `1` mostra um pixel da imagem por pixel da tela. `point` fica no lugar: ele é dado em pixels CSS a partir do canto superior esquerdo do visualizador, e por padrão é o centro dele.

O zoom vai do ajuste da imagem inteira, ou `1` se for menor, até `8`. Um valor fora desse intervalo é limitado.

### `fit()`

```ts
function fit(fit: 'image' | 'width' | 'height'): void
```

Ajusta ao visualizador a imagem inteira, a largura ou a altura dela.

## Edição

### `edit()`

```ts
function edit(): void
```

Começa a edição. Não faz nada se a imagem não estiver pronta ou se [`editable`](./options#editable) for `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Gira a imagem um quarto de volta: no sentido horário com `1`, o padrão, e no anti-horário com `-1`. Durante a edição, é uma alteração que [`apply()`](#apply) torna permanente. Num visualizador somente leitura, muda só a exibição. Nos outros casos, não faz nada.

### `flip()`

```ts
function flip(): void
```

Espelha a imagem da esquerda para a direita como ela aparece, então depois de um quarto de volta ainda espelha da esquerda para a direita. Para virar a imagem de cabeça para baixo, espelhe-a e gire-a duas vezes. É uma alteração, e não faz nada fora do modo de edição ou com uma ferramenta aberta.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Abre Recortar, com `'crop'`, ou Endireitar, com `'perspective'`: as ferramentas com seleção própria. A ferramenta fica aberta até [`confirmTool()`](#confirmtool) ou [`cancelTool()`](#canceltool), e enquanto isso as outras alterações, Desfazer, Refazer e Aplicar não fazem nada. Não faz nada fora do modo de edição.

### `confirmTool()`

```ts
function confirmTool(): void
```

Fecha a ferramenta aberta e adiciona a seleção dela às alterações, como faz o `Enter`.

### `cancelTool()`

```ts
function cancelTool(): void
```

Fecha a ferramenta aberta e descarta a seleção dela, como faz o `Esc`.

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Liga ou desliga Limpar, ou muda a sensibilidade, de 0 a 1. Limpar sempre vem depois das outras alterações. Não faz nada fora do modo de edição ou com uma ferramenta aberta.

Lança um `RangeError` se `sensitivity` não estiver entre 0 e 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Muda o brilho ou o contraste, cada um de -1 a 1, em que 0 deixa a imagem como está. Eles vêm depois das outras alterações. Não faz nada fora do modo de edição, com uma ferramenta aberta ou com Limpar ligado, porque um documento limpo tem tons próprios.

Lança um `RangeError` se um valor não estiver entre -1 e 1.

### `undo()`

```ts
function undo(): void
```

Desfaz a última alteração.

### `redo()`

```ts
function redo(): void
```

Traz de volta a última alteração desfeita.

### `apply()`

```ts
function apply(): Promise<void>
```

Aplica as alterações na resolução completa, ou em [`maxOutputSize`](./options#maxoutputsize). O resultado vira a imagem na tela, o histórico se esvazia, o visualizador volta ao modo de visualização, e o evento [`apply`](./events#apply) traz o resultado. Aplicar não pode ser interrompido, e bloqueia os controles enquanto roda.

Se falhar, o evento [`error`](./events#error) informa, e a edição continua aberta.

### `cancel()`

```ts
function cancel(): void
```

Descarta as alterações e volta ao modo de visualização. Não pergunta antes: quem pergunta são o botão Cancelar integrado e o `Esc`.

## Imagem

### `download()`

```ts
function download(): void
```

Salva a imagem na tela como arquivo: o resultado do último Aplicar, ou então a imagem original. Funciona sem a opção [`download`](./options#download), que só mostra um botão. O evento [`download`](./events#download) vem antes e pode impedir o salvamento. Não faz nada durante a edição, porque as alterações ainda não foram aplicadas.

### `reload()`

```ts
function reload(): void
```

Carrega de novo o [`src`](./options#src) atual, o que traz de volta a original depois de um Aplicar.
