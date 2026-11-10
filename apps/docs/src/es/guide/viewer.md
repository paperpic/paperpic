---
title: Visor
description: Cómo se hace zoom, se desplaza y se ajusta la imagen de un documento en PaperPic, qué ofrece la barra de herramientas y cómo mostrar una imagen de solo lectura, con una demo en vivo.
---

# Visor

La letra pequeña y los tiques largos cuestan de leer de un vistazo en una pantalla. El visor ajusta la imagen al cargarla y deja hacer zoom en cualquier parte.

<Demo src="/samples/receipt.jpg" alt="Un tique" :editable="false" />

## Zoom y desplazamiento

| Acción                              | Ratón y trackpad                  | Táctil      | Teclado   |
| ----------------------------------- | --------------------------------- | ----------- | --------- |
| Hacer zoom                          | Rueda, o pellizcar en un trackpad | Pellizcar   | `+` y `-` |
| Desplazar                           | Arrastrar                         | Arrastrar   | Flechas   |
| Alternar entre el ajuste y el 100 % | Doble clic                        | Doble toque |           |
| Ajustar la imagen entera            |                                   |             | `0`       |

El teclado funciona con el foco en el visor. Al pellizcar, el zoom se centra en el punto entre los dedos. En una pantalla táctil, un dedo desplaza la página mientras la imagen está ajustada, y desplaza la imagen cuando tiene zoom.

El zoom va desde el ajuste de la imagen entera, o el 100 % para una imagen pequeña, hasta el 800 %. Una imagen que cabe se queda centrada, y una que se sale se desplaza hasta sus bordes.

Al cargarse, la imagen se ajusta entera al visor, y mantiene su ajuste cuando el visor cambia de tamaño, hasta que el usuario hace zoom a mano.

En una página larga, la rueda haría zoom en la imagen en vez de desplazar la página. Usa ahí `wheelZoom: false`: los botones, el teclado y el gesto de pellizcar en una pantalla táctil siguen haciendo zoom.

## La barra de herramientas

La barra de herramientas está a la derecha del visor, y se desplaza cuando el visor es demasiado bajo para sus botones.

| Botón                                    | Qué hace                                                              |
| ---------------------------------------- | --------------------------------------------------------------------- |
| Editar                                   | Abre el [modo de edición](./editing). Se oculta con `editable: false` |
| Acercar, Alejar                          | Hacen zoom un paso, alrededor del centro                              |
| Ajustar al ancho, Ajustar al alto        | Ajustan el ancho, lo que va bien para documentos largos, o el alto    |
| Girar a la izquierda, Girar a la derecha | Solo en un visor de solo lectura: giran la imagen en pantalla         |
| Descargar                                | Solo con `download: true`: guarda la imagen en pantalla               |

Con `toolbar: false`, la barra de herramientas y la barra de edición se ocultan, y puedes crear tus propios controles con los [métodos](../reference/methods).

## Visor de solo lectura {#read-only}

Con `editable: false`, el botón Editar desaparece y la barra de herramientas gana dos botones que giran la imagen. Ese giro solo cambia lo que se ve, y no se guarda nada. Úsalo para documentos que se deben leer pero no cambiar, como los adjuntos de un expediente.

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  alt: 'Un tique',
  editable: false,
})
```

== Vue

```vue
<PaperPic src="/receipt.jpg" alt="Un tique" :editable="false" />
```

== React

```tsx
<PaperPic src="/receipt.jpg" alt="Un tique" editable={false} />
```

:::

## Controlar la vista desde el código

Los métodos [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) y [`fit()`](../reference/methods#fit) hacen lo mismo que los botones, y [`getState()`](../reference/methods#getstate) te dice el zoom y el ajuste vigentes:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
