---
title: Eventos
description: Los eventos de PaperPic (load, error, change, apply y download), los datos de cada uno y cómo escucharlos en JavaScript, Vue y React.
---

# Eventos

Los eventos avisan a tu código de lo que pasa en el visor. Escúchalos con [`on()`](./methods#on). En Vue son eventos del componente, como `@apply`, y en React son props, como `onApply`. Si una función que escucha lanza un error, el visor sigue adelante: la página recibe el error como cualquier otro no capturado, y las demás funciones se ejecutan igualmente.

:::tabs key:framework
== JavaScript

```ts
pic.on('apply', ({ blob }) => upload(blob))
```

== Vue

```vue
<PaperPic :src @apply="({ blob }) => upload(blob)" />
```

== React

```tsx
<PaperPic src={src} onApply={({ blob }) => upload(blob)} />
```

:::

## `load`

- **Datos:** [`Size`](./types#size)

La imagen se ha cargado y está en pantalla. `width` y `height` son su tamaño en píxeles. Se emite cada vez que carga un `src`, también con [`reload()`](./methods#reload), pero no después de Aplicar, cuyo resultado llega con [`apply`](#apply).

## `error`

- **Datos:** `{ error: Error, phase: 'load' | 'preview' | 'apply' }`

Algo falló, y `phase` dice qué:

- `'load'`: la imagen no se pudo cargar.
- `'preview'`: un cambio no se pudo mostrar, como cuando la imagen es demasiado grande para el navegador. La edición sigue abierta.
- `'apply'`: los cambios no se pudieron aplicar. La edición sigue abierta.

## `change`

- **Datos:** [`PaperPicState`](./state)

El estado cambió, por el usuario o por un método, por ejemplo al hacer zoom, abrir una herramienta o deshacer. Envía el estado completo, el mismo que devolvería [`getState()`](./methods#getstate) en ese momento. Aplicar lo emite dos veces: al empezar, con `busy: true`, y al terminar bien, después de [`apply`](#apply).

Esto cambia el estado sin emitir `change`:

- Cargar una imagen, de lo que avisa [`load`](#load) o [`error`](#error).
- Un Aplicar que falla, de lo que avisa [`error`](#error). `busy` vuelve a ser `false`.
- `setOptions()` y las props de los componentes, para que los enlaces bidireccionales no entren en bucle.
- Un cambio de tamaño del visor, que cambia `zoom` mientras hay un encaje vigente.

Desplazar la imagen no emite nada, porque el estado no guarda su posición. [Estado](./state#in-step) muestra cómo sincronizar tus propios controles.

## `apply`

- **Datos:** [`ExportedImage`](./types#exportedimage)

Aplicar terminó, desde el botón, `Enter` o [`apply()`](./methods#apply), y el resultado ya está en pantalla. `blob` contiene la imagen en el formato `type`, que elige [`output`](./options#output).

## `download`

- **Datos:** [`PaperPicDownload`](./types#paperpicdownload)

La imagen está a punto de guardarse, desde el botón de descarga o desde [`download()`](./methods#download). `source` es la imagen en pantalla: el resultado del último Aplicar, o si no, el `src`. `filename` es el nombre del archivo.

Llama a `preventDefault()` para que el navegador no guarde el archivo, por ejemplo para guardarlo de otra forma:

```ts
pic.on('download', ({ source, filename, preventDefault }) => {
  preventDefault()
  saveToCloud(source, filename)
})
```
