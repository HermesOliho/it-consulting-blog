# Gestion des utilisateurs

Cette page présente les routes disponibles pour gérer les utilisateurs.

## Adresse de l'API

En développement :

```text
http://localhost:8080/api/users
```

> Pour le moment, ces routes ne contiennent pas encore le middleware
> d'authentification JWT. Elles sont donc accessibles sans en-tête
> `Authorization`. Cela pourra être renforcé plus tard.

Toutes les requêtes avec un corps utilisent :

```http
Content-Type: application/json
```

## Format d'un utilisateur

L'API renvoie un utilisateur avec ces champs :

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2026-11-11T20:00:00.000Z",
  "updatedAt": "2026-11-11T20:00:00.000Z"
}
```

Le champ `password` n'est jamais renvoyé. Il est haché avec Argon2id avant
d'être enregistré.

## Lister les utilisateurs

### `GET /api/users`

### Réponse

Code HTTP : `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "createdAt": "2026-11-11T20:00:00.000Z",
      "updatedAt": "2026-11-11T20:00:00.000Z"
    }
  ]
}
```

## Consulter un utilisateur

### `GET /api/users/:id`

Exemple :

```text
GET /api/users/1
```

`id` doit être un entier positif.

### Réponse

Code HTTP : `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "2026-11-11T20:00:00.000Z",
    "updatedAt": "2026-11-11T20:00:00.000Z"
  }
}
```

### Erreurs

Identifiant incorrect — `400 Bad Request` :

```json
{
  "success": false,
  "message": "Données de requête invalides.",
  "errors": [
    {
      "field": "id",
      "message": "Identifiant invalide."
    }
  ]
}
```

Utilisateur absent — `404 Not Found` :

```json
{
  "success": false,
  "message": "Utilisateur non trouvé !"
}
```

## Créer un utilisateur

### `POST /api/users`

> Cette route sert actuellement à créer un utilisateur. Il n'y a pas de route
> publique `/register` dans l'authentification, mais cette route de gestion
> existe encore.

### Corps attendu

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "mon-mot-de-passe"
}
```

Règles :

- `name` est obligatoire et ne doit pas être vide ;
- `email` est obligatoire et doit être valide ;
- `password` est obligatoire et ne doit pas être vide ;
- les champs supplémentaires sont refusés ;
- les espaces autour de `name` et `email` sont retirés ;
- le mot de passe n'est pas conservé en clair.

### Réponse

Code HTTP : `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "2026-11-11T20:00:00.000Z",
    "updatedAt": "2026-11-11T20:00:00.000Z"
  }
}
```

Email déjà utilisé — `409 Conflict` :

```json
{
  "success": false,
  "message": "Cette adresse email est déjà utilisée."
}
```

Données invalides — `422 Unprocessable Entity` :

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

## Modifier un utilisateur

### `PATCH /api/users/:id`

La route `PUT /api/users/:id` est aussi disponible et utilise le même format.
La modification est partielle : on peut envoyer un seul champ ou plusieurs.

### Corps attendu

Exemple avec un seul champ :

```json
{
  "name": "Alice Martin"
}
```

Exemple avec plusieurs champs :

```json
{
  "name": "Alice Martin",
  "email": "alice.martin@example.com",
  "password": "nouveau-mot-de-passe"
}
```

Au moins un champ doit être envoyé. Les champs possibles sont `name`, `email`
et `password`. Les champs supplémentaires sont refusés.

### Réponse

Code HTTP : `200 OK`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Martin",
    "email": "alice.martin@example.com",
    "createdAt": "2026-11-11T20:00:00.000Z",
    "updatedAt": "2026-11-11T20:15:00.000Z"
  }
}
```

Les erreurs possibles sont les mêmes que pour la consultation :

- `400` si l'identifiant ou le body est invalide ;
- `404` si l'utilisateur n'existe pas ;
- `409` si le nouvel email est déjà utilisé ;
- `500` en cas de problème serveur.

## Supprimer un utilisateur

### `DELETE /api/users/:id`

Exemple :

```text
DELETE /api/users/1
```

Cette requête n'a pas de body.

### Réponse

Succès — code HTTP : `204 No Content`.

Il n'y a donc pas de JSON à lire dans la réponse.

Utilisateur absent — `404 Not Found` :

```json
{
  "success": false,
  "message": "Utilisateur non trouvé !"
}
```

## Erreur serveur générale

Les erreurs inattendues renvoient généralement :

```json
{
  "success": false,
  "message": "Erreur serveur !"
}
```

Le front-end peut donc tester `response.ok`, puis lire `success`, `data` ou
`message` selon le cas.
