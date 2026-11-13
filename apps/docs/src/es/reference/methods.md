---
title: Métodos
description: Todos los métodos de la clase PaperPic, para controlar el visor desde tu código, como hacer zoom, ajustar, girar, editar, aplicar, descargar y recargar.
---

# Métodos

Los métodos controlan el visor desde tu código, por ejemplo desde tus propios botones con [`toolbar: false`](./options#toolbar). En Vue y React, la ref del componente te da el visor: consulta [Vue](./vue) y [React](./react).

```ts
import { PaperPic } from '@paperpic/core'

const pic = new PaperPic(container, { src: '/receipt.jpg' })

pic.zoomIn()
```

## Crear y destruir

### `new PaperPic()`

```ts
class PaperPic {
  constructor(container: HTMLElement, options?: PaperPicOptions)
}
```

Crea el visor dentro de `container`, que llena por completo. Dale una altura al contenedor, o el visor se queda en su altura mínima. [Opciones](./options) explica lo que acepta `options`.

Lanza un `TypeError` si `container` no es un elemento. Crea el visor cuando el elemento ya exista, por ejemplo al montarlo.

### `destroy()`

```ts
function destroy(): void
```

Quita el visor y libera todo lo que ocupa, como su worker y la memoria de sus imágenes. Llamarlo dos veces no da problemas.

## Opciones y estado

### `setOptions()`

```ts
function setOptions(options: PaperPicOptions): void
```

Cambia las opciones que pasas y mantiene las demás. `undefined` devuelve una opción a su valor por defecto. Nunca emite `change`, así que los enlaces bidireccionales no entran en bucle.

### `getState()`

```ts
function getState(): PaperPicState
```

Devuelve lo que muestra el visor, como el zoom, el modo y si hay cambios para aplicar. [Estado](./state) describe cada campo.

### `on()`

```ts
function on(name: keyof PaperPicEvents, listener: (payload) => void): () => void
```

Escucha un evento y devuelve una función que deja de escucharlo. [Eventos](./events) describe cada evento.

```ts
const off = pic.on('apply', ({ blob }) => upload(blob))

off()
```

## Vista

### `zoomIn()`

```ts
function zoomIn(): void
```

Acerca un paso, alrededor del centro del visor.

### `zoomOut()`

```ts
function zoomOut(): void
```

Aleja un paso, alrededor del centro del visor.

### `zoomTo()`

```ts
function zoomTo(zoom: number, point?: { x: number, y: number }): void
```

Fija el zoom, donde `1` muestra un píxel de la imagen por cada píxel de pantalla. `point` se queda en su sitio: va en píxeles CSS desde la esquina superior izquierda del visor, y por defecto es su centro.

El zoom va desde el ajuste de la imagen entera, o `1` si es menor, hasta `8`. Un valor fuera de ese rango se limita.

### `fit()`

```ts
function fit(fit: 'image' | 'width' | 'height'): void
```

Ajusta al visor la imagen entera, su ancho o su alto.

## Edición

### `edit()`

```ts
function edit(): void
```

Empieza a editar. No hace nada si la imagen no está lista o si [`editable`](./options#editable) es `false`.

### `rotate()`

```ts
function rotate(direction?: 1 | -1): void
```

Gira la imagen un cuarto de vuelta: en el sentido de las agujas del reloj con `1`, el valor por defecto, y en el contrario con `-1`. Durante la edición es un cambio que [`apply()`](#apply) hace permanente. En un visor de solo lectura, solo cambia lo que se ve. En otro caso, no hace nada.

### `flip()`

```ts
function flip(): void
```

Voltea la imagen de izquierda a derecha tal como se ve, así que después de un cuarto de vuelta sigue volteando de izquierda a derecha. Para ponerla boca abajo, voltéala y gírala dos veces. Es un cambio, y no hace nada fuera del modo de edición ni con una herramienta abierta.

### `openTool()`

```ts
function openTool(id: ToolId): void
```

Abre una herramienta con panel: Recortar, con `'crop'`, Enderezar, con `'perspective'`, Ajustar, con `'adjust'`, o Limpiar, con `'threshold'`, que se activa al abrirse. La herramienta sigue abierta hasta [`confirmTool()`](#confirmtool) o [`cancelTool()`](#canceltool), y mientras tanto los demás cambios, Deshacer, Rehacer y Aplicar no hacen nada. No hace nada fuera del modo de edición, con otra herramienta abierta, para Ajustar con Limpiar activado, ni para Recortar y Enderezar mientras llega una vista previa.

### `confirmTool()`

```ts
function confirmTool(): void
```

Cierra la herramienta abierta y añade lo que eligió a los cambios, como hace `Enter`: la selección de Recortar o Enderezar, o los valores de Ajustar o Limpiar, como un solo cambio.

### `cancelTool()`

```ts
function cancelTool(): void
```

Cierra la herramienta abierta y descarta sus cambios, como hace `Esc`.

### `setThreshold()`

```ts
function setThreshold(setting: { enabled?: boolean, sensitivity?: number }): void
```

Activa o desactiva Limpiar, o cambia su sensibilidad, de 0 a 1. Limpiar siempre se aplica después de los demás cambios. Con Limpiar abierta, cambia lo que muestra Limpiar, y [`confirmTool()`](#confirmtool) lo conserva como un solo cambio. No hace nada fuera del modo de edición ni con otra herramienta abierta.

Lanza un `RangeError` si `sensitivity` no está entre 0 y 1.

### `setAdjustments()`

```ts
function setAdjustments(setting: { brightness?: number, contrast?: number }): void
```

Cambia el brillo o el contraste, cada uno de -1 a 1, donde 0 deja la imagen como está. Se aplican después de los demás cambios. Con Ajustar abierta, cambia lo que muestra Ajustar, y [`confirmTool()`](#confirmtool) lo conserva como un solo cambio. No hace nada fuera del modo de edición, con otra herramienta abierta ni con Limpiar activado, porque un documento limpiado tiene sus propios tonos.

Lanza un `RangeError` si un valor no está entre -1 y 1.

### `undo()`

```ts
function undo(): void
```

Deshace el último cambio.

### `redo()`

```ts
function redo(): void
```

Recupera el último cambio deshecho.

### `apply()`

```ts
function apply(): Promise<void>
```

Aplica los cambios a resolución completa, o a [`maxOutputSize`](./options#maxoutputsize). El resultado pasa a ser la imagen en pantalla, el historial se vacía, el visor vuelve al modo de visualización y el evento [`apply`](./events#apply) lleva el resultado. Aplicar no se puede interrumpir, y bloquea los controles mientras dura.

Si falla, el evento [`error`](./events#error) lo notifica y la edición sigue abierta.

### `cancel()`

```ts
function cancel(): void
```

Descarta los cambios y vuelve al modo de visualización. No pregunta antes: eso lo hacen el botón Cancelar integrado y `Esc`.

## Imagen

### `download()`

```ts
function download(): void
```

Guarda como archivo la imagen en pantalla: el resultado del último Aplicar, o si no, la imagen original. Funciona sin la opción [`download`](./options#download), que solo muestra un botón. El evento [`download`](./events#download) llega antes y puede impedirlo. No hace nada durante la edición, porque los cambios aún no se han aplicado.

### `reload()`

```ts
function reload(): void
```

Vuelve a cargar el [`src`](./options#src) actual, lo que recupera la imagen original después de Aplicar.
