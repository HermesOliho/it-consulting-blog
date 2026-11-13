# IT Consulting BLOG API

Cette API alimente tout le blog.

## Développement

```bash
npm run dev
```

## Vérification des types

Le projet dispose d'une configuration TypeScript stricte dans `tsconfig.json`.

```bash
npm run typecheck
```

Cette commande exécute `tsc --noEmit` et ne génère aucun fichier. Elle doit
passer sans erreur avant chaque livraison.

## Architecture des types

- `models/` contient les modèles Sequelize typés et les types liés à la base.
- `types/` contient les contrats HTTP : réponses génériques, DTO publics et
  types d'authentification.
- `validators/` contient les schémas Zod et exporte les types d'entrée inférés
  (`CreateUserInput`, `UpdatePostInput`, etc.).
- `mappers/` convertit les modèles Sequelize en DTO d'API. Les contrôleurs ne
  renvoient pas directement les instances de modèles.

Les dates des DTO sont des chaînes ISO, conformes au JSON réellement renvoyé.
