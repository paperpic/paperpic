---
title: Accesibilidad
description: Cómo funciona PaperPic con el teclado, los lectores de pantalla y las pantallas táctiles, qué preferencias respeta y qué tiene que aportar tu app.
---

# Accesibilidad

La gente lee y arregla documentos con ratón, con el dedo, con el teclado o con un lector de pantalla. PaperPic apunta a WCAG 2.2 AA, y casi todo el trabajo viene hecho. Esta página explica qué hace y qué tiene que añadir tu app.

## Qué aporta tu app

- **Una descripción.** Pasa [`alt`](../reference/options#alt), como «Tique del 5 de noviembre». Los lectores de pantalla lo leen como nombre de la imagen.
- **Textos en el idioma del usuario.** Los lectores de pantalla anuncian los botones y los cambios, así que tradúcelos con [`labels`](./labels).
- **Tus propios controles, si los hay.** Con `toolbar: false`, los botones que crees sustituyen a los integrados, y necesitan sus propios nombres y soporte de teclado.
- **Un foco visible.** Evita que tu CSS oculte el contorno de foco del visor.

## Teclado

Con el foco en el visor:

| Tecla                     | Acción                                                         |
| ------------------------- | -------------------------------------------------------------- |
| `+` y `-`                 | Acercar y alejar                                               |
| Flechas                   | Desplazar                                                      |
| `0`                       | Ajustar la imagen entera                                       |
| `Ctrl+Z`                  | Deshacer                                                       |
| `Ctrl+Shift+Z` o `Ctrl+Y` | Rehacer                                                        |
| `Enter`                   | Confirmar la herramienta abierta, o si no, aplicar los cambios |
| `Esc`                     | Cerrar la herramienta abierta, o si no, cancelar los cambios   |

En macOS, `Cmd` funciona como `Ctrl`. Antes de cancelar los cambios, `Esc` pide confirmación. Con `toolbar: false`, se los deja a tu interfaz.

- **Barra de herramientas y barra de edición.** Tab llega a cada barra, y dentro de ella las flechas pasan de un botón a otro, con `Inicio` y `Fin` para el primero y el último.
- **Tiradores de esquina.** Con Recortar o Enderezar abierta, Tab pasa de un tirador a otro, y las flechas mueven el que tiene el foco 1 píxel de pantalla, o 10 con Mayús.
- **Controles deslizantes.** Las flechas mueven los controles de Ajustar y de Limpiar.

## Lectores de pantalla

- La imagen tiene el rol de imagen, con `alt` como nombre.
- La barra de herramientas y la barra de edición tienen nombre propio, como «Controles de la imagen» y «Controles de edición».
- Un anuncio informa de cada cambio que el usuario no puede ver solo con el foco: el nivel de zoom, el inicio del modo de edición, la posición de una esquina movida, el valor de un control deslizante y el resultado de Aplicar.

## Pantallas táctiles

- Con `pointer: coarse`, los botones y los tiradores de esquina miden al menos 44 píxeles.
- Mientras un dedo arrastra una esquina, una lupa muestra la zona que tapa.
- Mientras la imagen está ajustada, un dedo desplaza la página, así que el visor no deja a nadie atrapado dentro. Con zoom, desplaza la imagen.

## Preferencias

- **Menos movimiento.** Con `prefers-reduced-motion: reduce`, los botones cambian de estado sin transiciones.
- **Colores forzados.** En el contraste alto de Windows y otros modos de colores forzados, los botones pulsados y las acciones principales conservan un contorno visible.
- **Modo oscuro.** Los colores siguen `prefers-color-scheme`. Consulta [Estilos](./styling#dark-mode).
