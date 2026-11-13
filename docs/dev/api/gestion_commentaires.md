# Gestion des commentaires

L'API permet aux visiteurs de commenter les articles et aux utilisateurs
authentifiés (`super_admin` et `admin`) de modérer les commentaires.

## Règles de visibilité

- Un commentaire publié par un visiteur est créé avec `approved: false`.
- Il n'apparaît sur les routes publiques qu'après approbation par un admin.
- Les routes d'administration renvoient **tous** les commentaires, approuvés ou
  non.
- Un utilisateur authentifié qui commente est identifié comme **membre**. Son
  commentaire est automatiquement approuvé.
- L'email d'un visiteur n'est jamais renvoyé par les routes publiques. Il est
  visible uniquement côté admin.

## Adresse de l'API

En développement :

```text
http://localhost:8080
```

Les routes publiques des commentaires d'un article commencent par :

```text
/api/articles/:postId/comments
```

Les routes de modération commencent par :

```text
/api/admin/comments
```

Toutes les routes `/api/admin` demandent un JWT valide :

```http
Authorization: Bearer votre-jwt
```

Les requêtes avec un corps utilisent :

```http
Content-Type: application/json
```

## Format d'un commentaire public

```json
{
    "id": 12,
    "postId": 3,
    "content": "Très bon article.",
    "authorType": "visitor",
    "name": "Yseult",
    "author": null,
    "createdAt": "2026-11-13T10:00:00.000Z"
}
```

Pour un commentaire membre :

```json
{
    "id": 13,
    "postId": 3,
    "content": "Merci pour ce retour.",
    "authorType": "member",
    "name": "Hermès",
    "author": {
        "id": 1,
        "name": "Hermès"
    },
    "createdAt": "2026-11-13T11:00:00.000Z"
}
```

Le champ `authorType` vaut `visitor` ou `member`. Le front-end peut s'en servir
pour afficher la mention « membre ». `name` contient le nom du visiteur ou un
snapshot du nom du membre au moment du commentaire.

## Routes publiques

### Lister les commentaires approuvés — `GET /api/articles/:postId/comments`

Exemple :

```text
GET /api/articles/3/comments
```

Réponse : `200 OK`.

```json
{
    "success": true,
    "data": [
        {
            "id": 12,
            "postId": 3,
            "content": "Très bon article.",
            "authorType": "visitor",
            "name": "Yseult",
            "author": null,
            "createdAt": "2026-11-13T10:00:00.000Z"
        }
    ]
}
```

Seuls les commentaires approuvés sont renvoyés, du plus récent au plus ancien.
Aucun email, aucun `approved` et aucun `authorId` brut n'est exposé.

Si l'article n'existe pas, l'API renvoie `404 Not Found` :

```json
{
    "success": false,
    "message": "Article non trouvé !"
}
```

### Publier un commentaire — `POST /api/articles/:postId/comments`

Cette route est publique et ne demande pas de JWT.

Corps attendu :

```json
{
    "name": "Yseult",
    "email": "yseult@example.com",
    "content": "Très bon article."
}
```

Règles :

- `name` est obligatoire, trimé, entre 1 et 100 caractères ;
- `email` est obligatoire, valide et limité à 150 caractères ;
- `content` est obligatoire, trimé, entre 1 et 5 000 caractères ;
- les champs supplémentaires sont refusés ;
- `approved`, `postId` et `authorId` ne peuvent pas être fournis.

Réponse : `201 Created`.

```json
{
    "success": true,
    "message": "Commentaire envoyé. Il sera visible après approbation.",
    "data": {
        "id": 12,
        "postId": 3,
        "content": "Très bon article.",
        "authorType": "visitor",
        "name": "Yseult",
        "author": null,
        "createdAt": "2026-11-13T10:00:00.000Z"
    }
}
```

Le commentaire n'est pas encore visible publiquement. Il faut qu'un admin
l'approuve.

## Routes d'administration

Les routes suivantes sont accessibles aux deux rôles `super_admin` et `admin`.

### Format admin

```json
{
    "id": 12,
    "postId": 3,
    "content": "Très bon article.",
    "approved": false,
    "authorType": "visitor",
    "name": "Yseult",
    "email": "yseult@example.com",
    "author": null,
    "createdAt": "2026-11-13T10:00:00.000Z",
    "updatedAt": "2026-11-13T10:00:00.000Z"
}
```

Pour un commentaire membre, `email` correspond à l'email du compte. Si le compte
a été supprimé, `author` vaut `null`, l'email aussi, mais `authorType` reste
`member` et `name` conserve le nom enregistré lors du commentaire.

### Lister tous les commentaires — `GET /api/admin/comments`

Deux filtres optionnels sont disponibles :

```text
GET /api/admin/comments?postId=3
GET /api/admin/comments?approved=false
GET /api/admin/comments?postId=3&approved=false
```

Réponse : `200 OK`, avec un tableau de commentaires au format admin.
Les commentaires sont renvoyés du plus récent au plus ancien.

### Consulter un commentaire — `GET /api/admin/comments/:id`

Réponse : `200 OK`, avec le commentaire au format admin.

Commentaire absent — `404 Not Found` :

```json
{
    "success": false,
    "message": "Commentaire non trouvé !"
}
```

### Approuver ou désapprouver un commentaire — `PATCH /api/admin/comments/:id`

Corps attendu :

```json
{
    "approved": true
}
```

`approved` est obligatoire et doit être un booléen. Le champ permet d'approuver
(`true`) ou de désapprouver (`false`) un commentaire. Aucun autre champ n'est
accepté.

Réponse : `200 OK`, avec le commentaire mis à jour au format admin.

### Supprimer un commentaire — `DELETE /api/admin/comments/:id`

Cette requête n'a pas de body.

Réponse : `204 No Content`. Il n'y a pas de JSON à lire.

## Commenter en tant que membre

### `POST /api/admin/articles/:postId/comments`

Cette route demande un JWT valide et est accessible aux deux rôles
`super_admin` et `admin`.

Corps attendu :

```json
{
    "content": "Merci pour ce retour."
}
```

Règles :

- `content` est obligatoire, trimé, entre 1 et 5 000 caractères ;
- `name` et `email` sont refusés ;
- `authorId` est pris depuis le JWT ;
- `authorType` vaut toujours `member` ;
- `name` est un snapshot du nom de l'utilisateur connecté ;
- le commentaire est automatiquement approuvé.

Réponse : `201 Created`, avec le commentaire au format admin.

Si l'article n'existe pas, l'API renvoie `404 Not Found`.

## Erreurs communes

Sans token, ou avec un token invalide sur une route admin :

```json
{
    "success": false,
    "message": "Token d'authentification manquant ou invalide."
}
```

Code HTTP : `401 Unauthorized`.

Avec un rôle non autorisé :

```json
{
    "success": false,
    "message": "Accès refusé. Permissions insuffisantes."
}
```

Code HTTP : `403 Forbidden`.

Pour un body invalide, le code est `422` :

```json
{
    "success": false,
    "message": "Données de requête invalides.",
    "errors": [
        {
            "field": "email",
            "message": "L'adresse email est invalide."
        }
    ]
}
```

Un identifiant invalide ou un filtre invalide renvoie `400 Bad Request`.

## Intégrité des données

- La suppression d'un article supprime automatiquement ses commentaires.
- La suppression d'un utilisateur conserve ses commentaires : `authorId` passe
  à `NULL`, mais le commentaire reste identifié comme `member`.
- La table `comments` est créée automatiquement au démarrage par
  `syncModels()`. Aucune modification des tables existantes n'est nécessaire.
