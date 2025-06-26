#!/usr/bin/bash
git add .
commit_message=${1:-"updates to codebase"}
git commit -m "$commit_message"
git push -f origin master
if [ $? -eq 0 ]; then
    echo "Changes committed and pushed successfully."
else
    echo "Failed to commit or push changes."
fi
