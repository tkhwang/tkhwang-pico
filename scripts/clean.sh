#!/usr/bin/env bash
set -euo pipefail

# Ensure the script runs relative to the repository root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

shopt -s nullglob dotglob

declare -a PATTERNS=(
  "node_modules"
  "apps/*/node_modules"
  "apps/*/.next"
  "apps/*/.expo"
  "apps/*/dist"
  "apps/*/build"
  "apps/*/coverage"
  "packages/*/node_modules"
  "packages/*/dist"
  "packages/*/build"
  "packages/*/coverage"
  ".turbo"
  ".expo"
)

if [[ ${#PATTERNS[@]} -eq 0 ]]; then
  echo "[-] No cleanup patterns defined."
  exit 0
fi

CLEANED=false
for pattern in "${PATTERNS[@]}"; do
  for target in $pattern; do
    if [[ -e "$target" ]]; then
      echo "Removing: $target"
      rm -rf "$target"
      CLEANED=true
    fi
  done
done

if [[ "$CLEANED" == false ]]; then
  echo "[*] Nothing to clean."
else
  echo "[+] Cleanup complete."
fi
