---
title: Tokens CSS
description: As propriedades personalizadas CSS que estilizam o PaperPic, com os valores claros e escuros, além da folha de estilo, da camada de cascata, das classes públicas e dos nomes dos controles.
---

# Tokens CSS

Os tokens são propriedades personalizadas CSS que mudam a aparência do componente sem sobrescrever as regras dele. Defina-os em `:root`, num ancestral do visualizador ou em `.paperpic`:

```css
:root {
  --paperpic-color-accent: #c2410c;
  --paperpic-radius: 0;
}
```

| Token                            | Claro              | Escuro             | Descrição                                                                               |
| -------------------------------- | ------------------ | ------------------ | --------------------------------------------------------------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff`          | `#5cb5ff`          | Cor de destaque da interface                                                            |
| `--paperpic-color-dim`           | `rgb(0 0 0 / 50%)` | `rgb(0 0 0 / 50%)` | Escurece a imagem em volta de uma seleção                                               |
| `--paperpic-color-line`          | `#fff`             | `#fff`             | As linhas sobre a imagem: o contorno de uma seleção, as alças de canto e a cruz da lupa |
| `--paperpic-color-line-shadow`   | `rgb(0 0 0 / 60%)` | `rgb(0 0 0 / 60%)` | A sombra sob cada linha, para que ela apareça em qualquer imagem                        |
| `--paperpic-color-surface`       | `#fff`             | `#151e2e`          | Fundo da interface                                                                      |
| `--paperpic-color-text`          | `#1a263c`          | `#f2f5f9`          | Texto da interface                                                                      |
| `--paperpic-radius`              | `6px`              | `6px`              | Raio dos cantos da interface                                                            |
| `--paperpic-transition-duration` | `0.2s`             | `0.2s`             | Duração das transições da interface                                                     |

## Modo escuro

Os tokens de cor pegam o valor claro ou escuro com `light-dark()`, conforme o `color-scheme` da página. Sem `color-scheme` eles são claros. Com `color-scheme: dark` são escuros, e com `color-scheme: light dark` são escuros quando o sistema prefere um esquema de cores escuro. [Estilos](../guide/styling#dark-mode) mostra como defini-lo.

Para escolher os dois valores de um token, use também `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

As cores pintadas sobre a imagem, `--paperpic-color-dim`, `--paperpic-color-line` e `--paperpic-color-line-shadow`, têm um só valor para os dois modos, porque ficam sobre a foto e não sobre a interface. Uma linha e sua sombra andam juntas: com uma linha escura, escolha uma sombra clara.

## Folha de estilo

Cada pacote traz uma folha de estilo. Importe-a uma vez no seu app:

:::tabs key:framework
== JavaScript

```ts
import '@paperpic/core/style.css'
```

== Vue

```ts
import '@paperpic/vue/style.css'
```

== React

```ts
import '@paperpic/react/style.css'
```

:::

As regras dela ficam na camada de cascata `paperpic`, então qualquer CSS seu fora de uma camada as sobrescreve, seja qual for a especificidade. Isso inclui resets globais, como uma regra em `button`. Com o Tailwind CSS, nomeie a ordem das camadas, como mostra [Estilos](../guide/styling#tailwind).

## Classes {#classes}

Estas classes são públicas: os nomes delas, e os elementos que marcam, ficam estáveis entre versões. As outras classes do componente sustentam a disposição dele e podem mudar em qualquer versão.

| Classe                    | Elemento                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `paperpic`                | A raiz do visualizador                                                                                                                |
| `paperpic-button`         | Cada botão da barra de ferramentas e da barra de edição                                                                               |
| `paperpic-button-danger`  | Descartar, na pergunta antes de descartar as alterações                                                                               |
| `paperpic-button-primary` | Aplicar, e Concluído em cada ferramenta                                                                                               |
| `paperpic-button-text`    | Os botões da pergunta antes de descartar as alterações                                                                                |
| `paperpic-edit-bar`       | A barra de edição, um cartão embaixo durante a edição                                                                                 |
| `paperpic-editing`        | A raiz, durante a edição                                                                                                              |
| `paperpic-handle`         | Uma alça de canto de Recortar e Endireitar                                                                                            |
| `paperpic-host`           | O elemento que os componentes Vue e React criam em volta do visualizador                                                              |
| `paperpic-icon`           | O ícone de um botão                                                                                                                   |
| `paperpic-status`         | A mensagem que aparece, e que os leitores de tela leem, enquanto a imagem carrega ou as alterações são aplicadas, e quando algo falha |
| `paperpic-status-visible` | A mensagem, enquanto aparece no centro do visualizador                                                                                |
| `paperpic-toolbar`        | A barra de ferramentas, à direita, escondida durante a edição                                                                         |
| `paperpic-viewport`       | A área que mostra a imagem e recebe o foco do teclado                                                                                 |

Os botões mostram o estado com atributos ARIA, que você também pode selecionar:

| Atributo                 | Estado                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | O botão não pode agir agora. Ele mantém o foco do teclado, então não é `disabled`                 |
| `[aria-pressed='true']`  | O encaixe em uso, Ajustar à largura ou Ajustar à altura, ou a escolha de Ajustar que a régua muda |

O estado ao passar o ponteiro e esses estados são pintados com `box-shadow`, que os resets globais de botões não tocam. Para mudá-los, sobrescreva também `box-shadow`.

## Estados {#states}

A raiz, `.paperpic`, leva o estado do visualizador em atributos data, para que o CSS possa acompanhá-lo:

| Atributo               | Valores                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `data-paperpic-status` | `empty`, `loading`, `ready` ou `error`, como `status` no [estado](./state)                     |
| `data-paperpic-mode`   | `view` ou `edit`                                                                               |
| `data-paperpic-tool`   | O id da ferramenta aberta, como `crop`. Ele não existe enquanto nenhuma ferramenta está aberta |

```css
.paperpic[data-paperpic-status='error'] .paperpic-status-visible {
  color: #b91c1c;
}
```

## Controles {#controls}

Cada botão, régua e alça de canto leva `data-paperpic-control`, com a chave do seu [rótulo](./labels). Selecione-o para estilizar um único controle:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Lugar                          | Valores                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Barra de ferramentas           | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`                                                                |
| Barra de edição                | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `finish`, `redact`, `undo`, `redo`, `apply`                                                 |
| Ajustar e Limpar               | `brightness` e `contrast`, as escolhas e as réguas delas, `finishOriginal`, `finishGray` e `finishMono`, os acabamentos, e `finishSensitivity`, a régua dele |
| Cada ferramenta                | `cancelTool`, `confirm`                                                                                                                                      |
| Recortar, Endireitar e Ocultar | `zoomIn`, `zoomOut`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`                                                              |
| Endireitar                     | `paperAuto`, `paperA4`, `paperLetter`, `paperCard`                                                                                                           |
| Ocultar                        | `redactArea`, `redactTurn`, `redactBlack`, `redactWhite`                                                                                                     |
| Pergunta antes de descartar    | `keepEditing`, `discard`                                                                                                                                     |

`rotateLeft` nomeia dois botões que nunca aparecem ao mesmo tempo: o de um visualizador somente leitura, que gira a exibição, e o da barra de edição, que gira a imagem. O mesmo vale para `zoomIn` e `zoomOut`, na barra de ferramentas e num painel. `brightness` e `contrast` nomeiam uma escolha e a régua dela, que aparecem juntas: adicione `button` ou `input` ao seletor para distingui-las.
