# Gestion des catégories

L'API expose les catégories d'articles via :

- `/api/categories` : consultation publique ;
- `/api/admin/categories` : gestion authentifiée (CRUD).

Les routes `/api/admin/*` nécessitent :

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

Rôles autorisés pour l'administration des catégories : `super_admin`, `admin`.

## Format d'une catégorie

```json
{
  "id": 1,
  "name": "Cybersécurité",
  "slug": "cybersecurite",
  "description": "Articles sur la sécurité informatique",
  "createdAt": "2026-11-16T10:00:00.000Z",
  "updatedAt": "2026-11-16T10:00:00.000Z"
}
```

- `slug` : lettres minuscules, chiffres et tirets (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).
- Si `slug` est omis à la création, il est généré à partir de `name` (avec suffixe numérique en cas de collision).
- `description` est optionnelle (`string` ou `null`).

## Routes publiques

### Lister les catégories — `GET /api/categories`

Réponse : `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cybersécurité",
      "slug": "cybersecurite",
      "description": null,
      "createdAt": "2026-11-16T10:00:00.000Z",
      "updatedAt": "2026-11-16T10:00:00.000Z"
    }
  ]
}
```

### Consulter une catégorie — `GET /api/categories/:id`

`id` doit être un entier positif. Réponse : `200 OK` avec la catégorie dans `data`, ou `404` si introuvable.

## Routes admin

### Créer une catégorie — `POST /api/admin/categories`

Body :

```json
{
  "name": "Cybersécurité",
  "slug": "cybersecurite",
  "description": "Articles sur la sécurité informatique"
}
```

`slug` et `description` sont optionnels. Réponse : `201 Created`.

Conflit de slug : `409 Conflict` avec `message: "Ce slug de catégorie est déjà utilisé."`

### Modifier une catégorie — `PATCH /api/admin/categories/:id` (ou `PUT`)

Body partiel (au moins un champ parmi `name`, `slug`, `description`) :

```json
{
  "name": "Sécurité"
}
```

Réponse : `200 OK` avec la catégorie mise à jour.

### Supprimer une catégorie — `DELETE /api/admin/categories/:id`

Réponse : `204 No Content`. Les articles associés voient leur `categoryId` remis à `null` (`ON DELETE SET NULL`).

## Erreurs

- `400` : identifiant invalide
- `401` : token manquant/invalide
- `403` : permissions insuffisantes
- `404` : catégorie non trouvée
- `409` : slug déjà utilisé
- `422` : données de requête invalides (format Zod, avec `errors`)
