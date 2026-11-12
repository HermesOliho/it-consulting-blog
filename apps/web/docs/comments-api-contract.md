# Contrat attendu pour les commentaires

Le backend de la branche `develop` n’expose pas encore de routes de commentaires.
Le frontend utilise ces routes quand `VITE_USE_MOCK` n’est pas activé :

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/articles/:articleId/comments` | Public, approuvés uniquement |
| `POST` | `/api/articles/:articleId/comments` | Utilisateur connecté |
| `GET` | `/api/admin/comments?status=pending` | `ADMIN` ou `SUPER_ADMIN` |
| `PATCH` | `/api/admin/comments/:id/approval` | `ADMIN` ou `SUPER_ADMIN` |

Le corps de création est `{ "content": "..." }`. Le serveur doit déterminer
l’auteur depuis la session — ne pas accepter l’identité envoyée par le client —
et enregistrer `isApproved: false` pour un `VISITOR`. Les routes publiques ne
doivent jamais exposer les commentaires non approuvés. La validation admin
marque le commentaire comme approuvé.

Les commentaires publics renvoyés contiennent `id`, `article_id`, `content`,
`created_at`, `isApproved` et `author: { id, name, role, isAgent,
agentBadgeLabel }`. Le libellé d’agent est lu depuis le profil configuré par
l’administration.

## Raccordement à l’authentification

Dans cette branche, `UserRole` est limité à `ADMIN` et `SUPER_ADMIN`; les
comptes visiteurs et leur connexion ne sont pas encore implémentés. L’application
mappe le profil admin existant vers les commentaires. `App` expose aussi la prop
`commentUser` pour permettre au futur module d’auth d’injecter un profil visiteur,
sans modifier son contexte aujourd’hui.

Les badges affichent les données de l’auteur fournies par le backend. Le champ
`isAgent` et son libellé doivent être ajoutés au profil utilisateur par le module
qui gère les utilisateurs avant que leur configuration admin soit disponible.
