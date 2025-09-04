#!/bin/bash

# Hostinger Advanced Deployment Script
# Bu script gelişmiş deployment özelliklerini içerir

echo "🚀 Hostinger Advanced Deployment"
echo "==============================="

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Konfigürasyon
PROJECT_NAME="hobi-x"
DOMAIN="srv1787.hstgr.io"
DEPLOY_DIR="public_html/$PROJECT_NAME"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Hostinger kontrol paneli üzerinden çalıştırılacak komutlar
echo -e "${YELLOW}📋 Hostinger Terminal Komutları:${NC}"
echo ""
echo "# 1. Yedekleme oluştur"
echo "mkdir -p $BACKUP_DIR"
echo "cp -r $DEPLOY_DIR/* $BACKUP_DIR/ 2>/dev/null || true"
echo ""

echo "# 2. Eski dosyaları temizle"
echo "rm -rf $DEPLOY_DIR"
echo "mkdir -p $DEPLOY_DIR"
echo ""

echo "# 3. Yeni dosyaları aç"
echo "cd $DEPLOY_DIR"
echo "unzip ~/hobi-x-deploy.zip"
echo ""

echo "# 4. Node.js kurulumu kontrolü"
echo "node -v || echo 'Node.js kurulum gerekli'"
echo "npm -v || echo 'NPM kurulum gerekli'"
echo ""

echo "# 5. Bağımlılıkları yükle"
echo "npm install --production"
echo ""

echo "# 6. Environment ayarı"
echo "cp server/.env.production server/.env"
echo ""

echo "# 7. Veritabanı testi"
echo "node server/test-db.js"
echo ""

echo "# 8. PM2 kurulumu ve başlatma"
echo "npm install -g pm2"
echo "pm2 delete $PROJECT_NAME-api 2>/dev/null || true"
echo "pm2 start ecosystem.config.js --env production"
echo "pm2 save"
echo "pm2 startup"
echo ""

echo "# 9. Sağlık kontrolü"
echo "sleep 3"
echo "curl -s http://localhost:3000/api/v1/games | head -5"
echo ""

echo "# 10. Log kontrolü"
echo "pm2 logs $PROJECT_NAME-api --lines 10"
echo ""

echo -e "${GREEN}✅ Tüm komutları Hostinger terminalinde sırayla çalıştırın${NC}"
echo ""
echo -e "${YELLOW}📊 Deployment sonrası kontrol:${NC}"
echo "• pm2 list - Uygulama çalışıyor mu?"
echo "• pm2 logs $PROJECT_NAME-api - Log'lar temiz mi?"
echo "• curl http://localhost:3000/api/v1/games - API çalışıyor mu?"
echo ""
echo -e "${GREEN}🎉 Deployment tamamlandı!${NC}"
