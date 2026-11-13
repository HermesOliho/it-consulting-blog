# Étape 1 — Hero de la page d’accueil

## Objectif

Présenter le blog aux visiteurs avec un message de bienvenue visible, une
recherche d’articles et un accès direct au catalogue, tout en conservant les
autres sections de la page d’accueil.

## Fichiers

- `apps/web/src/components/home/HeroSection.tsx` : contenu, animation et recherche.
- `apps/web/src/components/home/HeroSection.css` : fond et styles du Hero.
- `apps/web/src/pages/public/HomePage.tsx` : affiche le Hero avant les sections
  existantes.
- `apps/web/src/pages/public/HomePage.css` : styles des sections d’accueil,
  dont les derniers articles et les thèmes.

## Fonctionnement

- Le Hero affiche « bienvenue » et le message « Installez-vous, il y a toujours
  quelque chose à découvrir ».
- Framer Motion anime l’apparition du contenu. `useReducedMotion` respecte le
  réglage de réduction des animations du système.
- Le formulaire transforme le terme saisi en paramètre `search` de la page
  `/articles`. Une recherche vide ouvre le catalogue sans filtre.
- Le lien « Ou parcourez tous les articles » ouvre également `/articles`.
- Le Hero est suivi par les sections de la page d’accueil déjà présentes :
  derniers articles, thèmes et invitation à participer.

## Vérification

Depuis `apps/web` :

```bash
npm run build
npm run lint
```

Le parcours visuel peut être vérifié à `/`. Tester le champ de recherche avec
un terme et avec une valeur vide.

## Limites

Le Hero ne remplace pas « Quoi de neuf » ni les derniers articles. Ces sections
restent rendues par `HomePage.tsx` et conservent leur chargement via
`listArticles` et `listCategories`.
