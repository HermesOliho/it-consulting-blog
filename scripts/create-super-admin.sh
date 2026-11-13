#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
api_dir="$project_root/apps/api"

if [[ ! -d "$api_dir/node_modules" ]]; then
    printf 'Erreur : les dépendances de l’API ne sont pas installées.\n' >&2
    printf 'Exécutez d’abord : cd apps/api && npm install\n' >&2
    exit 1
fi

cd "$api_dir"
exec npm run create-super-admin -- "$@"
