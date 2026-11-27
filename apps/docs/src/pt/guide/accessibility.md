---
title: Acessibilidade
description: Como o PaperPic funciona com teclado, leitores de tela e telas sensíveis ao toque, que preferências ele respeita e o que o seu app precisa fornecer.
---

# Acessibilidade

As pessoas leem e corrigem documentos com o mouse, o dedo, o teclado ou um leitor de tela. O PaperPic mira as WCAG 2.2 AA, e quase todo o trabalho já vem pronto. Esta página mostra o que ele faz e o que o seu app precisa acrescentar.

## O que o seu app precisa fazer

- **Uma descrição.** Passe [`alt`](../reference/options#alt), como "Recibo de 5 de novembro". Os leitores de tela o leem como nome da imagem.
- **Textos no idioma do usuário.** Os leitores de tela anunciam os botões e as mudanças, então traduza-os com [`labels`](./labels).
- **Seus próprios controles, se houver.** Com `toolbar: false`, os botões que você cria substituem os integrados, e precisam de nomes próprios e suporte a teclado.
- **Um foco visível.** Evite que o seu CSS esconda o contorno de foco do visualizador.

## Teclado {#keyboard}

Com o foco dentro do visualizador:

| Tecla                      | Ação                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `+` e `-`                  | Ampliar e reduzir                                                                        |
| Setas                      | Mover                                                                                    |
| `0`                        | Encaixar a imagem inteira                                                                |
| `Ctrl+Z`                   | Desfazer                                                                                 |
| `Ctrl+Shift+Z` ou `Ctrl+Y` | Refazer                                                                                  |
| `Enter`                    | Confirmar a ferramenta aberta, ou então aplicar as alterações                            |
| `Esc`                      | Soltar um canto selecionado, fechar a ferramenta aberta, ou então cancelar as alterações |

No macOS, `Cmd` funciona como `Ctrl`. Com o foco num botão, `Enter` pressiona esse botão. Antes de cancelar as alterações, `Esc` pede confirmação. Com `toolbar: false`, `Esc` continua fechando uma ferramenta, mas não cancela a edição: quem decide é a sua interface.

- **Barra de ferramentas e barra de edição.** Tab chega a cada barra, e dentro dela as setas passam de um botão para outro, com `Home` e `End` para o primeiro e o último.
- **Alças de canto.** Com Recortar ou Endireitar aberto, Tab passa de uma alça para outra, e as setas movem a que tem foco 1 pixel da tela, ou 10 com Shift. Os leitores de tela ouvem essas teclas, e que Enter conclui, na descrição de cada alça.
- **Réguas.** As réguas do Ajustar e do Limpar são controles deslizantes nativos: as setas, `Page Up`, `Page Down`, `Home` e `End` as movem. `Enter` mantém o valor, como o botão Concluído, e `Esc` fecha a ferramenta sem ele.

## Leitores de tela

- A imagem tem o papel de imagem, com `alt` como nome. Sem `alt`, os leitores de tela a ignoram.
- A barra de ferramentas e a barra de edição têm nome próprio, como "Controles da imagem" e "Controles de edição".
- Um anúncio informa o que o usuário não percebe só pelo foco: o carregamento da imagem, o nível de zoom, o início do modo de edição, um documento que Endireitar encontra, um canto selecionado e a posição de um canto movido, o valor de uma régua, o resultado ao aplicar as alterações e qualquer falha.
- Os acabamentos do Limpar são botões que dizem se estão pressionados. Uma ferramenta em uso, que um ponto marca na tela, é descrita como “Em uso”. Em preto e branco, Ajustar é descrito com o motivo de estar desativado.

## Telas sensíveis ao toque

- Com `any-pointer: coarse`, botões e alças de canto medem pelo menos 44 pixels. Qualquer tela sensível ao toque atende a isso, também em um notebook com trackpad.
- Enquanto um dedo arrasta um canto, uma lupa mostra a área embaixo dele.
- Um canto também se move sem arrastar: pressione a alça dele e depois toque onde ele vai. Também funciona com mouse.
- Enquanto a imagem está encaixada, um dedo rola a página, então o visualizador não prende ninguém. Com zoom, ele move a imagem.

## Preferências

- **Movimento reduzido.** Com `prefers-reduced-motion: reduce`, os botões mudam de estado sem transições, e os cantos vão na hora para o documento que Endireitar encontra, sem deslizar.
- **Cores forçadas.** No alto contraste do Windows e em outros modos de cores forçadas, botões pressionados e as ações principais mantêm um contorno visível.
- **Modo escuro.** As cores seguem o `color-scheme` da sua página, que pode seguir o sistema. Veja [Estilos](./styling#dark-mode).
