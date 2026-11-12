---
title: Performances et compatibilité
description: Où PaperPic fait son travail, ce que demandent les bundlers, la Content Security Policy et le rendu côté serveur, comment il traite les grandes photos de téléphone et quels navigateurs il prend en charge.
---

# Performances et compatibilité

Les photos de téléphone font 12 mégapixels ou plus, et les modifier demande un vrai travail. Cette page explique où ce travail s’exécute, ce dont votre build et votre serveur ont besoin, et quels navigateurs PaperPic prend en charge.

## Un Web Worker fait le travail

Nettoyer et Redresser prennent plus d’une seconde sur une photo de 12 mégapixels sur un téléphone. Sur le thread principal, la page se figerait pendant tout ce temps. PaperPic les exécute donc dans un Web Worker, et la page reste réactive pendant qu’Appliquer s’exécute.

Le worker est livré dans le paquet et démarre avec le standard `new Worker(new URL(…, import.meta.url))`, que des bundlers comme Vite et webpack 5 prennent en charge seuls, sans configuration. Si le worker ne peut pas démarrer, la modification s’exécute sur le thread principal : elle fonctionne toujours, mais la page peut se figer un instant avec de grandes images.

## Content Security Policy

Avec une Content Security Policy, autorisez :

- `worker-src 'self'`, pour le worker.
- `img-src blob:`, car la visionneuse affiche les fichiers joints et les résultats d’Appliquer par des URL `blob:`.

## Grandes photos

- **Pendant la modification**, l’aperçu travaille sur une copie d’environ 2 mégapixels, donc les règles et les outils restent fluides avec n’importe quelle photo.
- **À l’application**, chaque changement est calculé en pleine résolution. Les grandes photos prennent quelques secondes, donc la visionneuse affiche un message et bloque les commandes pendant ce temps.
- **Pour gagner du temps et de la mémoire**, utilisez [`maxOutputSize`](../reference/options#maxoutputsize). Une limite comme 2000 ou 3000 pixels garde les documents lisibles, accélère Appliquer et réduit la taille des fichiers.

## Images acceptées

`src` accepte une URL de la même origine que votre page, ou un `File` ou un `Blob` joint côté client. PaperPic lit les pixels de l’image, et les navigateurs ne le permettent pour les images d’autres origines qu’avec CORS, que PaperPic ne demande pas. Servez les images depuis votre propre domaine, ou téléchargez-les vous-même et passez le `Blob`.

## Rendu côté serveur

PaperPic a besoin d’un navigateur. Les composants Vue et React rendent un élément vide sur le serveur, comme dans Nuxt ou Next.js, et créent la visionneuse dans le navigateur. Avec le cœur, créez vous-même la visionneuse dans le navigateur, par exemple au montage de votre composant.

## Navigateurs pris en charge

PaperPic prend en charge les navigateurs de [Baseline Widely Available](https://web.dev/baseline) : les fonctionnalités qui marchent dans tous les grands navigateurs depuis au moins 30 mois. Les paquets sont compilés pour cette cible, soit Chrome et Edge 124, Firefox 125 et Safari 17.5 ou plus récents, donc inutile de les transpiler.
