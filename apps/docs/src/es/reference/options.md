---
title: Opciones
description: Todas las opciones de PaperPic, con su tipo, su valor por defecto y lo que cambian, para el constructor, setOptions() y las props de los componentes de Vue y React.
---

# Opciones

Las opciones definen qué muestra el visor y qué puede hacer el usuario con él. Pásalas al crear el visor, o cámbialas después con [`setOptions()`](./methods#setoptions). Los componentes de Vue y React las reciben como props con los mismos nombres.

```ts
const pic = new PaperPic(container, { src: '/receipt.jpg', alt: 'Un tique' })

pic.setOptions({ editable: false })
```

`setOptions()` cambia solo las opciones que pasas, y `undefined` devuelve una opción a su valor por defecto. Nunca emite `change`.

## Imagen

### `src`

- **Tipo:** `string | Blob`
- **Valor por defecto:** ninguno

La imagen que se muestra: una URL del mismo origen, o un `File` o `Blob` adjuntado en el cliente.

Pasar el mismo valor otra vez no recarga la imagen, así que el resultado de una edición sigue en pantalla. Llama a [`reload()`](./methods#reload) para recuperar la original. Un valor nuevo durante la edición descarta los cambios.

### `alt`

- **Tipo:** `string`
- **Valor por defecto:** `''`

Describe la imagen para los lectores de pantalla.

## Interfaz

### `editable`

- **Tipo:** `boolean`
- **Valor por defecto:** `true`

Si el usuario puede editar la imagen. Con `false` es un visor de solo lectura, y su barra de herramientas añade botones para girar la imagen. Ese giro solo cambia lo que se ve. Cambiar esta opción durante la edición descarta los cambios.

### `toolbar`

- **Tipo:** `boolean`
- **Valor por defecto:** `true`

Si se muestran la barra de herramientas y la barra de edición integradas. Sin ellas, crea tus propios controles con los [métodos](./methods).

### `tools`

- **Tipo:** `readonly ToolId[]`
- **Valor por defecto:** todas las herramientas

Las herramientas que ofrece la barra de edición. Mantienen el orden de esta tabla, sea cual sea el orden del array.

| Id              | Botón                                  |
| --------------- | -------------------------------------- |
| `'crop'`        | Recortar                               |
| `'perspective'` | Enderezar                              |
| `'rotate'`      | Girar a la izquierda                   |
| `'flip'`        | Voltear                                |
| `'adjust'`      | Ajustar, para el brillo y el contraste |
| `'threshold'`   | Limpiar                                |

### `wheelZoom`

- **Tipo:** `boolean`
- **Valor por defecto:** `true`

Si la rueda hace zoom en la imagen. Desactívala cuando el visor esté en una página larga, para que la rueda desplace la página.

### `download`

- **Tipo:** `boolean`
- **Valor por defecto:** `false`

Si la barra de herramientas tiene un botón que guarda la imagen en pantalla: el resultado del último Aplicar, o si no, la imagen original. El botón se oculta durante la edición. El evento [`download`](./events#download) te permite guardar el archivo de otra forma.

### `labels`

- **Tipo:** `Partial<PaperPicLabels>`
- **Valor por defecto:** los textos en inglés

Sustituye cualquiera de los textos que el componente muestra o anuncia. [Textos de la interfaz](./labels) recoge todas las claves.

## Resultado

### `output`

- **Tipo:** `{ type?: string, quality?: number }`
- **Valor por defecto:** el formato de la imagen original

El formato de la imagen editada. `type` es `'image/jpeg'`, `'image/png'` o `'image/webp'`, y `quality` va de 0 a 1 para JPEG y WebP, con `0.92` por defecto.

Sin `type`, una imagen limpiada sale en PNG, porque JPEG dañaría sus bordes nítidos, y cualquier otra imagen mantiene el formato de la original. Un formato que el navegador no sabe codificar da PNG.

### `maxOutputSize`

- **Tipo:** `number`
- **Valor por defecto:** la resolución completa

El lado más largo de la imagen editada, en píxeles. Un resultado mayor se reduce.

### `filename`

- **Tipo:** `string`
- **Valor por defecto:** el nombre de la imagen original

El nombre del archivo guardado. Su extensión sigue el formato de la imagen, así que un `receipt.jpg` limpiado se guarda como `receipt.png`. Si la imagen original no tiene nombre, como un `Blob`, el archivo se llama `image`.

## Herramientas

### `aspectRatio`

- **Tipo:** `number`
- **Valor por defecto:** se estiman

Las proporciones reales del documento, como ancho dividido por alto, por ejemplo `210 / 297` para una hoja A4. Enderezar da a su resultado estas proporciones. Sin ellas, las estima a partir de la foto.

### `softness`

- **Tipo:** `number`, de 0 a 1
- **Valor por defecto:** `0.25`

Cuánto gris conserva Limpiar en los bordes de las letras, lo que las hace más fáciles de leer. Usa `0` para un blanco y negro estricto, que da archivos más pequeños pero rompe los trazos finos.
