---
title: Rendimiento y compatibilidad
description: Dónde hace PaperPic su trabajo, qué necesitan los empaquetadores, la Content Security Policy y el renderizado en el servidor, cómo trata las fotos grandes de móvil y qué navegadores admite.
---

# Rendimiento y compatibilidad

Las fotos de móvil tienen 12 megapíxeles o más, y editarlas cuesta trabajo de verdad. Esta página explica dónde se hace ese trabajo, qué necesitan tu build y tu servidor, y qué navegadores admite PaperPic.

## Un Web Worker hace el trabajo

Limpiar y Enderezar tardan más de un segundo con una foto de 12 megapíxeles en un móvil. En el hilo principal, la página se congelaría todo ese tiempo. PaperPic los ejecuta en un Web Worker, así que la página sigue respondiendo mientras Aplicar está en marcha.

El worker viene dentro del paquete y arranca con el estándar `new Worker(new URL(…, import.meta.url))`, que empaquetadores como Vite y webpack 5 detectan solos, sin configuración. Si el worker no puede arrancar, la edición se hace en el hilo principal: sigue funcionando, pero la página puede congelarse un momento con imágenes grandes.

## Content Security Policy

Con una Content Security Policy, permite:

- `worker-src 'self'`, para el worker.
- `img-src blob:`, porque el visor muestra los archivos adjuntos y los resultados de Aplicar con URLs `blob:`.

## Fotos grandes

- **Durante la edición**, la vista previa trabaja sobre una copia de unos 2 megapíxeles, así que las reglas y las herramientas van fluidas con cualquier foto.
- **Al aplicar**, cada cambio se calcula a resolución completa. Las fotos grandes tardan unos segundos, así que el visor muestra un mensaje y bloquea los controles mientras tanto.
- **Para ahorrar tiempo y memoria**, usa [`maxOutputSize`](../reference/options#maxoutputsize). Un límite como 2000 o 3000 píxeles mantiene legibles los documentos, y hace Aplicar más rápido y los archivos más pequeños.

## Imágenes que acepta

`src` acepta una URL del mismo origen que tu página, o un `File` o `Blob` adjuntado en el cliente. PaperPic lee los píxeles de la imagen, y los navegadores solo lo permiten con imágenes de otro origen mediante CORS, que PaperPic no solicita. Sirve las imágenes desde tu propio dominio, o descárgalas tú y pasa el `Blob`.

## Renderizado en el servidor

PaperPic necesita un navegador. Los componentes de Vue y React renderizan un elemento vacío en el servidor, como en Nuxt o Next.js, y crean el visor en el navegador. Con el core, crea tú el visor en el navegador, por ejemplo cuando tu componente se monta.

## Navegadores compatibles

PaperPic admite los navegadores de [Baseline Widely Available](https://web.dev/baseline): las funciones que llevan al menos 30 meses funcionando en todos los navegadores principales. Los paquetes se compilan para ese objetivo, es decir, Chrome y Edge 124, Firefox 125 y Safari 17.5 o posteriores, así que no hace falta transpilarlos.
