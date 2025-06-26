#!/bin/bash

echo "📁 Backing up existing SSH keys..."
mkdir -p ~/.ssh/backup_keys
mv ~/.ssh/id_ed25519* ~/.ssh/backup_keys/ 2>/dev/null

echo "🔐 Generating personal GitHub key (tiifuofficial@gmail.com)..."
ssh-keygen -t ed25519 -C "tiifuofficial@gmail.com" -f ~/.ssh/id_ed25519 -N ""

echo "🔐 Generating work GitHub key (xelobcoder@gmail.com)..."
ssh-keygen -t ed25519 -C "xelobcoder@gmail.com" -f ~/.ssh/id_ed25519_work -N ""

echo "🔄 Starting SSH agent..."
eval "$(ssh-agent -s)"

echo "➕ Adding keys to SSH agent..."
ssh-add ~/.ssh/id_ed25519
ssh-add ~/.ssh/id_ed25519_work

echo "📝 Writing SSH config file..."
cat > ~/.ssh/config <<EOL
# Personal GitHub
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

# Work GitHub
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
EOL

chmod 600 ~/.ssh/config

echo "✅ Setup complete."

echo -e "\n🔑 Copy these SSH public keys to your GitHub accounts:\n"

echo "👉 Personal GitHub (https://github.com/settings/keys):"
cat ~/.ssh/id_ed25519.pub

echo -e "\n👉 Work GitHub (https://github.com/settings/keys):"
cat ~/.ssh/id_ed25519_work.pub

echo -e "\n💡 Remember to clone work repos using 'git@github-work:username/repo.git'"
