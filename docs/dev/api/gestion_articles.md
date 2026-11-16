# Gestion des articles

L'API propose deux espaces :

- `/api/articles` pour les visiteurs : consultation publique ;
- `/api/admin/articles` pour les utilisateurs authentifiés : CRUD complet.

Pour les routes `/api/admin`, il faut envoyer :

```http
Authorization: Bearer votre-jwt
Content-Type: application/json
```

## Format d'un article

```json
{
  "id": 1,
  "title": "Comprendre les sauvegardes",
  "slug": "comprendre-les-sauvegardes",
  "excerpt": "Résumé court de l'article",
  "content": "Le contenu de l'article...",
  "coverImage": null,
  "cover_image": null,
  "status": "PUBLISHED",
  "publishedAt": "2026-11-11T20:00:00.000Z",
  "published_at": "2026-11-11T20:00:00.000Z",
  "authorId": 2,
  "categoryId": 1,
  "createdAt": "2026-11-11T20:00:00.000Z",
  "created_at": "2026-11-11T20:00:00.000Z",
  "updatedAt": "2026-11-11T20:00:00.000Z",
  "updated_at": "2026-11-11T20:00:00.000Z",
  "author": { "id": 2, "name": "Yseult" },
  "category": {
    "id": 1,
    "name": "Infrastructure",
    "slug": "infrastructure",
    "description": null,
    "createdAt": "2026-11-10T10:00:00.000Z",
    "updatedAt": "2026-11-10T10:00:00.000Z"
  }
}
```

Notes :
- `slug` : lettres minuscules, chiffres et tirets. Généré depuis le titre si omis à la création (suffixe en cas de collision).
- `status` : `DRAFT` ou `PUBLISHED` (défaut `DRAFT` à la création).
- Les champs date/image sont exposés en camelCase et en snake_case pour compatibilité frontend.
- `category` peut être `null` si aucun rattachement.

## Consultation publique

### Lister les articles — `GET /api/articles`

Supporte la **pagination**, la **recherche**, le **filtrage** et le **tri**.

Paramètres de requête :

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `page` | entier ≥ 1 | `1` | Page courante |
| `limit` | entier 1..50 | `10` | Taille de page |
| `search` (ou `q`) | string | — | Recherche texte (titre, slug, extrait, contenu) |
| `category` | string | — | Slug de catégorie (ou id numérique) |
| `sort` (ou `sortBy`) | enum | `createdAt` | `createdAt`, `updatedAt`, `publishedAt`, `title`, `status` |
| `order` | `asc` \| `desc` | `desc` | Ordre de tri |

Comportement public : seuls les articles `PUBLISHED` sont retournés.

Réponse : `200 OK`

```json
{
  "success": true,
  "data": [ /* articles */ ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Consulter un article — `GET /api/articles/:id`

Retourne un article publié (`200 OK`, objet dans `data`). Un brouillon ou un id inexistant renvoie `404`.

## Commentaires d'un article

- `GET /api/articles/:postId/comments` : commentaires approuvés
- `POST /api/articles/:postId/comments` : commentaire visiteur
- `POST /api/admin/articles/:postId/comments` : commentaire membre authentifié

Voir [Gestion des commentaires](./gestion_commentaires.md).

## Gestion authentifiée (admin)

Routes sous `/api/admin/articles`, réservées aux rôles `super_admin` et `admin`.

### Lister les articles — `GET /api/admin/articles`

Mêmes paramètres que la route publique, avec en plus :

| Paramètre | Type | Description |
|---|---|---|
| `status` | `DRAFT` \| `PUBLISHED` | Filtrer par statut (tous par défaut) |
| `authorId` | entier | Filtrer par auteur |
| `categoryId` | entier | Filtrer par id de catégorie |

Retourne tous les statuts (brouillons inclus) selon les filtres, avec la même enveloppe paginée `data` + `meta`.

### Consulter un article — `GET /api/admin/articles/:id`

Accès aux brouillons et publiés.

### Créer un article — `POST /api/admin/articles`

Body (champs principaux) :

```json
{
  "title": "Comprendre les sauvegardes",
  "content": "Le contenu de l'article...",
  "slug": "comprendre-les-sauvegardes",
  "excerpt": "Résumé court",
  "coverImage": "https://...",
  "status": "DRAFT",
  "publishedAt": null,
  "categoryId": 1
}
```

- `authorId` est ignoré/interdit côté client : il est déduit du JWT.
- `slug` optionnel (généré si absent).
- `status` optionnel (`DRAFT` par défaut). Si `PUBLISHED` sans `publishedAt`, la date est fixée automatiquement.
- `categoryId` optionnel (`null` pour détacher). La catégorie doit exister si fournie.
- Les alias snake_case `cover_image`, `category_id`, `published_at` sont acceptés en entrée.

Réponse : `201 Created` avec l'article dans `data`.
Conflits/erreurs : `409` slug déjà utilisé, `422` catégorie introuvable ou données invalides.

### Modifier un article — `PATCH /api/admin/articles/:id` (ou `PUT`)

Body partiel (au moins un champ). Champs acceptés : `title`, `slug`, `excerpt`, `content`, `coverImage`/`cover_image`, `status`, `publishedAt`/`published_at`, `categoryId`/`category_id`.

Réponse : `200 OK` avec l'article modifié.

### Changer le statut — `PATCH /api/admin/articles/:id/status`

```json
{ "status": "PUBLISHED" }
```

Publie ou repasse en brouillon (réinitialise `publishedAt` en brouillon, renseigne une date si publication sans date). Réponse : `200 OK`.

### Supprimer un article — `DELETE /api/admin/articles/:id`

Réponse : `204 No Content`.

## Catégories

La gestion et la consultation des catégories (et le filtrage des articles par catégorie) sont documentées dans [Gestion des catégories](./gestion_categories.md).

## Erreurs communes

- `400` : identifiant invalide / paramètres invalides.
- `401` : token manquant ou invalide.
- `403` : permissions insuffisantes.
- `404` : article non trouvé (ou non publié côté public).
- `409` : slug déjà utilisé.
- `422` : données de requête invalides.

```json
{
  "success": false,
  "message": "Données de requête invalides.",
  "errors": [
    { "field": "slug", "message": "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets." }
  ]
}
```

## Note de migration

Les champs `excerpt`, `status`, `publishedAt`, `coverImage` et `categoryId` ont été ajoutés au modèle `Post`, ainsi que la table `categories`. Selon l'état de la base, appliquer une migration/synchronisation contrôlée (`sequelize.sync({ alter: true })` ponctuel en développement ou script SQL) pour créer les colonnes/tables avant utilisation.
