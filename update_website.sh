#!/data/data/com.termux/files/usr/bin/bash

set -e

cd "$HOME/downloads/HUSH_TECH_PUBLIC/hush_tech_academy" || exit 1

echo "Checking website changes..."

git status

echo "Adding changes..."
git add .

if git diff --cached --quiet; then
    echo "No new changes to upload."
    exit 0
fi

echo "Saving changes..."
git commit -m "Update HUSH TECH Academy website"

echo "Uploading changes to GitHub..."
git push origin main

echo "Success! GitHub has received your update."
echo "Render should deploy automatically if Auto-Deploy is enabled."
