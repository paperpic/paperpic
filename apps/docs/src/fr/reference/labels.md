---
title: Libellés
description: Tous les textes de l’interface de PaperPic, avec leur clé et leur valeur anglaise par défaut, pour traduire le composant ou changer sa formulation.
---

# Libellés

Les libellés sont les textes que le composant affiche et ceux qu’il annonce aux lecteurs d’écran. Ils sont en anglais par défaut. Passez ceux que vous voulez changer à l’option [`labels`](./options#labels), et les autres gardent leur texte anglais.

```ts
const pic = new PaperPic(container, {
  src: '/receipt.jpg',
  labels: {
    apply: 'Appliquer',
    cancel: 'Annuler',
    zoomLevel: percent => `Zoom ${percent} %`,
  },
})
```

Quatre libellés sont des fonctions, car leur texte contient une valeur. Créez l’objet une seule fois, et non à chaque rendu, pour que la visionneuse ne le reçoive pas à nouveau chaque fois.

| Clé                    | Anglais                                      | Usage                                                                                                  |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `adjust`               | Adjust                                       | Le bouton qui affiche les curseurs de luminosité et de contraste                                       |
| `adjustmentLevel`      | Brightness +30                               | Fonction du nom et de la valeur de -100 à 100, annoncée après avoir déplacé un curseur d’Ajuster       |
| `applied`              | Changes applied                              | Annoncé quand les changements sont appliqués                                                           |
| `apply`                | Apply                                        | Le bouton qui applique les changements                                                                 |
| `applyError`           | The changes could not be applied             | Affiché quand Appliquer échoue                                                                         |
| `brightness`           | Brightness                                   | Le nom du curseur de luminosité                                                                        |
| `cancel`               | Cancel                                       | Le bouton qui quitte le mode d’édition                                                                 |
| `cancelTool`           | Cancel this tool                             | Le bouton qui ferme un outil et abandonne sa sélection                                                 |
| `confirm`              | Done                                         | Le bouton qui ferme un outil et garde sa sélection                                                     |
| `contrast`             | Contrast                                     | Le nom du curseur de contraste                                                                         |
| `cornerBottomLeft`     | Bottom left corner                           | Le nom d’une poignée d’angle                                                                           |
| `cornerBottomRight`    | Bottom right corner                          | Le nom d’une poignée d’angle                                                                           |
| `cornerMoved`          | Top left corner: 120, 80                     | Fonction de l’angle et de sa position en pixels de l’image, annoncée après avoir déplacé un angle      |
| `cornerTopLeft`        | Top left corner                              | Le nom d’une poignée d’angle                                                                           |
| `cornerTopRight`       | Top right corner                             | Le nom d’une poignée d’angle                                                                           |
| `crop`                 | Crop                                         | Le bouton Recadrer                                                                                     |
| `cropHint`             | Drag the corners                             | Ce qu’il faut faire dans Recadrer                                                                      |
| `discard`              | Discard                                      | Le bouton qui confirme la perte des changements                                                        |
| `discardQuestion`      | Discard your changes?                        | La question avant de perdre les changements                                                            |
| `download`             | Download                                     | Le bouton de téléchargement                                                                            |
| `edit`                 | Edit                                         | Le bouton qui commence la modification                                                                 |
| `editBar`              | Editing controls                             | Le nom de la barre de modification, pour les lecteurs d’écran                                          |
| `editing`              | Editing                                      | Annoncé quand le mode d’édition commence                                                               |
| `fitHeight`            | Fit to height                                | Le bouton qui ajuste la hauteur de l’image                                                             |
| `fitWidth`             | Fit to width                                 | Le bouton qui ajuste la largeur de l’image                                                             |
| `flip`                 | Flip                                         | Le bouton Retourner                                                                                    |
| `keepEditing`          | Keep editing                                 | Le bouton qui revient à la modification au lieu de perdre les changements                              |
| `loadError`            | The image could not be loaded                | Affiché quand l’image ne se charge pas                                                                 |
| `loading`              | Loading image                                | Affiché pendant le chargement de l’image                                                               |
| `perspective`          | Straighten                                   | Le bouton Redresser                                                                                    |
| `perspectiveHint`      | Drag each corner to a corner of the document | Ce qu’il faut faire dans Redresser                                                                     |
| `processing`           | Applying changes                             | Affiché pendant qu’Appliquer s’exécute                                                                 |
| `redo`                 | Redo                                         | Le bouton Rétablir                                                                                     |
| `rotateLeft`           | Rotate left                                  | Le bouton de rotation de la barre de modification, et l’un des deux d’une visionneuse en lecture seule |
| `rotateRight`          | Rotate right                                 | L’autre bouton de rotation d’une visionneuse en lecture seule                                          |
| `threshold`            | Clean up                                     | Le bouton Nettoyer                                                                                     |
| `thresholdLevel`       | Sensitivity 50%                              | Fonction du pourcentage, annoncée après avoir déplacé le curseur de sensibilité                        |
| `thresholdSensitivity` | Sensitivity                                  | Le nom du curseur de sensibilité                                                                       |
| `toolbar`              | Image controls                               | Le nom de la barre d’outils, pour les lecteurs d’écran                                                 |
| `undo`                 | Undo                                         | Le bouton Annuler la dernière action                                                                   |
| `viewer`               | Image viewer                                 | Le nom de la zone qui affiche l’image, pour les lecteurs d’écran                                       |
| `zoomIn`               | Zoom in                                      | Le bouton Zoom avant                                                                                   |
| `zoomLevel`            | Zoom 150%                                    | Fonction du pourcentage, annoncée après un zoom depuis la barre d’outils ou le clavier                 |
| `zoomOut`              | Zoom out                                     | Le bouton Zoom arrière                                                                                 |
