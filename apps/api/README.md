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
