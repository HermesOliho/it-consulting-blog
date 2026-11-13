# API du blog IT Consulting

Bienvenue dans la partie backend du blog ! C’est ici que tout se passe en coulisses : les articles, les utilisateurs, les commentaires, la connexion… bref, la cuisine.

## Ce qu’il faut avant de commencer

- [Node.js](https://nodejs.org/) et `npm`
- Un serveur MySQL en route

## Installation

### 1. Installer les dépendances

Depuis le dossier `apps/api` :

```bash
npm install
```

### 2. Créer la base de données

Un script SQL est disponible à la racine du projet :

```bash
mysql -u <votre_utilisateur> -p < ../../scripts/create_database.sql
```

Par défaut, il crée une base nommée `dev_it_consulting_blog`.

### 3. Configurer les variables d’environnement

L’API lit ses variables dans un fichier `.env.<NODE_ENV>.local` à la racine de `apps/api`. En développement, il s’agit donc de `.env.development.local`.

Exemple :

```env
NODE_ENV=development
PORT=8080
URL_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=votre_mot_de_passe
DB_NAME=dev_it_consulting_blog

JWT_SECRET=une_valeur_secrete_bien_longue
```

> Astuce : vous pouvez générer automatiquement `JWT_SECRET` avec le script prévu à cet effet (voir ci-dessous).

### 4. Générer un secret JWT (optionnel mais pratique)

Depuis la racine du projet :

```bash
./scripts/add-jwt-secret.sh
```

Sous Windows :

```cmd
scripts\add-jwt-secret.cmd
```

Si `JWT_SECRET` n’existe pas encore dans `.env.development.local`, le script en ajoute un pour vous.

## Lancer le serveur en développement

Depuis le dossier `apps/api` :

```bash
npm run dev
```

Et voilà, l’API est prête à travailler.

## Vérifier les types TypeScript

Le projet utilise TypeScript en mode strict (il ne laisse pas passer grand-chose, et c’est tant mieux).

```bash
npm run typecheck
```

Cette commande lance `tsc --noEmit`. Elle ne crée aucun fichier, elle vérifie juste que tout est bien typé. L’idéal, c’est qu’elle passe sans erreur avant de livrer.

## Comment le code est organisé

- `models/` : les modèles Sequelize, qui représentent les tables de la base de données.
- `types/` : les types partagés pour l’API (réponses, DTO, authentification…).
- `validators/` : les schémas Zod qui vérifient les données reçues, avec les types d’entrée associés (`CreateUserInput`, `UpdatePostInput`, etc.).
- `mappers/` : des petites fonctions qui transforment les modèles Sequelize en objets propres pour l’API. Les contrôleurs ne renvoient pas directement les modèles bruts.

Petit détail utile : les dates dans les réponses de l’API sont des chaînes au format ISO, comme dans le JSON envoyé.

## Créer le premier super administrateur

Sur un nouvel environnement, il faut bien commencer par quelqu’un. Ce script crée le premier compte `super_admin`.

> Assurez-vous d’avoir installé les dépendances (`npm install` dans `apps/api`) et configuré votre fichier `.env.development.local` avant de lancer le script.

Depuis la racine du projet :

```bash
./scripts/create-super-admin.sh
```

Sous Windows :

```cmd
scripts\create-super-admin.cmd
```

Le script vous demande un nom, un email et un mot de passe. Pas d’inquiétude : le mot de passe est saisi en mode caché, haché avec Argon2id, et il n’apparaît jamais à l’écran.

### Mode non interactif

Pratique pour l’automatisation, vous pouvez passer les infos via des variables d’environnement :

```bash
SUPER_ADMIN_NAME="Hermès" \
SUPER_ADMIN_EMAIL="admin@example.com" \
SUPER_ADMIN_PASSWORD="un-mot-de-passe-solide" \
./scripts/create-super-admin.sh
```

Les trois variables doivent être fournies ensemble.

### Promouvoir un utilisateur existant

Si l’email est déjà utilisé par un compte qui n’est pas `super_admin`, le script s’arrête pour éviter les mauvaises surprises. Pour le promouvoir volontairement :

```bash
./scripts/create-super-admin.sh --promote-existing
```

Et c’est tout ! Vous avez maintenant un super administrateur prêt à prendre les commandes.
