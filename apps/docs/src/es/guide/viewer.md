---
title: Visor
description: Cómo se hace zoom, se desplaza y se encaja la imagen de un documento en PaperPic, qué ofrece la barra de herramientas y cómo mostrar una imagen de solo lectura, con una demo en vivo.
---

# Visor

La letra pequeña y los tiques largos son difíciles de leer de un vistazo en una pantalla. El visor encaja la imagen al cargarla y deja hacer zoom en cualquier parte.

<Demo src="/samples/receipt.jpg" alt="Un tique" :editable="false" />

## Zoom y desplazamiento

| Acción                                       | Ratón y trackpad                  | Táctil      | Teclado   |
| -------------------------------------------- | --------------------------------- | ----------- | --------- |
| Hacer zoom                                   | Rueda, o pellizcar en un trackpad | Pellizcar   | `+` y `-` |
| Desplazar                                    | Arrastrar                         | Arrastrar   | Flechas   |
| Alternar entre la imagen encajada y el 100 % | Doble clic                        | Doble toque |           |
| Encajar la imagen entera                     |                                   |             | `0`       |

Las teclas funcionan con el foco dentro del visor. En un botón, las flechas pasan de un botón a otro, y mientras no hay nada que desplazar, hacen scroll en la página. Al pellizcar, el zoom se centra en el punto entre los dedos. En una pantalla táctil, un dedo hace scroll en la página mientras la imagen está encajada, y desplaza la imagen cuando tiene zoom.

El zoom va desde el nivel que encaja la imagen entera, o el 100 % para una imagen pequeña, hasta el 800 %. Una imagen que cabe se queda centrada, y una que se sale se desplaza hasta sus bordes.

Al cargarse, la imagen se encaja entera en el visor, y sigue encajada cuando el visor cambia de tamaño, hasta que el usuario hace zoom a mano.

En una página larga, la rueda haría zoom en la imagen en vez de hacer scroll en la página. Usa ahí `wheelZoom: false`: los botones, el teclado y el gesto de pellizcar en una pantalla táctil siguen haciendo zoom. Pellizcar en un trackpad deja de hacer zoom en la imagen, porque el navegador lo trata como la rueda.

## La barra de herramientas

La barra de herramientas está a la derecha del visor, y tiene scroll cuando el visor es demasiado bajo para sus botones. Se oculta durante la edición, así que nunca tapa una esquina de Recortar o Enderezar.

| Botón                                    | Qué hace                                                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Editar                                   | Abre el [modo de edición](./editing). Aparece cuando la imagen está lista, y nunca con `editable: false` |
| Acercar, Alejar                          | Hacen zoom un paso del 25 %, alrededor del centro                                                        |
| Ajustar al ancho, Ajustar al alto        | Encajan la imagen a lo ancho, lo que va bien para documentos largos, o a lo alto                         |
| Girar a la izquierda, Girar a la derecha | Solo en un visor de solo lectura: giran la imagen en pantalla                                            |
| Descargar                                | Solo con `download: true`: guarda la imagen en pantalla                                                  |

Ajustar al ancho y Ajustar al alto siguen pulsados mientras dura su encaje. Ningún botón vuelve a encajar la imagen entera: pulsa `0`, o aleja el zoom del todo.

Con `toolbar: false`, la barra de herramientas y la barra de edición se ocultan, y puedes crear tus propios controles con los [métodos](../reference/methods).

## Visor de solo lectura {#read-only}

Con `editable: false`, el botón Editar desaparece y la barra de herramientas gana dos botones que giran la imagen. Ese giro solo cambia lo que se ve, y no se guarda nada: el botón Descargar guarda la imagen sin él. Úsalo para documentos que se deben leer pero no cambiar, como los adjuntos de un expediente.

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

Los métodos [`zoomIn()`](../reference/methods#zoomin), [`zoomOut()`](../reference/methods#zoomout), [`zoomTo()`](../reference/methods#zoomto) y [`fit()`](../reference/methods#fit) hacen lo mismo que los botones, y [`getState()`](../reference/methods#getstate) te dice el zoom y el encaje vigentes:

```ts
pic.fit('width')
pic.zoomTo(2)

const { zoom, fit } = pic.getState()
```
