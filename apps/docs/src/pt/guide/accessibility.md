---
title: Acessibilidade
description: Como o PaperPic funciona com teclado, leitores de tela e telas sensíveis ao toque, que preferências ele respeita e o que o seu app precisa fornecer.
---

# Acessibilidade

As pessoas leem e corrigem documentos com o mouse, o dedo, o teclado ou um leitor de tela. O PaperPic mira as WCAG 2.2 AA, e quase todo o trabalho já vem pronto. Esta página mostra o que ele faz e o que o seu app precisa acrescentar.

## O que o seu app fornece

- **Uma descrição.** Passe [`alt`](../reference/options#alt), como "Recibo de 5 de novembro". Os leitores de tela o leem como nome da imagem.
- **Textos no idioma do usuário.** Os leitores de tela anunciam os botões e as mudanças, então traduza-os com [`labels`](./labels).
- **Seus próprios controles, se houver.** Com `toolbar: false`, os botões que você cria substituem os integrados, e precisam de nomes próprios e suporte a teclado.
- **Um foco visível.** Evite que o seu CSS esconda o contorno de foco do visualizador.

## Teclado

Com o foco no visualizador:

| Tecla                      | Ação                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `+` e `-`                  | Ampliar e reduzir                                             |
| Setas                      | Mover                                                         |
| `0`                        | Ajustar a imagem inteira                                      |
| `Ctrl+Z`                   | Desfazer                                                      |
| `Ctrl+Shift+Z` ou `Ctrl+Y` | Refazer                                                       |
| `Enter`                    | Confirmar a ferramenta aberta, ou então aplicar as alterações |
| `Esc`                      | Fechar a ferramenta aberta, ou então cancelar as alterações   |

No macOS, `Cmd` funciona como `Ctrl`. Antes de cancelar as alterações, `Esc` pede confirmação. Com `toolbar: false`, ele as deixa para a sua interface.

- **Barra de ferramentas e barra de edição.** Tab chega a cada barra, e dentro dela as setas passam de um botão para outro, com `Home` e `End` para o primeiro e o último.
- **Alças de canto.** Com Recortar ou Endireitar aberto, Tab passa de uma alça para outra, e as setas movem a que tem foco 1 pixel da tela, ou 10 com Shift.
- **Controles deslizantes.** As setas movem os controles do Ajustar e do Limpar.

## Leitores de tela

- A imagem tem o papel de imagem, com `alt` como nome. Sem `alt`, os leitores de tela a ignoram.
- A barra de ferramentas e a barra de edição têm nome próprio, como "Controles da imagem" e "Controles de edição".
- Um anúncio informa cada mudança que o usuário não percebe só pelo foco: o nível de zoom, o início do modo de edição, a posição de um canto movido, o valor de um controle deslizante e o resultado do Aplicar.

## Telas sensíveis ao toque

- Com `pointer: coarse`, botões e alças de canto medem pelo menos 44 pixels.
- Enquanto um dedo arrasta um canto, uma lupa mostra a área embaixo dele.
- Enquanto a imagem está ajustada, um dedo rola a página, então o visualizador não prende ninguém. Com zoom, ele move a imagem.

## Preferências

- **Movimento reduzido.** Com `prefers-reduced-motion: reduce`, os botões mudam de estado sem transições.
- **Cores forçadas.** No alto contraste do Windows e em outros modos de cores forçadas, botões pressionados e as ações principais mantêm um contorno visível.
- **Modo escuro.** As cores seguem o `color-scheme` da sua página, que pode seguir o sistema. Veja [Estilos](./styling#dark-mode).
