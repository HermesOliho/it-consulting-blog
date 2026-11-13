# Gestion des utilisateurs

Cette page présente les routes disponibles pour gérer les utilisateurs.

## Adresse de l'API

En développement :

```text
http://localhost:8080/api/admin/users
```

Toutes ces routes sont protégées par le middleware d'authentification JWT.
Il faut donc envoyer ce header sur chaque requête :

```http
Authorization: Bearer votre-jwt
```

Sans token, ou avec un token invalide, l'API renvoie `401 Unauthorized`.

Toutes les requêtes avec un corps utilisent :

```http
Content-Type: application/json
```

## Rôles et permissions

L'API gère uniquement deux rôles :

| Rôle          | Gérer les articles | Modérer les commentaires | Lister / consulter les utilisateurs | Créer / modifier / supprimer un utilisateur |
| ------------- | ------------------ | ------------------------ | ----------------------------------- | ------------------------------------------- |
| `super_admin` | Oui                | Oui                      | Oui                                 | Oui                                         |
| `admin`       | Oui                | Oui                      | Oui                                 | Non                                         |

Le rôle est relu en base à chaque requête protégée. Un changement de rôle prend
donc effet immédiatement, sans attendre l'expiration du JWT.

Lorsqu'un utilisateur `admin` tente une opération d'écriture sur un utilisateur,
l'API renvoie `403 Forbidden` :

```json
{
    "success": false,
    "message": "Accès refusé. Permissions insuffisantes."
}
```

### Migration d'une base existante

Le modèle utilise maintenant l'énumération `ENUM('super_admin', 'admin')`. Si la
table `users` existe déjà avec l'ancienne énumération (`admin`, `editor`), il
faut la faire évoluer. Exemple avec MySQL, en conservant temporairement
l'ancienne valeur pour convertir les données :

```sql
-- Si la colonne role n'existe pas encore :
ALTER TABLE users ADD COLUMN role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin';

-- Si elle existe déjà, remplacer la ligne précédente par :
-- ALTER TABLE users MODIFY role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin';

UPDATE users SET role = 'admin' WHERE role = 'editor';
ALTER TABLE users MODIFY role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin';
```

Après la migration, pense à promouvoir au moins un compte en `super_admin` :

```sql
UPDATE users SET role = 'super_admin' WHERE id = 1;
```

## Format d'un utilisateur

L'API renvoie un utilisateur avec ces champs :

```json
{
    "id": 1,
    "name": "Yseult",
    "email": "yseult@example.com",
    "role": "admin",
    "createdAt": "2026-11-11T20:00:00.000Z",
    "updatedAt": "2026-11-11T20:00:00.000Z"
}
```

Le champ `password` n'est jamais renvoyé. Il est haché avec Argon2id avant
d'être enregistré.

## Lister les utilisateurs

### `GET /api/admin/users`

### Réponse

Code HTTP : `200 OK`

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Yseult",
            "email": "yseult@example.com",
            "role": "admin",
            "createdAt": "2026-11-11T20:00:00.000Z",
            "updatedAt": "2026-11-11T20:00:00.000Z"
        }
    ]
}
```

## Consulter un utilisateur

### `GET /api/admin/users/:id`

Exemple :

```text
GET /api/admin/users/1
```

`id` doit être un entier positif.

### Réponse

Code HTTP : `200 OK`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Yseult",
        "email": "yseult@example.com",
        "role": "admin",
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

### `POST /api/admin/users`

> Cette route sert actuellement à créer un utilisateur. Il n'y a pas de route
> publique `/register` dans l'authentification, donc un utilisateur
> ne peut pas créer son propre compte.

### Corps attendu

```json
{
    "name": "Yseult",
    "email": "yseult@example.com",
    "password": "mon-mot-de-passe",
    "role": "admin"
}
```

Règles :

- `name` est obligatoire et ne doit pas être vide ;
- `email` est obligatoire et doit être valide ;
- `password` est obligatoire et ne doit pas être vide ;
- `role` est facultatif et vaut `admin` par défaut. Les valeurs acceptées sont
  uniquement `super_admin` et `admin` ;
- les champs supplémentaires sont refusés ;
- les espaces autour de `name` et `email` sont retirés ;
- le mot de passe n'est pas conservé en clair.

Seul un utilisateur `super_admin` peut appeler cette route.

### Réponse

Code HTTP : `201 Created`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Yseult",
        "email": "yseult@example.com",
        "role": "admin",
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

### `PATCH /api/admin/users/:id`

La route `PUT /api/admin/users/:id` est aussi disponible et utilise le même format.
La modification est partielle : on peut envoyer un seul champ ou plusieurs.

### Corps attendu

Exemple avec un seul champ :

```json
{
    "name": "Yseult"
}
```

Exemple avec plusieurs champs :

```json
{
    "name": "Yseult",
    "email": "yseult@example.com",
    "password": "nouveau-mot-de-passe",
    "role": "super_admin"
}
```

Au moins un champ doit être envoyé. Les champs possibles sont `name`, `email`,
`password` et `role`. Les valeurs acceptées pour `role` sont uniquement
`super_admin` et `admin`. Les champs supplémentaires sont refusés.

Seul un utilisateur `super_admin` peut appeler cette route.

### Réponse

Code HTTP : `200 OK`

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Yseult",
        "email": "yseult@example.com",
        "role": "admin",
        "createdAt": "2026-11-11T20:00:00.000Z",
        "updatedAt": "2026-11-11T20:15:00.000Z"
    }
}
```

Les erreurs possibles sont les mêmes que pour la consultation :

- `400` ou `422` si l'identifiant ou le body est invalide ;
- `403` si l'utilisateur connecté n'est pas `super_admin` ;
- `404` si l'utilisateur n'existe pas ;
- `409` si le nouvel email est déjà utilisé ;
- `500` en cas de problème serveur.

## Supprimer un utilisateur

### `DELETE /api/admin/users/:id`

Exemple :

```text
DELETE /api/admin/users/1
```

Cette requête n'a pas de body. Seul un utilisateur `super_admin` peut appeler
cette route ; un `admin` reçoit `403 Forbidden`.

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
