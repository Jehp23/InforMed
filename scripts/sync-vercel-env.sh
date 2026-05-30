#!/usr/bin/env bash
# Sincroniza variables de .env local → Vercel (production + preview).
# Uso: ./scripts/sync-vercel-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Falta .env — copiá .env.example y completá PRIVATE_KEY y GROQ_API_KEY."
  exit 1
fi

if ! command -v vercel >/dev/null; then
  echo "Instalá Vercel CLI: npm i -g vercel"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

sync_var() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "⊘ $name vacío — omitido"
    return
  fi
  for env in production preview; do
    vercel env add "$name" "$env" --value "$value" --yes --force --sensitive
  done
  echo "✓ $name → production, preview"
}

echo "Sincronizando env a Vercel ($(vercel whoami 2>/dev/null || echo '?'))…"
sync_var PRIVATE_KEY
sync_var GROQ_API_KEY
[[ -n "${GROQ_MODEL:-}" ]] && sync_var GROQ_MODEL
[[ -n "${OPENAI_API_KEY:-}" ]] && sync_var OPENAI_API_KEY
[[ -n "${OPENAI_MODEL:-}" ]] && sync_var OPENAI_MODEL
echo "Listo."
