---
title: Masquer
description: Comment l’outil Masquer de PaperPic recouvre une partie d’une photo de noir ou de blanc opaque, comme un numéro de compte ou une signature, pour que le résultat ne la contienne plus.
---

# Masquer

La photo d’un document en montre parfois trop : un numéro de compte, une signature, un visage à l’arrière-plan. Masquer recouvre un rectangle, droit ou incliné, de noir ou de blanc opaque, et le résultat ne contient plus ce qu’il y avait dessous.

<Demo src="/samples/receipt.jpg" alt="Un ticket de caisse" :tools="['redact']" />

## Utilisation

1. Appuyez sur Modifier, puis sur Masquer. Une bande apparaît au milieu de l’image, avec une poignée à chaque coin.
2. Dessinez la zone sur ce qu’il faut cacher : faites glisser d’un de ses coins au coin opposé, n’importe où sur l’image, y compris sur la bande. Ensuite, faites glisser la zone pour la déplacer, tournez-la avec la poignée au-dessus d’elle, pour qu’elle suive une ligne de texte inclinée, et faites glisser ses coins pour la redimensionner. La zone montre sa couleur, encore transparente, pour que vous puissiez la placer sur les bons mots.
3. Choisissez Noir ou Blanc dans le panneau.
4. Appuyez sur Terminé, ou `Entrée`, pour ajouter la zone aux changements. Annuler cet outil, ou `Échap`, ferme Masquer sans rien changer.

Vous ne pouvez dessiner que jusqu’à ce que la zone soit placée. Dès que vous la dessinez, la déplacez, la tournez ou la redimensionnez, faire glisser le reste de l’image la déplace à nouveau, pour que rien ne remplace la zone par accident. Avant cela, déplacez une image zoomée avec deux doigts, ou avec les flèches quand l’image a le focus. Sans faire glisser, la bande est la zone : déplacez-la au clavier, ou touchez-la puis l’endroit voulu.

Chaque appui sur Terminé ajoute une zone : rouvrez Masquer pour recouvrir une autre partie. Annuler la dernière action permet de retirer la dernière zone, et la couleur reste pour la suivante. Les poignées d’angle fonctionnent comme dans [Recadrer](./crop) : faites-les glisser, touchez-en une puis l’endroit voulu, ou déplacez-les au clavier. Sur la poignée au-dessus de la zone, les flèches la tournent de 1 degré, ou de 10 avec Maj. Glissée, elle se cale à l’horizontale.

## Ce qui est garanti {#guarantees}

- Les zones sont recouvertes après tous les autres changements, donc Ajuster et Nettoyer n’éclaircissent jamais leur noir ou leur blanc.
- Une zone suit les changements suivants : une rotation, un retournement ou un recadrage la déplacent avec l’image, et Redresser la déforme avec la page.
- Elle recouvre chaque pixel que ses bords touchent, même en partie, et reste opaque dans un PNG transparent.
- L’application des modifications écrit des pixels opaques dans le résultat, donc le fichier ne garde rien de ce qu’ils recouvrent.

Tant que les modifications ne sont pas appliquées, la visionneuse garde l’image source, donc Annuler la dernière action fait revenir ce qu’une zone recouvre. Partagez toujours le résultat appliqué, jamais l’image source.

## Depuis le code

Masquer est dans la barre de modification par défaut, avec l’id `'redact'` dans [`tools`](../../reference/options#tools). Avec `toolbar: false`, ouvrez-le avec [`openTool()`](../../reference/methods#opentool), choisissez la couleur avec [`setRedaction()`](../../reference/methods#setredaction), et fermez-le avec [`confirmTool()`](../../reference/methods#confirmtool) ou [`cancelTool()`](../../reference/methods#canceltool) :

```ts
pic.edit()
pic.openTool('redact')
pic.setRedaction({ color: 'white' })

// Plus tard, depuis un bouton à vous
pic.confirmTool()
```

Le `redaction` de l’[état](../../reference/state) contient la couleur en cours.
