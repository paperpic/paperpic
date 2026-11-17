---
title: Dépannage
description: Que faire quand la visionneuse PaperPic n’a ni hauteur ni styles, que Tailwind CSS la modifie, qu’une image ne se charge pas ou ne peut pas être modifiée, que la page se fige pendant Appliquer ou qu’une grande photo échoue.
---

# Dépannage

La plupart des problèmes avec PaperPic viennent de sa mise en place, et non de l’image. Cherchez ce que vous voyez, et la solution est juste en dessous.

## La visionneuse est une fine bande, ou ne s’affiche pas {#no-height}

La visionneuse remplit son conteneur, et un conteneur sans hauteur se réduit à la hauteur minimale de la visionneuse, 16rem. Donnez une hauteur au conteneur, comme `height: 480px`, ou une place dans une mise en page flex ou grid qui lui en donne une. [Styles](./styling) montre les deux.

## Les boutons n’ont pas de style, et la console avertit {#no-stylesheet}

La console affiche `PaperPic: the stylesheet is missing, so the viewer has no layout.` Importez la feuille de style une fois dans votre application : `@paperpic/core/style.css`, ou le `style.css` de `@paperpic/vue` ou de `@paperpic/react`.

## Tailwind CSS retire les bordures et les marges intérieures de la visionneuse {#tailwind}

Le reset de Tailwind CSS 4 l’emporte sur la feuille de style de PaperPic quand les couches de la cascade arrivent dans le mauvais ordre. Nommez les couches avant d’importer les deux, comme le montre [Styles](./styling#tailwind).

## L’image s’affiche, mais la modifier échoue {#other-origin}

L’[`error`](../reference/events#error) indique que l’image vient d’une autre origine. Les navigateurs ne laissent pas PaperPic lire les pixels d’une telle image. Récupérez-la vous-même et passez le `Blob`, comme le montre [Charger des images](./loading#fetch).

## L’image ne se charge pas {#load-error}

La visionneuse indique que l’image n’a pas pu être chargée, et `error` porte `phase: 'load'`. Vérifiez que l’URL existe et que le navigateur ouvre le format : HEIC ne s’ouvre que dans Safari, et un SVG a besoin des attributs `width` et `height`. [Charger des images](./loading#formats) liste les formats.

## La page se fige pendant Appliquer {#worker}

Le worker n’a pas démarré, donc la modification s’exécute sur le thread principal. Elle fonctionne, mais les grandes photos figent la page un instant. Les causes habituelles sont :

- Une Content Security Policy sans `worker-src 'self'`, ou une qui exige Trusted Types sans policy `default`. [Performances et compatibilité](./performance) liste ce qu’il faut autoriser.
- Le paquet chargé depuis un CDN, d’une autre origine que la page. Les navigateurs ne démarrent un worker que depuis l’origine de la page.

Le panneau réseau du navigateur montre si la page a demandé le fichier du worker, dont le nom commence par `worker`.

## Appliquer échoue avec une grande photo {#too-large}

L’`error` indique `The browser could not read an image of …`, ou `could not save an image of …`. Les navigateurs limitent la taille d’un canvas, et Safari sur iOS plus que les autres. Définissez [`maxOutputSize`](../reference/options#maxoutputsize), par exemple à 3000 pixels, ce qui garde les documents lisibles.

## La molette zoome dans l’image au lieu de faire défiler la page {#wheel}

Définissez [`wheelZoom: false`](../reference/options#wheelzoom). Les boutons, le clavier et le pincement zooment toujours.
