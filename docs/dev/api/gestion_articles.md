# Gestion des articles

L'API propose deux espaces :

- `/api/articles` pour les visiteurs : consultation publique ;
- `/api/admin/articles` pour les utilisateurs authentifiés : CRUD complet.

Pour les routes `/api/admin`, il faut envoyer :

```http
Authorization: Bearer votre-jwt
```

Les requêtes JSON utilisent aussi :

```http
Content-Type: application/json
```

## Format d'un article

```json
{
  "id": 1,
  "title": "Comprendre les sauvegardes",
  "slug": "comprendre-les-sauvegardes",
  "content": "Le contenu de l'article...",
  "authorId": 2,
  "createdAt": "2026-11-11T20:00:00.000Z",
  "updatedAt": "2026-11-11T20:00:00.000Z",
  "author": {
    "id": 2,
    "name": "Yseult"
  }
}
```

Le champ `slug` doit contenir seulement des lettres minuscules, des chiffres et
des tirets. Exemple : `mon-premier-article`. Lors de la création, il peut être
omis : l'API le génère automatiquement à partir du titre. Si le slug généré
existe déjà, un suffixe numérique lui est ajouté.

## Consultation publique

### Lister les articles — `GET /api/articles`

Réponse : `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Comprendre les sauvegardes",
      "slug": "comprendre-les-sauvegardes",
      "content": "Le contenu de l'article...",
      "authorId": 2,
      "createdAt": "2026-11-11T20:00:00.000Z",
      "updatedAt": "2026-11-11T20:00:00.000Z",
      "author": {
        "id": 2,
        "name": "Yseult"
      }
    }
  ]
}
```

Les articles sont renvoyés du plus récent au plus ancien.

### Consulter un article — `GET /api/articles/:id`

Exemple :

```text
GET /api/articles/1
```

`id` doit être un entier positif.

Réponse : `200 OK`, avec un objet article dans `data`.

Si l'article n'existe pas, l'API renvoie `404 Not Found` :

```json
{
  "success": false,
  "message": "Article non trouvé !"
}
```

## Gestion authentifiée

Toutes les routes suivantes commencent par `/api/admin` et demandent un JWT
valide.

### Lister les articles — `GET /api/admin/articles`

Cette route renvoie la même liste que la route publique.

### Consulter un article — `GET /api/admin/articles/:id`

Cette route renvoie le même article que la route publique, mais elle demande
un JWT.

### Créer un article — `POST /api/admin/articles`

Le body attendu est :

```json
{
  "title": "Comprendre les sauvegardes",
  "content": "Le contenu de l'article..."
}
```

Le champ `slug` est facultatif. Lorsqu'il est absent, il est généré à partir du
`title` (par exemple `comprendre-les-sauvegardes`). `authorId` ne doit pas être
envoyé. Il est pris depuis le JWT de l'utilisateur connecté.

Réponse : `201 Created`, avec l'article créé dans `data`.

Si le slug existe déjà, l'API renvoie `409 Conflict` :

```json
{
  "success": false,
  "message": "Ce slug est déjà utilisé."
}
```

### Modifier un article — `PATCH /api/admin/articles/:id`

La modification est partielle. On peut envoyer un ou plusieurs champs :

```json
{
  "title": "Comprendre les sauvegardes en entreprise"
}
```

Les champs acceptés sont `title`, `slug` et `content`. Au moins un champ est
nécessaire. La route `PUT /api/admin/articles/:id` utilise le même format.

Réponse : `200 OK`, avec l'article modifié dans `data`.

### Supprimer un article — `DELETE /api/admin/articles/:id`

Cette requête n'a pas de body.

Réponse : `204 No Content`. Il n'y a pas de JSON à lire.

## Erreurs communes

Sans token, ou avec un token invalide :

```json
{
  "success": false,
  "message": "Token d'authentification manquant ou invalide."
}
```

Code HTTP : `401 Unauthorized`.

Pour un body invalide, le code est `422` :

```json
{
  "success": false,
  "message": "Données de requête invalides.",
  "errors": [
    {
      "field": "slug",
      "message": "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets."
    }
  ]
}
```

Un identifiant invalide renvoie `400 Bad Request`.
