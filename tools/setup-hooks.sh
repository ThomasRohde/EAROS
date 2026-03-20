#!/bin/sh
# Set up git hooks for EAROS development.
# Run once after cloning: sh tools/setup-hooks.sh

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$REPO_ROOT" ]; then
  echo "Error: not inside a git repository"
  exit 1
fi

git config core.hooksPath tools
echo "Git hooks configured — tools/ will be used as the hooks directory."
echo "The pre-commit hook will validate staged YAML files on every commit."
