#!/bin/bash

# Hostinger VPS Production Setup Script
# Bu script Hostinger'da projeyi production ortamına kurar

echo "🚀 Hostinger VPS Production Kurulumu Başlıyor..."
echo "=============================================="

# Renk tanımları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hata durumunda çıkış
set -e

# Mevcut dizini kontrol et
CURRENT_DIR=$(pwd)
echo -e "${GREEN}📁 Mevcut dizin: $CURRENT_DIR${NC}"

# Node.js kontrolü
echo -e "${YELLOW}🔍 Node.js kontrol ediliyor...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı!${NC}"
    echo "Hostinger kontrol panelinden Node.js kurulumunu kontrol edin."
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ NPM: $NPM_VERSION${NC}"

# Proje dizinine git
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Proje dosyaları mevcut${NC}"
else
    echo -e "${RED}❌ package.json bulunamadı!${NC}"
    echo "Doğru dizinde olduğunuzdan emin olun."
    exit 1
fi

# Bağımlılıkları yükle
echo -e "${YELLOW}📦 Bağımlılıklar yükleniyor...${NC}"
npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bağımlılıklar başarıyla yüklendi${NC}"
else
    echo -e "${RED}❌ Bağımlılık yükleme hatası!${NC}"
    exit 1
fi

# Environment dosyasını kontrol et
echo -e "${YELLOW}🔧 Environment dosyası kontrol ediliyor...${NC}"
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✅ .env dosyası mevcut${NC}"
else
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı, production ayarları kullanılıyor${NC}"
    if [ -f "server/.env.production" ]; then
        cp server/.env.production server/.env
        echo -e "${GREEN}✅ Production .env dosyası kopyalandı${NC}"
    else
        echo -e "${RED}❌ Production .env dosyası da bulunamadı!${NC}"
        exit 1
    fi
fi

# Veritabanı bağlantısını test et
echo -e "${YELLOW}🗄️  Veritabanı bağlantısı test ediliyor...${NC}"
node server/test-db.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Veritabanı bağlantısı başarılı${NC}"
else
    echo -e "${RED}❌ Veritabanı bağlantı hatası!${NC}"
    echo "MySQL ayarlarını kontrol edin."
    exit 1
fi

# Logs dizini oluştur
echo -e "${YELLOW}📝 Logs dizini oluşturuluyor...${NC}"
mkdir -p logs

# PM2 kontrolü
echo -e "${YELLOW}⚙️  PM2 kontrol ediliyor...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 mevcut${NC}"

    # Mevcut hobi-x process'ini durdur
    pm2 delete hobi-x-api 2>/dev/null || true

    # PM2 ile başlat
    pm2 start ecosystem.config.js --env production
    pm2 save

    echo -e "${GREEN}✅ PM2 ile uygulama başlatıldı${NC}"
    echo -e "${YELLOW}📊 PM2 durumu:${NC}"
    pm2 list
else
    echo -e "${YELLOW}⚠️  PM2 bulunamadı, normal başlatma kullanılıyor${NC}"

    # Background'da başlat
    nohup node server/app.js > logs/app.log 2>&1 &
    APP_PID=$!

    echo -e "${GREEN}✅ Uygulama PID: $APP_PID ile başlatıldı${NC}"
    echo $APP_PID > app.pid
fi

# Sağlık kontrolü
echo -e "${YELLOW}🏥 Sağlık kontrolü yapılıyor...${NC}"
sleep 3

# Port kontrolü
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Sunucu çalışıyor${NC}"
    else
        echo -e "${RED}❌ Sunucu yanıt vermiyor${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl bulunamadı, port kontrolü yapılamıyor${NC}"
fi

echo ""
echo "🎉 Kurulum tamamlandı!"
echo "===================="
echo ""
echo -e "${GREEN}📋 Özet:${NC}"
echo "• Node.js: $NODE_VERSION"
echo "• NPM: $NPM_VERSION"
echo "• Port: 3000"
echo "• Environment: Production"
echo ""
echo -e "${YELLOW}🔗 API Endpoint'leri:${NC}"
echo "• http://localhost:3000/api/v1/games"
echo "• http://localhost:3000/api/v1/auth"
echo ""
echo -e "${YELLOW}📝 Log dosyaları:${NC}"
echo "• logs/app.log"
echo "• PM2 logs: pm2 logs hobi-x-api"
echo ""
echo -e "${GREEN}✅ Kurulum başarılı!${NC}"
