---
title: Redresser
description: Comment l’outil Redresser de PaperPic transforme la photo d’un document prise de biais en page à plat, comment il estime les proportions et quand utiliser aspectRatio, avec une démo en direct.
---

# Redresser

Un document photographié de biais ressemble à un trapèze : le bord éloigné est plus court et le texte penche. Redresser le remet en page plate et rectangulaire, comme s’il avait été scanné. Son id dans l’API est `perspective`.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['perspective']" />

## Utilisation

1. Appuyez sur Modifier, puis sur Redresser. Une poignée apparaît pour chaque coin, sur le document si la visionneuse [le trouve](#finding-the-document).
2. Faites glisser chaque poignée mal placée sur son coin du document. Zoomez avec les boutons de son panneau pour les placer avec précision.
3. Si vous connaissez le papier, choisissez son [format](#paper-size) : A4, Lettre ou Carte. Auto l’estime.
4. Appuyez sur Terminé, ou `Entrée`. La visionneuse montre la page à plat, découpée aux quatre coins. Terminé attend que la visionneuse trouve le document ou que vous déplaciez un coin.

Les poignées fonctionnent comme dans [Recadrer](./crop) : une loupe sur les écrans tactiles, appuyer puis toucher au lieu de faire glisser, et Tab et les flèches au clavier. Les quatre coins gardent toujours une forme convexe, donc la page peut toujours être mise à plat.

Redresser montre la photo sans le noir et blanc de [Nettoyer](./clean-up), car les bords du papier sont difficiles à trouver sur une page nettoyée. Le noir et blanc revient après Terminé, et le gris reste.

## Trouver le document {#finding-the-document}

À l’ouverture de Redresser, la visionneuse cherche le document dans la photo et place les quatre coins dessus, donc Terminé est prêt aussitôt. La recherche se fait dans le navigateur en une fraction de seconde, et ne change rien avant Terminé.

La visionneuse ne propose que ce dont elle est assez sûre. Si le papier se confond avec la table, ou si la photo ne contient pas de document, les coins commencent à l’intérieur de l’image et attendent l’utilisateur. Un coin que l’utilisateur a déjà touché ne bouge jamais tout seul.

## Format de papier {#paper-size}

Le panneau de Redresser propose des formats de papier, qui donnent au résultat les proportions exactes de ce papier :

| Choix  | Proportions                                                                                   |
| ------ | --------------------------------------------------------------------------------------------- |
| Auto   | [`aspectRatio`](../../reference/options#aspectratio), ou sinon une [estimation](#proportions) |
| A4     | 210 × 297 mm, les mêmes que A3 et A5                                                          |
| Lettre | 8,5 × 11 pouces, Lettre US                                                                    |
| Carte  | 85,6 × 53,98 mm, une carte d’identité ou bancaire                                             |

Un format ne fixe que les proportions : il ne déplace pas les coins. Le papier est en portrait ou en paysage selon les coins, donc il n’y a pas d’orientation à choisir. Un format qui n’est pas celui du document le déforme, donc Redresser commence par Auto à chaque ouverture.

Avec les quatre coins sur les coins de l’image, Auto ne change rien, et un format donne à toute l’image les proportions de ce papier.

## Proportions {#proportions}

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

Pour une feuille en paysage, inversez les nombres, comme `297 / 210`. Les proportions s’appliquent à la page telle qu’elle s’affiche à l’écran : si la photo est de côté, faites-la pivoter avec [Pivoter à gauche](./rotate-and-flip) avant de la redresser.

## Coins coupés par la photo

Parfois, un coin du document tombe hors de la photo. Les poignées restent dans l’image, donc placez cette poignée sur le bord de la photo, le long du côté du document qui garde le contenu. Les dernières lignes penchent un peu et les proportions estimées en souffrent, ce que [`aspectRatio`](../../reference/options#aspectratio) peut corriger.

Le [playground](../../playground) propose un ticket de caisse d’exemple avec un coin coupé pour l’essayer.

## Depuis le code

Redresser s’ouvre avec [`openTool('perspective')`](../../reference/methods#opentool) et se ferme avec [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool) :

```ts
pic.edit()
pic.openTool('perspective')
pic.setPaper({ size: 'a4' })

// Plus tard, depuis un de vos boutons
pic.confirmTool()
```

Choisissez le format de papier avec [`setPaper()`](../../reference/methods#setpaper) tant que l’outil est ouvert. `confirmTool()` attend que la visionneuse trouve le document ou qu’un coin bouge, et le `canConfirm` de l’[état](../../reference/state) dit quand elle le peut.
