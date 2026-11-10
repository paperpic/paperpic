---
title: Redresser
description: Comment l’outil Redresser de PaperPic transforme la photo d’un document prise de biais en page à plat, comment il estime les proportions et quand utiliser aspectRatio, avec une démo en direct.
---

# Redresser

Un document photographié de biais ressemble à un trapèze : le bord éloigné est plus court et le texte penche. Redresser le remet en page plate et rectangulaire, comme s’il avait été scanné. Son id dans l’API est `perspective`.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['perspective']" />

## Utilisation

1. Appuyez sur Modifier, puis sur Redresser. Une poignée apparaît pour chaque coin.
2. Faites glisser chaque poignée sur un coin du document. Zoomez pour les placer avec précision.
3. Appuyez sur Terminé, ou `Entrée`. La visionneuse montre la page à plat, découpée aux quatre coins.

Les poignées fonctionnent comme dans [Recadrer](./crop) : une loupe sur les écrans tactiles, et Tab et les flèches au clavier. Les quatre coins gardent toujours une forme convexe, donc la page peut toujours être mise à plat.

## Proportions

Une photo ne dit pas la forme réelle de la page, donc Redresser estime ses proportions d’après la place des coins dans la photo. L’estimation convient aux photos prises à une distance normale, mais elle ne peut pas être exacte.

L’estimation utilise la photo d’origine, même après un recadrage ou une rotation dans la même modification. Dès que l’utilisateur applique, le résultat compte comme la nouvelle photo, donc redressez avant d’appliquer.

Si vous connaissez le document, donnez à [`aspectRatio`](../../reference/options#aspectratio) sa largeur divisée par sa hauteur, et le résultat prend ces proportions :

:::tabs key:framework
== JavaScript

```ts
const pic = new PaperPic(container, {
  src: '/invoice.jpg',
  aspectRatio: 210 / 297,
})
```

== Vue

```vue
<PaperPic src="/invoice.jpg" :aspect-ratio="210 / 297" />
```

== React

```tsx
<PaperPic src="/invoice.jpg" aspectRatio={210 / 297} />
```

:::

| Document                       | `aspectRatio`  |
| ------------------------------ | -------------- |
| Feuille A4, en portrait        | `210 / 297`    |
| Feuille US Letter, en portrait | `8.5 / 11`     |
| Carte d’identité, en paysage   | `85.6 / 53.98` |

Pour une feuille en paysage, inversez les nombres, comme `297 / 210`.

## Coins coupés par la photo

Parfois, un coin du document tombe hors de la photo. Les poignées restent dans l’image, donc placez cette poignée sur le bord de la photo, le long du côté du document qui garde le contenu. Les dernières lignes penchent un peu et les proportions estimées en souffrent, ce que [`aspectRatio`](../../reference/options#aspectratio) peut corriger.

Le [playground](../../playground) propose un ticket de caisse d’exemple avec un coin coupé pour l’essayer.

## Depuis le code

Redresser s’ouvre avec [`openTool('perspective')`](../../reference/methods#opentool) et se ferme avec [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool) :

```ts
pic.edit()
pic.openTool('perspective')

// Plus tard, depuis un de vos boutons
pic.confirmTool()
```
