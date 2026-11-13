# Étape 2 — Consultation et gestion des articles

## Objectif

Compléter les cartes et le CRUD d’articles déjà présents par un catalogue
public filtrable et paginé ainsi qu’une page de lecture individuelle.

## Fichiers concernés

- `apps/web/src/pages/public/ArticlesPage.tsx` et `.css` : catalogue public.
- `apps/web/src/pages/public/ArticleDetailPage.tsx` et `.css` : détail d’un
  article.
- `apps/web/src/api/articles.ts` : appels à l’API publique et adaptation des
  réponses.
- `apps/web/src/mocks/articles.ts` : données et opérations de démonstration.
- `apps/web/src/components/articles/ArticleCard.tsx` et `.css` : carte partagée.
- `apps/web/src/pages/admin/articles/ArticlesAdminPage.tsx` et
  `ArticleEditorPage.tsx` : CRUD admin existant, réalisé dans le travail de
  l’équipe.

## Catalogue public

Route : `/articles`

- Liste les articles par pages de neuf éléments.
- Permet de rechercher par texte et de filtrer par thème.
- Conserve les filtres dans les paramètres URL : `search`, `category` et `page`.
- Affiche des placeholders de chargement, un message d’erreur avec réessai, et
  un état vide lorsqu’aucun résultat ne correspond.
- Les cartes pointent vers `/articles/:id`.

## Détail

Route : `/articles/:id`

- Charge l’article par identifiant numérique.
- Affiche sa catégorie, son titre, son résumé, son auteur, sa date et son contenu.
- Affiche un état de chargement, une erreur avec réessai ou un message si
  l’identifiant est invalide.
- Intègre le composant de commentaires documenté dans
  [l’étape 3](./03-commentaires-et-badges.md).

## CRUD dans l’administration

Le CRUD admin d’articles est déjà présent sur `develop` : liste paginée,
filtrage brouillon/publié, création, modification, publication/dépublication et
suppression. Les pages sont protégées par les routes et le layout admin de
l’application. Cette étape ajoute la consultation publique; elle ne remplace
pas ces pages et ne redéfinit pas leur logique.

## API et mocks

- Les appels réels passent par `apps/web/src/lib/http.ts`, qui préfixe les
  chemins par `/api` par défaut et gère le format JSON de l’API.
- `listArticles` accepte la réponse paginée du frontend et la réponse enveloppée
  `{ success, data }` de l’API actuelle.
- `getArticleById` charge `GET /api/articles/:id`.
- En développement, définir `VITE_USE_MOCK=true` dans `.env.local` pour utiliser
  les données de `src/mocks/articles.ts`.

## Vérification

```bash
cd apps/web
npm run build
npm run lint
```

En mode mock, ouvrir `/articles`, essayer une recherche et un filtre, naviguer
entre les pages disponibles, puis ouvrir une carte.

## Limites connues

L’API actuelle renvoie ses articles sous la forme `{ success, data }` et
identifie le détail avec un ID. Elle n’implémente pas encore toute la pagination
et les filtres utilisés par le catalogue; le frontend normalise la réponse
actuelle, mais une pagination réelle côté serveur nécessitera un contrat backend
compatible.
