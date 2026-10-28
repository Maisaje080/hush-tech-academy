#!/data/data/com.termux/files/usr/bin/bash

PROJECT="$HOME/downloads/HUSH_TECH_PUBLIC/hush_tech_academy"
LOG="$PROJECT/auto_upload.log"

cd "$PROJECT" || exit 1

echo "===================================="
echo "HUSH TECH Academy Auto Upload Started"
echo "Watching: $PROJECT"
echo "Press CTRL+C to stop."
echo "===================================="

while true; do
    inotifywait -r -e close_write,create,moved_to,delete \
        --exclude '(^|/)(\.git|\.venv|venv|__pycache__)(/|$)|(^|/)(auto_upload\.log|auto_upload\.sh)$' \
        "$PROJECT"

    sleep 3

    # Stage project changes, respecting .gitignore
    git add -A || {
        echo "ERROR: Could not stage changes."
        continue
    }

    # Stop if there is nothing new to commit
    if git diff --cached --quiet; then
        echo "No new Git changes to upload."
        continue
    fi

    # Create a commit
    git commit -m "Automatic website update: $(date '+%Y-%m-%d %H:%M:%S')" || {
        echo "ERROR: Commit failed."
        continue
    }

    # Upload to GitHub
    if git push origin main; then
        echo "SUCCESS: Changes uploaded to GitHub."
    else
        echo "ERROR: Upload failed. Check your GitHub connection."
    fi
done
