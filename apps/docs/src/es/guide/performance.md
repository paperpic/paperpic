---
title: Rendimiento y compatibilidad
description: Dónde hace PaperPic su trabajo, qué necesitan los empaquetadores, la Content Security Policy y el renderizado en el servidor, cómo trata las fotos grandes de móvil y qué navegadores admite.
---

# Rendimiento y compatibilidad

Las fotos de móvil tienen 12 megapíxeles o más, y editarlas exige mucho cálculo. Esta página explica dónde se hace ese trabajo, qué necesitan tu build y tu servidor, y qué navegadores admite PaperPic.

## Un Web Worker hace el trabajo

El blanco y negro y Enderezar tardan alrededor de un segundo y medio con una foto de 12 megapíxeles en un móvil reciente, como muestran los [tiempos medidos](#measurements). En el hilo principal, la página se congelaría ese tiempo. PaperPic los ejecuta en un Web Worker, así que la página no se bloquea mientras se aplican los cambios. La búsqueda del documento también se hace ahí.

El worker viene dentro del paquete y arranca con el estándar `new Worker(new URL(…, import.meta.url))`, que empaquetadores como Vite y webpack 5 detectan solos, sin configuración. Si el worker no puede arrancar, la edición se hace en el hilo principal: sigue funcionando, pero la página puede congelarse un momento con imágenes grandes.

## Content Security Policy

Con una Content Security Policy, permite:

- `worker-src 'self'`, para el worker.
- `img-src blob:`, porque el visor muestra los archivos adjuntos y los resultados editados con URLs `blob:`.
- `paperpic` en `trusted-types`, si tu política limita las políticas de Trusted Types, porque los iconos de los botones pasan por esa política.
- Una política `default` de Trusted Types cuyo `createScriptURL` acepte la URL del worker, si tu política exige Trusted Types. Los empaquetadores solo detectan un worker creado con una URL normal, que Trusted Types bloquea, así que sin esa política la edición se hace en el hilo principal.

## Fotos grandes

- **Durante la edición**, la vista previa trabaja sobre una copia de unos 2 megapíxeles, así que las reglas y las herramientas van fluidas con cualquier foto.
- **Al aplicar**, cada cambio se calcula a resolución completa. Las fotos grandes tardan unos segundos, así que el visor muestra un mensaje y bloquea los controles mientras tanto.
- **Para ahorrar tiempo y memoria**, usa [`maxOutputSize`](../reference/options#maxoutputsize). Un límite como 2000 o 3000 píxeles mantiene legibles los documentos, y hace que aplicar los cambios sea más rápido y que los archivos sean más pequeños.

## Tiempos medidos {#measurements}

Lo que tarda cada paso al aplicar los cambios, en el worker, en un Pixel 10 Pro con Chrome 156:

| Paso                         | 2 MP   | 12 MP  | 37,5 MP |
| ---------------------------- | ------ | ------ | ------- |
| Blanco y negro               | 256 ms | 1,5 s  | 4,8 s   |
| Enderezar                    | 251 ms | 1,6 s  | 5,0 s   |
| Exportar a PNG               | 92 ms  | 378 ms | 979 ms  |
| Exportar a JPEG, calidad 0,9 | 33 ms  | 142 ms | 525 ms  |

- Mover la regla de Limpiar tarda unos 40 ms en el mismo móvil, porque trabaja sobre la vista previa de unos 2 MP.
- Un ordenador de sobremesa con 8 núcleos hace cada paso unas seis veces más rápido.
- A 37,5 MP, el blanco y negro necesita unos 340 MB de memoria en su punto máximo.
- Los Android de gama media y los iPhone aún no están medidos.

## Renderizado en el servidor

PaperPic necesita un navegador. Los componentes de Vue y React renderizan un elemento vacío en el servidor, como en Nuxt o Next.js, y crean el visor en el navegador. Con el core, crea tú el visor en el navegador, por ejemplo cuando tu componente se monta.

## Navegadores compatibles

PaperPic admite los navegadores de [Baseline Widely Available](https://web.dev/baseline): las funciones que llevan al menos 30 meses funcionando en todos los navegadores principales. Los paquetes se compilan para ese objetivo, es decir, Chrome y Edge 124, Firefox 125 y Safari 17.5 o posteriores, así que no hace falta transpilarlos.
