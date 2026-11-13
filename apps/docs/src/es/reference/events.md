---
title: Eventos
description: Los eventos de PaperPic y lo que lleva cada uno, load, error, change, apply y download, con cómo escucharlos en JavaScript, Vue y React.
---

# Eventos

Los eventos avisan a tu código de lo que pasa en el visor. Escúchalos con [`on()`](./methods#on). En Vue son eventos del componente, como `@apply`, y en React son props, como `onApply`.

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

La imagen se ha cargado y está en pantalla. `width` y `height` son su tamaño en píxeles.

## `error`

- **Datos:** `{ error: Error }`

La imagen no se pudo cargar, o los cambios no se pudieron aplicar. Si Aplicar falla, la edición sigue abierta.

## `change`

- **Datos:** [`PaperPicState`](./state)

El usuario cambió la vista o la edición, por ejemplo al hacer zoom, abrir una herramienta o deshacer. También avisa del inicio de Aplicar, con `busy: true`. `setOptions()` y las props de los componentes nunca lo emiten.

## `apply`

- **Datos:** [`ExportedImage`](./types#exportedimage)

El usuario aplicó los cambios, y el resultado ya está en pantalla. `blob` contiene la imagen en el formato `type`, que elige [`output`](./options#output).

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
