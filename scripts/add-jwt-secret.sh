#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$project_root/apps/api/.env.development.local"

mkdir -p "$(dirname "$env_file")"

if [[ -f "$env_file" ]] && grep -q '^JWT_SECRET=' "$env_file"; then
    printf 'JWT_SECRET existe déjà dans %s\n' "$env_file"
    exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
    printf 'Erreur : openssl est requis pour générer JWT_SECRET.\n' >&2
    exit 1
fi

jwt_secret="$(openssl rand -hex 32)"
printf '\nJWT_SECRET=%s\n' "$jwt_secret" >> "$env_file"
printf 'JWT_SECRET a été ajouté dans %s\n' "$env_file"
