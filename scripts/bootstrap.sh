#!/usr/bin/env bash
set -euo pipefail

# Basit bootstrap: paketler, pm2, bağımlılıklar
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt -y install nodejs build-essential
fi

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm i -g pm2
fi

# Proje dizinine gir
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")
cd "$ROOT_DIR"

# Bağımlılıkları kur
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

# Log klasörü
mkdir -p logs

# PM2 başlat
pm2 start ecosystem.config.js --env production
pm2 save

echo "Bootstrap tamamlandı. Loglar: pm2 logs hobi-x-api"
