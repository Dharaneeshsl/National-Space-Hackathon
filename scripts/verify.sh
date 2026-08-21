#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f .venv/bin/activate ]]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

python -m py_compile $(git ls-files 'backend/**/*.py')
PYTHONPATH=backend pytest -q

pushd frontend >/dev/null
npm ci --no-audit --no-fund
npm run typecheck
npm run build
popd >/dev/null

echo "ACM verification passed."
