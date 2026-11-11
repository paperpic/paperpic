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

| Token                            | Claro     | Escuro    | Descrição                           |
| -------------------------------- | --------- | --------- | ----------------------------------- |
| `--paperpic-color-accent`        | `#0a84ff` | `#5cb5ff` | Cor de destaque da interface        |
| `--paperpic-color-surface`       | `#fff`    | `#151e2e` | Fundo da interface                  |
| `--paperpic-color-text`          | `#1a263c` | `#f2f5f9` | Texto da interface                  |
| `--paperpic-radius`              | `6px`     | `6px`     | Raio dos cantos da interface        |
| `--paperpic-transition-duration` | `0.2s`    | `0.2s`    | Duração das transições da interface |

## Modo escuro

Os tokens de cor pegam o valor claro ou escuro com `light-dark()`, conforme o `color-scheme` da página. Sem `color-scheme` eles são claros. Com `color-scheme: dark` são escuros, e com `color-scheme: light dark` são escuros quando o sistema prefere um esquema de cores escuro. [Estilos](../guide/styling#dark-mode) mostra como defini-lo.

Para escolher os dois valores de um token, use também `light-dark()`:

```css
:root {
  --paperpic-color-accent: light-dark(#c2410c, #fb923c);
}
```

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

| Classe                    | Elemento                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `paperpic`                | A raiz do visualizador                                                                                                             |
| `paperpic-button`         | Cada botão da barra de ferramentas e da barra de edição                                                                            |
| `paperpic-button-danger`  | Descartar, na pergunta antes de descartar as alterações                                                                            |
| `paperpic-button-primary` | Aplicar, e Concluído em Recortar e Endireitar                                                                                      |
| `paperpic-button-text`    | Os botões da pergunta antes de descartar as alterações                                                                             |
| `paperpic-edit-bar`       | A barra de edição, embaixo                                                                                                         |
| `paperpic-editing`        | A raiz, durante a edição                                                                                                           |
| `paperpic-handle`         | Uma alça de canto de Recortar e Endireitar                                                                                         |
| `paperpic-host`           | O elemento que os componentes Vue e React criam em volta do visualizador                                                           |
| `paperpic-icon`           | O ícone de um botão                                                                                                                |
| `paperpic-status`         | A mensagem para leitores de tela, que também aparece enquanto a imagem carrega ou as alterações são aplicadas, e quando algo falha |
| `paperpic-status-visible` | A mensagem, enquanto aparece no centro do visualizador                                                                             |
| `paperpic-toolbar`        | A barra de ferramentas, à direita                                                                                                  |
| `paperpic-viewport`       | A área que mostra a imagem e recebe o foco do teclado                                                                              |

Os botões mostram o estado com atributos ARIA, que você também pode selecionar:

| Atributo                 | Estado                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `[aria-disabled='true']` | O botão não pode agir agora. Ele mantém o foco do teclado, então não é `disabled`           |
| `[aria-expanded='true']` | Ajustar, enquanto os controles deslizantes dele aparecem                                    |
| `[aria-pressed='true']`  | Um botão ligado, como Limpar, ou Ajustar à largura e Ajustar à altura enquanto estão em uso |

O estado ao passar o ponteiro e esses estados são pintados com `box-shadow`, que os resets globais de botões não tocam. Para mudá-los, sobrescreva também `box-shadow`.

## Controles {#controls}

Cada botão, controle deslizante e alça de canto leva `data-paperpic-control`, com a chave do seu [rótulo](./labels). Selecione-o para estilizar um único controle:

```css
.paperpic-button[data-paperpic-control='edit'] {
  color: var(--paperpic-color-accent);
}
```

| Lugar                       | Valores                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Barra de ferramentas        | `edit`, `zoomIn`, `zoomOut`, `fitWidth`, `fitHeight`, `rotateLeft`, `rotateRight`, `download`         |
| Barra de edição             | `cancel`, `crop`, `perspective`, `rotateLeft`, `flip`, `adjust`, `threshold`, `undo`, `redo`, `apply` |
| Controles deslizantes       | `thresholdSensitivity`, `brightness`, `contrast`                                                      |
| Recortar e Endireitar       | `cancelTool`, `confirm`, `cornerTopLeft`, `cornerTopRight`, `cornerBottomRight`, `cornerBottomLeft`   |
| Pergunta antes de descartar | `keepEditing`, `discard`                                                                              |

`rotateLeft` nomeia dois botões que nunca aparecem ao mesmo tempo: o de um visualizador somente leitura, que gira a exibição, e o da barra de edição, que gira a imagem.
