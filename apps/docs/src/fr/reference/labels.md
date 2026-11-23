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

Cinq libellés sont des fonctions, car leur texte contient une valeur. Une fonction est nouvelle chaque fois qu’on la crée, et la visionneuse prend une nouvelle fonction pour un changement : créez donc une seule fois les libellés qui contiennent des fonctions, et non à chaque rendu.

| Clé                 | Anglais                                                          | Usage                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `adjust`            | Adjust                                                           | Le bouton qui ouvre la règle de luminosité et de contraste                                                                            |
| `adjustmentLevel`   | Brightness +30                                                   | Fonction du nom et de la valeur de -100 à 100, annoncée après avoir déplacé la règle d’Ajuster                                        |
| `adjustUnavailable` | Not available in black and white                                 | La description d’Ajuster en noir et blanc, ce qui le désactive                                                                        |
| `applied`           | Changes applied                                                  | Annoncé quand les changements sont appliqués                                                                                          |
| `apply`             | Apply                                                            | Le bouton qui applique les changements                                                                                                |
| `applyError`        | The changes could not be applied                                 | Affiché quand Appliquer échoue                                                                                                        |
| `brightness`        | Brightness                                                       | Le choix de la luminosité dans Ajuster, et le nom de sa règle                                                                         |
| `cancel`            | Cancel                                                           | Le bouton qui quitte le mode d’édition                                                                                                |
| `cancelTool`        | Cancel this tool                                                 | Le bouton qui ferme un outil et abandonne ses changements                                                                             |
| `confirm`           | Done                                                             | Le bouton qui ferme un outil et garde ses changements                                                                                 |
| `contrast`          | Contrast                                                         | Le choix du contraste dans Ajuster, et le nom de sa règle                                                                             |
| `cornerBottomLeft`  | Bottom left corner                                               | Le nom d’une poignée d’angle                                                                                                          |
| `cornerBottomRight` | Bottom right corner                                              | Le nom d’une poignée d’angle                                                                                                          |
| `cornerKeys`        | Arrow keys move it, 10 times further with Shift. Enter finishes. | La description d’une poignée d’angle : ce que font les touches, et qu’Entrée termine                                                  |
| `cornerMoved`       | Top left corner: 120, 80                                         | Fonction de l’angle et de sa position en pixels de l’image, annoncée après avoir déplacé un angle                                     |
| `cornerSelected`    | Top left corner: tap where it goes                               | Fonction de l’angle, affichée et annoncée après avoir appuyé sur une poignée d’angle, jusqu’à ce qu’un toucher sur l’image la déplace |
| `cornerTopLeft`     | Top left corner                                                  | Le nom d’une poignée d’angle                                                                                                          |
| `cornerTopRight`    | Top right corner                                                 | Le nom d’une poignée d’angle                                                                                                          |
| `crop`              | Crop                                                             | Le bouton Recadrer                                                                                                                    |
| `cropHint`          | Drag the corners                                                 | Ce qu’il faut faire dans Recadrer                                                                                                     |
| `discard`           | Discard                                                          | Le bouton qui confirme la perte des changements                                                                                       |
| `discardQuestion`   | Discard your changes?                                            | La question avant de perdre les changements                                                                                           |
| `download`          | Download                                                         | Le bouton de téléchargement                                                                                                           |
| `edit`              | Edit                                                             | Le bouton qui commence la modification                                                                                                |
| `editBar`           | Editing controls                                                 | Le nom de la barre de modification, pour les lecteurs d’écran                                                                         |
| `editing`           | Editing                                                          | Annoncé quand le mode d’édition commence                                                                                              |
| `finish`            | Clean up                                                         | Le bouton Nettoyer, et le nom de son choix de finition                                                                                |
| `finishGray`        | Gray                                                             | Choisit le gris dans Nettoyer                                                                                                         |
| `finishLevel`       | Sensitivity 50%                                                  | Fonction du pourcentage, annoncée après avoir déplacé la règle de Nettoyer                                                            |
| `finishMono`        | Black and white                                                  | Choisit le noir et blanc dans Nettoyer                                                                                                |
| `finishOriginal`    | Original                                                         | Choisit les tons d’origine dans Nettoyer, ce qui le désactive                                                                         |
| `finishSensitivity` | Sensitivity                                                      | Le nom de la règle de Nettoyer                                                                                                        |
| `fitHeight`         | Fit to height                                                    | Le bouton qui adapte l’image à la hauteur                                                                                             |
| `fitWidth`          | Fit to width                                                     | Le bouton qui adapte l’image à la largeur                                                                                             |
| `flip`              | Flip                                                             | Le bouton Retourner                                                                                                                   |
| `inUse`             | In use                                                           | La description d’Ajuster ou de Nettoyer tant que son réglage s’applique, ce que montre un point                                       |
| `keepEditing`       | Keep editing                                                     | Le bouton qui revient à la modification au lieu de perdre les changements                                                             |
| `loadError`         | The image could not be loaded                                    | Affiché quand l’image ne se charge pas                                                                                                |
| `loading`           | Loading image                                                    | Affiché pendant le chargement de l’image                                                                                              |
| `paper`             | Paper size                                                       | Le nom du choix du format de papier, dans Redresser                                                                                   |
| `paperA4`           | A4                                                               | Choisit A4 dans Redresser                                                                                                             |
| `paperAuto`         | Auto                                                             | Choisit les proportions automatiques dans Redresser                                                                                   |
| `paperCard`         | Card                                                             | Choisit le format d’une carte d’identité ou bancaire dans Redresser                                                                   |
| `paperLetter`       | Letter                                                           | Choisit Lettre US dans Redresser                                                                                                      |
| `perspective`       | Straighten                                                       | Le bouton Redresser                                                                                                                   |
| `perspectiveFound`  | Document found. Check its corners                                | Affiché et annoncé quand Redresser trouve le document                                                                                 |
| `perspectiveHint`   | Drag each corner to a corner of the document                     | Ce qu’il faut faire dans Redresser                                                                                                    |
| `previewError`      | The changes could not be shown                                   | Affiché quand un changement ne peut pas s’afficher                                                                                    |
| `processing`        | Applying changes                                                 | Affiché pendant qu’Appliquer s’exécute                                                                                                |
| `redact`            | Redact                                                           | Le bouton Masquer, et le nom de son choix de couleur                                                                                  |
| `redactAngle`       | Angle 12°                                                        | Fonction de l’angle en degrés, annoncée après avoir tourné la zone de Masquer                                                         |
| `redactArea`        | Area                                                             | La zone de Masquer, qui la déplace en entier                                                                                          |
| `redactBlack`       | Black                                                            | Choisit le noir dans Masquer                                                                                                          |
| `redactHint`        | Drag the area over what to hide                                  | Ce qu’il faut faire dans Masquer                                                                                                      |
| `redactTurn`        | Turn                                                             | La poignée qui tourne la zone de Masquer                                                                                              |
| `redactTurnKeys`    | Arrow keys turn it 1 degree, or 10 with Shift. Enter finishes.   | La description de la poignée qui tourne la zone : ce que font les touches, et qu’Entrée termine                                       |
| `redactWhite`       | White                                                            | Choisit le blanc dans Masquer                                                                                                         |
| `redo`              | Redo                                                             | Le bouton Rétablir                                                                                                                    |
| `rotateLeft`        | Rotate left                                                      | Le bouton de rotation de la barre de modification, et l’un des deux d’une visionneuse en lecture seule                                |
| `rotateRight`       | Rotate right                                                     | L’autre bouton de rotation d’une visionneuse en lecture seule                                                                         |
| `toolbar`           | Image controls                                                   | Le nom de la barre d’outils, pour les lecteurs d’écran                                                                                |
| `undo`              | Undo                                                             | Le bouton Annuler la dernière action                                                                                                  |
| `viewer`            | Image viewer                                                     | Le nom de la zone qui affiche l’image, pour les lecteurs d’écran                                                                      |
| `zoomIn`            | Zoom in                                                          | Le bouton Zoom avant, dans la barre d’outils et dans les panneaux de Recadrer et de Redresser                                         |
| `zoomLevel`         | Zoom 150%                                                        | Fonction du pourcentage, annoncée après un zoom depuis la barre d’outils ou le clavier                                                |
| `zoomOut`           | Zoom out                                                         | Le bouton Zoom arrière, dans la barre d’outils et dans les panneaux de Recadrer et de Redresser                                       |
