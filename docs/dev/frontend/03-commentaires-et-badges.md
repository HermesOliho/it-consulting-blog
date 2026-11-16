# Étape 3 — Commentaires, badges et modération

## Objectif

Afficher les commentaires publics approuvés, permettre à un utilisateur
d’en soumettre un et fournir à l’administration une file de
modération.

## Fichiers

- `apps/web/src/types/comments.ts` : identité, rôle et forme d’un commentaire.
- `apps/web/src/api/comments.ts` : client des routes de commentaires.
- `apps/web/src/mocks/comments.ts` : commentaires d’exemple et comportements
  simulés.
- `apps/web/src/hooks/useArticleComments.ts` et `usePendingComments.ts` :
  chargement des commentaires publics et en attente.
- `apps/web/src/components/comments/CommentSection.tsx` et `.css` : liste et
  formulaire sous un article.
- `apps/web/src/components/comments/UserBadge.tsx` : badge selon le profil.
- `apps/web/src/pages/admin/comments/CommentsAdminPage.tsx` et `.css` :
  approbation des commentaires.
- `apps/web/src/App.tsx` : routes de l’article et de modération.
- `apps/web/src/components/layout/AdminLayout.tsx` : entrée « Commentaires ».

## Parcours public

Sur `/articles/:id`, le composant affiche uniquement les commentaires dont
`isApproved` est vrai. Un visiteur peut commenter sans compte en indiquant son
nom et son email; le backend enregistre alors son commentaire comme non approuvé.
Un administrateur connecté envoie seulement `{ content }` avec sa session, et
son commentaire est publié immédiatement.

Les badges distinguent :

- `ADMIN` ou `SUPER_ADMIN` : badge « Admin » ;
- visiteur avec `isAgent: true` : libellé `agentBadgeLabel`, ou « Agent » si le
  libellé n’est pas défini ;
- visiteur standard : badge « Visiteur ».

## Modération

Route : `/admin/comments`

Le lien est affiché dans le layout d’administration. La route est sous
`ProtectedRoute`; la page limite aussi son rendu à `ADMIN` ou `SUPER_ADMIN`.
L’administrateur consulte les commentaires en attente et peut les approuver.

Ces gardes frontend améliorent l’interface, mais les autorisations doivent
également être vérifiées sur chaque route par le backend.

## Mode de démonstration

Quand `VITE_USE_MOCK=true` en développement :

- les commentaires d’exemple sont chargés depuis `src/mocks/comments.ts` ;
- le mock marque les commentaires des `VISITOR` en attente ;
- le mock permet à l’administration d’approuver un commentaire.

Le mock est en mémoire : ses changements ne sont pas persistants après le
redémarrage de l’application.

## Contrat API et limites

`src/api/comments.ts` adapte le DTO backend (`postId`, `approved`,
`authorType`, `createdAt`) au modèle frontend (`article_id`, `isApproved`,
`created_at`). Les routes réelles sont :

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/articles/:postId/comments` | Public, commentaires approuvés uniquement |
| `POST` | `/api/articles/:postId/comments` | Public, `{ name, email, content }`, en attente |
| `POST` | `/api/admin/articles/:postId/comments` | Admin connecté, `{ content }`, publié |
| `GET` | `/api/admin/comments?approved=false` | `ADMIN` ou `SUPER_ADMIN` |
| `PATCH` | `/api/admin/comments/:id` | `ADMIN` ou `SUPER_ADMIN`, `{ approved: true }` |

Le contexte d’authentification actuel ne connaît que `ADMIN` et `SUPER_ADMIN`;
la connexion VISITOR n’est pas fournie. Les visiteurs peuvent toutefois
commenter via le parcours public anonyme de l’API. `App` expose une prop
optionnelle `commentUser` pour qu’un autre module puisse injecter une identité
visiteur.

Le DTO et le modèle backend ne renvoient pas encore les champs agent
(`isAgent`, `agentBadgeLabel`). L’interface sait afficher ces champs lorsqu’ils
sont fournis (notamment par les mocks), mais le badge agent ne peut pas être
déterminé de manière fiable avec les données API actuelles. La gestion de ces
champs dépend du module utilisateurs et n’est pas modifiée ici.

## Vérification

```bash
cd apps/web
npm run build
npm run lint
```

En mode mock, ouvrir un article existant, vérifier qu’un commentaire approuvé
est visible, puis se connecter à l’administration et ouvrir `/admin/comments`
pour tester l’approbation du commentaire en attente.
