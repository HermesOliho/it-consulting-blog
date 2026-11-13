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
            "role": "super_admin",
            "createdAt": "2026-11-11T20:00:00.000Z",
            "updatedAt": "2026-11-11T20:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenType": "Bearer",
        "expiresIn": 3600
    }
}
```

Le token expire après `3600` secondes, soit une heure. Il contient l'identifiant
de l'utilisateur, son email et son rôle. Le front-end doit le conserver avec
soin, puis l'envoyer sur les routes protégées :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Le mot de passe n'est jamais renvoyé dans la réponse.

### Rôles

L'API gère uniquement deux rôles :

- `super_admin` : toutes les permissions, y compris la création, la modification
  et la suppression des utilisateurs ;
- `admin` : gestion complète des articles et modération des commentaires, mais
  aucune création, modification ou suppression d'utilisateur.

Le rôle est renvoyé dans `data.user.role` et inclus dans le JWT. Il est aussi
relu en base à chaque requête protégée : un changement de rôle prend donc effet
immédiatement, sans attendre l'expiration du token.

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

### `POST /api/admin/auth/logout`

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
        email: "yseult@example.com",
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

## Initialiser le premier super administrateur

Sur un nouvel environnement, la création du premier compte `super_admin` se fait
via un script dédié, depuis la racine du projet.

Sous Linux ou macOS :

```bash
./scripts/create-super-admin.sh
```

Sous Windows :

```cmd
scripts\create-super-admin.cmd
```

Le script demande le nom, l'email et le mot de passe avec une saisie masquée. Il
vérifie ensuite les données, hache le mot de passe avec Argon2id et crée le
compte avec le rôle `super_admin`.

Pour une utilisation non interactive :

```bash
SUPER_ADMIN_NAME="Hermès" \
SUPER_ADMIN_EMAIL="admin@example.com" \
SUPER_ADMIN_PASSWORD="mot-de-passe-solide" \
./scripts/create-super-admin.sh
```

Le mot de passe doit contenir au moins 8 caractères. Il n'est jamais affiché
dans la sortie du script.

Si un utilisateur existe déjà avec l'email fourni mais n'est pas `super_admin`,
le script s'arrête pour éviter une modification accidentelle. Pour le promouvoir
explicitement :

```bash
./scripts/create-super-admin.sh --promote-existing
```
