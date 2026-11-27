---
title: Solución de problemas
description: Qué hacer cuando el visor de PaperPic no tiene altura ni estilos, Tailwind CSS lo cambia, una imagen no carga o no se puede editar, la página se congela al aplicar o una foto grande falla.
---

# Solución de problemas

Casi todos los problemas con PaperPic vienen de su configuración, y no de la imagen. Busca el síntoma y, debajo, encontrarás la solución.

## El visor es una franja fina, o no se ve {#no-height}

El visor llena su contenedor, y un contenedor sin altura se queda en la altura mínima del visor, 16rem. Da al contenedor una altura, como `height: 480px`, o un sitio en un layout flex o grid que se la dé. [Estilos](./styling) muestra las dos opciones.

## Los botones no tienen estilo, y la consola avisa {#no-stylesheet}

La consola dice `PaperPic: the stylesheet is missing, so the viewer has no layout.` Importa la hoja de estilos una vez en tu app: `@paperpic/core/style.css`, o el `style.css` de `@paperpic/vue` o de `@paperpic/react`.

## Tailwind CSS quita los bordes y el padding del visor {#tailwind}

El reset de Tailwind CSS 4 gana a la hoja de estilos de PaperPic cuando las capas de la cascada van en el orden equivocado. Nombra las capas antes de importar las dos, como muestra [Estilos](./styling#tailwind).

## La imagen se ve, pero editarla falla {#other-origin}

El [`error`](../reference/events#error) dice que la imagen viene de otro origen. Los navegadores no dejan a PaperPic leer los píxeles de esa imagen. Descárgala tú y pasa el `Blob`, como muestra [Cargar imágenes](./loading#fetch).

## La imagen no carga {#load-error}

El visor muestra que la imagen no se ha podido cargar, y `error` llega con `phase: 'load'`. Comprueba que la URL existe y que el navegador abre el formato: HEIC solo se abre en Safari, y un SVG necesita los atributos `width` y `height`. [Cargar imágenes](./loading#formats) enumera los formatos.

## La página se congela mientras se aplica {#worker}

El worker no ha arrancado, así que la edición se hace en el hilo principal. Sigue funcionando, pero las fotos grandes congelan la página un momento. Las causas habituales son:

- Una Content Security Policy sin `worker-src 'self'`, o una que exige Trusted Types sin una política `default`. [Rendimiento y compatibilidad](./performance) enumera lo que hay que permitir.
- El paquete cargado desde un CDN, de un origen distinto al de la página. Los navegadores solo arrancan un worker del mismo origen que la página.

El panel de red del navegador muestra si la página ha pedido el archivo del worker, cuyo nombre empieza por `worker`.

## Fallo al aplicar con una foto grande {#too-large}

El `error` dice `The browser could not read an image of …`, o `could not save an image of …`. Los navegadores limitan el tamaño de un canvas, y Safari en iOS más que ninguno. Pon [`maxOutputSize`](../reference/options#maxoutputsize), por ejemplo a 3000 píxeles, que mantiene legibles los documentos.

## La rueda hace zoom en la imagen en vez de hacer scroll en la página {#wheel}

Pon [`wheelZoom: false`](../reference/options#wheelzoom). Los botones, el teclado y el pellizco siguen haciendo zoom.
