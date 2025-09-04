#!/usr/bin/env bash
set -euo pipefail

# Kullanım: scripts/deploy.sh <ssh_user>@<host> [remote_dir]
# Ör: scripts/deploy.sh root@72.60.36.213 /root/apps/Hobi-X

if [ ${#} -lt 1 ]; then
  echo "Kullanim: $0 <ssh_user>@<host> [remote_dir]" >&2
  exit 1
fi

TARGET=$1
USER=$(echo "$TARGET" | cut -d@ -f1)
REMOTE_DIR=${2:-/root/apps/Hobi-X}
if [ "$USER" != "root" ]; then
  REMOTE_DIR=${2:-/home/$USER/apps/Hobi-X}
fi

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")

# Sunucuda klasörleri hazırla
ssh -v -o StrictHostKeyChecking=accept-new -o PubkeyAuthentication=no -o PasswordAuthentication=yes "$TARGET" "mkdir -p '$REMOTE_DIR' '$REMOTE_DIR/logs'"

# Kodları rsync ile aktar (env hariç)
rsync -avz --delete \
  --exclude-from="$SCRIPT_DIR/deploy-exclude.txt" \
  -e "ssh -o PubkeyAuthentication=no -o PasswordAuthentication=yes" \
  "$ROOT_DIR/" "$TARGET:$REMOTE_DIR/"

# Sunucuda kurulum ve PM2
ssh -o PubkeyAuthentication=no -o PasswordAuthentication=yes "$TARGET" bash -s <<EOSSH
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt -y install nodejs build-essential
  else
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt -y install nodejs build-essential
  fi
fi

if ! command -v pm2 >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1; then
    sudo npm i -g pm2
  else
    npm i -g pm2
  fi
fi

cd "$REMOTE_DIR"
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

mkdir -p logs
pm2 start ecosystem.config.js --env production || pm2 restart hobi-x-api
pm2 save
EOSSH

echo "Deploy tamamlandı: $TARGET -> $REMOTE_DIR"
