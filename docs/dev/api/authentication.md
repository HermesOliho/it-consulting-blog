# Authentification

Cette page explique comment connecter un utilisateur et comment le déconnecter.

## Adresse de l'API

En développement, l'API est disponible sur :

```text
http://localhost:8080
```

Les routes d'authentification commencent par :

```text
/api/auth
```

## Se connecter

### `POST /api/auth/login`

Cette route vérifie l'email et le mot de passe, puis renvoie un JWT.

### Corps attendu

Le corps doit être envoyé en JSON :

```json
{
    "email": "yseult4@gmail.com",
    "password": "mon-mot-de-passe"
}
```

Les deux champs sont obligatoires :

- `email` doit être une adresse email valide ;
- `password` doit être une chaîne non vide ;
- les champs supplémentaires sont refusés.

N'oublie pas l'en-tête :

```http
Content-Type: application/json
```

### Réponse en cas de succès

Code HTTP : `200 OK`

```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Yseult",
            "email": "yseult@gmail.com",
            "createdAt": "2026-11-11T20:00:00.000Z",
            "updatedAt": "2026-11-11T20:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer",
        "expiresIn": 3600
    }
}
```

Le token expire après `3600` secondes, soit une heure. Le front-end doit le
conserver avec soin, puis l'envoyer sur les routes protégées :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Le mot de passe n'est jamais renvoyé dans la réponse.

### Erreurs possibles

#### Données invalides — `422 Unprocessable Entity`

```json
{
    "success": false,
    "message": "Données de connexion invalides.",
    "errors": [
        {
            "field": "email",
            "message": "L'adresse email est invalide."
        }
    ]
}
```

#### Identifiants incorrects — `401 Unauthorized`

```json
{
    "success": false,
    "message": "Email ou mot de passe incorrect."
}
```

#### Erreur serveur — `500 Internal Server Error`

```json
{
    "success": false,
    "message": "Erreur serveur !"
}
```

## Se déconnecter

### `POST /api/auth/logout`

Le logout est actuellement **stateless**. Le serveur ne met pas le JWT sur une
liste noire. Le front-end doit donc supprimer le token de son stockage local.
Le token reste techniquement valide jusqu'à son expiration.

La route demande un token valide :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Réponse en cas de succès

Code HTTP : `200 OK`

```json
{
    "success": true,
    "message": "Déconnexion confirmée. Supprimez le token côté client ; il restera valide jusqu'à son expiration."
}
```

### Token absent ou invalide — `401 Unauthorized`

```json
{
    "success": false,
    "message": "Token d'authentification manquant ou invalide."
}
```

Un token expiré renvoie également une erreur `401`.

## Exemple JavaScript

```js
const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email: "alice@example.com",
        password: "mon-mot-de-passe",
    }),
});

const result = await response.json();

if (result.success) {
    localStorage.setItem("token", result.data.token);
}
```

Pour se déconnecter :

```js
localStorage.removeItem("token");
```
