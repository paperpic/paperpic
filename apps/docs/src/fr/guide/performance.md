---
title: Performances et compatibilité
description: Où PaperPic fait son travail, ce que demandent les bundlers, la Content Security Policy et le rendu côté serveur, comment il traite les grandes photos de téléphone et quels navigateurs il prend en charge.
---

# Performances et compatibilité

Les photos de téléphone font 12 mégapixels ou plus, et les modifier demande un vrai travail. Cette page explique où ce travail s’exécute, ce dont votre build et votre serveur ont besoin, et quels navigateurs PaperPic prend en charge.

## Un Web Worker fait le travail

Le noir et blanc et Redresser prennent environ une seconde et demie sur une photo de 12 mégapixels avec un téléphone récent, comme le montrent les [temps mesurés](#measurements). Sur le thread principal, la page se figerait aussi longtemps. PaperPic les exécute donc dans un Web Worker, et la page reste réactive pendant l’application des modifications. La recherche du document s’y fait aussi.

Le worker est livré dans le paquet et démarre avec le standard `new Worker(new URL(…, import.meta.url))`, que des bundlers comme Vite et webpack 5 prennent en charge seuls, sans configuration. Si le worker ne peut pas démarrer, la modification s’exécute sur le thread principal : elle fonctionne toujours, mais la page peut se figer un instant avec de grandes images.

## Content Security Policy

Avec une Content Security Policy, autorisez :

- `worker-src 'self'`, pour le worker.
- `img-src blob:`, car la visionneuse affiche les fichiers joints et les résultats appliqués par des URL `blob:`.
- `paperpic` dans `trusted-types`, si votre politique limite les politiques Trusted Types, car les icônes des boutons passent par cette politique.
- Une politique Trusted Types `default` dont `createScriptURL` accepte l’URL du worker, si votre politique exige Trusted Types. Les bundlers ne prennent en charge qu’un worker créé avec une URL simple, que Trusted Types bloque : sans cette politique, la modification s’exécute donc sur le thread principal.

## Grandes photos

- **Pendant la modification**, l’aperçu travaille sur une copie d’environ 2 mégapixels, donc les règles et les outils restent fluides avec n’importe quelle photo.
- **À l’application**, chaque changement est calculé en pleine résolution. Les grandes photos prennent quelques secondes, donc la visionneuse affiche un message et bloque les commandes pendant ce temps.
- **Pour gagner du temps et de la mémoire**, utilisez [`maxOutputSize`](../reference/options#maxoutputsize). Une limite comme 2000 ou 3000 pixels garde les documents lisibles, accélère l’application des modifications et réduit la taille des fichiers.

## Temps mesurés {#measurements}

Chaque étape de l’application des modifications, dans le worker, sur un Pixel 10 Pro avec Chrome 156 :

| Étape                       | 2 MP   | 12 MP  | 37,5 MP |
| --------------------------- | ------ | ------ | ------- |
| Noir et blanc               | 256 ms | 1,5 s  | 4,8 s   |
| Redresser                   | 251 ms | 1,6 s  | 5,0 s   |
| Export en PNG               | 92 ms  | 378 ms | 979 ms  |
| Export en JPEG, qualité 0,9 | 33 ms  | 142 ms | 525 ms  |

- Un mouvement de la réglette de Nettoyer prend environ 40 ms sur le même téléphone, car il travaille sur l’aperçu d’environ 2 MP.
- Un ordinateur de bureau à 8 cœurs fait chaque étape environ six fois plus vite.
- À 37,5 MP, le noir et blanc a besoin d’environ 340 Mo de mémoire au plus fort.
- Les Android de milieu de gamme et les iPhone ne sont pas encore mesurés.

## Rendu côté serveur

PaperPic a besoin d’un navigateur. Les composants Vue et React rendent un élément vide sur le serveur, comme dans Nuxt ou Next.js, et créent la visionneuse dans le navigateur. Avec le cœur, créez vous-même la visionneuse dans le navigateur, par exemple au montage de votre composant.

## Navigateurs pris en charge

PaperPic prend en charge les navigateurs de [Baseline Widely Available](https://web.dev/baseline) : les fonctionnalités qui marchent dans tous les grands navigateurs depuis au moins 30 mois. Les paquets sont compilés pour cette cible, soit Chrome et Edge 124, Firefox 125 et Safari 17.5 ou plus récents, donc inutile de les transpiler.
