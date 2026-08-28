#!/usr/bin/env bash
# Script to install agent skills from the project to Antigravity

set -e

AG_SKILLS_DIR="$HOME/.gemini/config/skills"
PROJECT_SKILLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../agent-skills" && pwd)"

echo "Installing Agent Skills to Antigravity..."

mkdir -p "$AG_SKILLS_DIR"

for file in "$PROJECT_SKILLS_DIR"/*.md; do
  if [ -f "$file" ]; then
    filename=$(basename -- "$file")
    skill_name="${filename%.*}"
    
    # Create the skill directory
    target_dir="$AG_SKILLS_DIR/$skill_name"
    mkdir -p "$target_dir"
    
    # Copy the file to SKILL.md
    cp "$file" "$target_dir/SKILL.md"
    echo "✅ Installed: $skill_name"
  fi
done

echo "Done!"
