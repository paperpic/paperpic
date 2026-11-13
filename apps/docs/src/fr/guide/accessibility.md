---
title: Accessibilité
description: Comment PaperPic fonctionne avec le clavier, les lecteurs d’écran et les écrans tactiles, quelles préférences il respecte et ce que votre application doit fournir.
---

# Accessibilité

On lit et on corrige des documents à la souris, au doigt, au clavier ou avec un lecteur d’écran. PaperPic vise le niveau AA des WCAG 2.2, et l’essentiel du travail est intégré. Cette page indique ce qu’il fait et ce que votre application doit ajouter.

## Ce que fournit votre application

- **Une description.** Passez [`alt`](../reference/options#alt), comme « Ticket de caisse du 5 novembre ». Les lecteurs d’écran le lisent comme nom de l’image.
- **Des textes dans la langue de l’utilisateur.** Les lecteurs d’écran annoncent les boutons et les changements, donc traduisez-les avec [`labels`](./labels).
- **Vos propres commandes, le cas échéant.** Avec `toolbar: false`, les boutons que vous créez remplacent ceux intégrés, et ils ont besoin de leurs propres noms et de la prise en charge du clavier.
- **Un focus visible.** Évitez que votre CSS masque le contour de focus de la visionneuse.

## Clavier

Quand la visionneuse a le focus :

| Touche                   | Action                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `+` et `-`               | Zoom avant et arrière                                                              |
| Flèches                  | Déplacer                                                                           |
| `0`                      | Ajuster l’image entière                                                            |
| `Ctrl+Z`                 | Annuler la dernière action                                                         |
| `Ctrl+Maj+Z` ou `Ctrl+Y` | Rétablir                                                                           |
| `Entrée`                 | Valider l’outil ouvert, sinon appliquer les changements                            |
| `Échap`                  | Relâcher un coin sélectionné, fermer l’outil ouvert, sinon annuler les changements |

Sur macOS, `Cmd` fonctionne comme `Ctrl`. Avant d’annuler les changements, `Échap` demande confirmation. Avec `toolbar: false`, il les laisse à votre interface.

- **Barre d’outils et barre de modification.** Tab atteint chaque barre, et dans la barre les flèches passent d’un bouton à l’autre, avec `Début` et `Fin` pour le premier et le dernier.
- **Poignées d’angle.** Avec Recadrer ou Redresser ouvert, Tab passe d’une poignée à l’autre, et les flèches déplacent celle qui a le focus de 1 pixel d’écran, ou de 10 avec Maj.
- **Règles.** Les règles d’Ajuster et de Nettoyer sont des curseurs natifs : les flèches, `Pg préc`, `Pg suiv`, `Début` et `Fin` les déplacent. `Entrée` garde la valeur, comme Terminé, et `Échap` ferme l’outil sans elle.

## Lecteurs d’écran

- L’image a le rôle d’une image, nommée par `alt`. Sans `alt`, les lecteurs d’écran l’ignorent.
- La barre d’outils et la barre de modification ont leur propre nom, comme « Commandes de l’image » et « Commandes de modification ».
- Une annonce signale chaque changement que l’utilisateur ne peut pas voir avec le seul focus : le niveau de zoom, le début du mode d’édition, la position d’un coin déplacé, la valeur d’une règle et le résultat d’Appliquer.
- L’interrupteur de Nettoyer a le rôle d’un interrupteur. Un outil en usage, qu’un point marque à l’écran, est décrit comme « Actif ».

## Écrans tactiles

- Avec `pointer: coarse`, les boutons et les poignées d’angle mesurent au moins 44 pixels.
- Pendant qu’un doigt fait glisser un coin, une loupe montre la zone sous le doigt.
- Un coin se déplace aussi sans faire glisser : appuyez sur sa poignée, puis touchez l’endroit où il va. Cela fonctionne aussi à la souris.
- Tant que l’image est ajustée, un doigt fait défiler la page, donc la visionneuse ne retient personne prisonnier. Une fois zoomée, il déplace l’image.

## Préférences

- **Mouvement réduit.** Avec `prefers-reduced-motion: reduce`, les boutons changent d’état sans transitions.
- **Couleurs forcées.** Dans le contraste élevé de Windows et les autres modes de couleurs forcées, les boutons enfoncés et les actions principales gardent un contour visible.
- **Mode sombre.** Les couleurs suivent le `color-scheme` de votre page, qui peut suivre le système. Voir [Styles](./styling#dark-mode).
