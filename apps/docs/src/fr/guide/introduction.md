---
title: Qu’est-ce que PaperPic ?
description: PaperPic est une visionneuse et un éditeur d’images de documents pour le web. On y zoome sur des photos de papier, on les redresse, on les recadre et on les nettoie avant que votre application les garde.
---

# Qu’est-ce que PaperPic ?

Les photos de documents arrivent de travers, avec des ombres et beaucoup de fond. PaperPic les affiche dans une visionneuse où l’on peut zoomer, et permet de redresser et de nettoyer chaque photo avant que votre application la garde, comme le ferait une application de scanner.

## Ce qu’il fait

- **Afficher.** Zoomer avec les boutons, la molette ou un pincement, déplacer l’image, et ajuster l’image entière, sa largeur ou sa hauteur. Une visionneuse en lecture seule peut aussi faire pivoter l’image.
- **Modifier.** En mode d’édition, l’utilisateur peut recadrer, redresser une photo prise de biais, faire pivoter, retourner, régler la luminosité et le contraste, et nettoyer le document en noir et blanc. Chaque changement peut être annulé jusqu’à ce que l’utilisateur applique les changements.
- **Livrer.** Appliquer calcule le résultat en pleine résolution et le remet à votre code sous forme de `Blob`. Un bouton de téléchargement peut aussi l’enregistrer.

Chaque étape n’a lieu que lorsque l’utilisateur la demande. Rien ne modifie la photo de lui-même.

## Ce qu’il ne fait pas

- Il n’envoie rien. Votre application décide quoi faire du résultat.
- Il n’ouvre pas les fichiers PDF, seulement des images.
- Il ne trouve pas seul les bords du document : l’utilisateur fait glisser les coins.

## Paquets

| Paquet            | À utiliser avec                              |
| ----------------- | -------------------------------------------- |
| `@paperpic/core`  | JavaScript sans framework, ou tout framework |
| `@paperpic/vue`   | Vue 3.5 ou plus récent                       |
| `@paperpic/react` | React 19 ou plus récent                      |

Les trois ont les mêmes options, événements et méthodes, et le cœur n’a aucune dépendance à l’exécution. La modification s’exécute dans un Web Worker, donc la page reste réactive avec de grandes photos.

## Essayer

Le [playground](../playground) vous permet de modifier un ticket de caisse d’exemple, ou une photo à vous qui ne quitte jamais votre navigateur. Pour ajouter PaperPic à votre application, allez à [Bien démarrer](./getting-started).
