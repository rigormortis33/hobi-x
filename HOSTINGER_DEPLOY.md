# Hostinger VPS Dağıtım Rehberi

## 🚀 Hızlı Dağıtım Adımları

### 1. Dosyaları Hostinger'a Yükleme
```bash
# Proje dosyalarını zipleyin
zip -r hobi-x-deploy.zip . -x "node_modules/*" ".git/*" "*.log"

# Hostinger File Manager'a yükleyin
# Veya FTP/SFTP ile public_html/hobi-x/ klasörüne yükleyin
```

### 2. Hostinger'da Terminal Erişimi
```bash
# Hostinger kontrol panelinden terminal açın
# Veya SSH ile bağlanın (eğer aktifse)
ssh u588148465@srv1787.hstgr.io
```

### 3. Production Kurulumu
```bash
# Proje dizinine gidin
cd public_html/hobi-x

# Node.js sürümünü kontrol edin
node -v
npm -v

# Bağımlılıkları yükleyin
npm install --production

# Environment dosyasını kopyalayın
cp server/.env.production server/.env

# Veritabanı bağlantısını test edin
node server/test-db.js

# Sunucuyu başlatın
npm start &
```

### 4. PM2 ile Sürekli Çalıştırma (Opsiyonel)
```bash
# PM2 kurun
npm install -g pm2

# Uygulamayı PM2 ile başlatın
pm2 start ecosystem.config.js --env production

# PM2'yi sistem başlangıcına ekleyin
pm2 startup
pm2 save
```

## 🔧 Alternatif Yöntemler

### Yöntem 1: Hostinger Git Deploy
```bash
# Hostinger'da Git repository'yi bağlayın
# Auto-deploy özelliğini aktifleştirin
```

### Yöntem 2: File Manager ile Manuel
1. Dosyaları Hostinger File Manager'a yükleyin
2. Terminal'de komutları çalıştırın
3. .env dosyasını düzenleyin

### Yöntem 3: Hostinger Backup/Restore
```bash
# Mevcut kurulumu yedekleyin
# Yeni dosyaları yükleyin
# Veritabanını güncelleyin
```

## 📋 Kontrol Listesi

- [ ] Dosyalar Hostinger'a yüklendi
- [ ] Node.js ve npm çalışıyor
- [ ] .env dosyası production ayarları ile güncellendi
- [ ] Veritabanı bağlantısı test edildi
- [ ] Sunucu başlatıldı
- [ ] API endpoint'leri erişilebilir
- [ ] Firewall ayarları kontrol edildi

## 🐛 Sorun Giderme

### Port Problemi
```bash
# Hostinger'da kullanılabilecek portlar: 3000, 8080, 5000
# .env dosyasında PORT'u değiştirin
```

### Bellek Problemi
```bash
# Hostinger'da memory limit olabilir
# PM2 ile memory management yapın
pm2 monit
```

### Veritabanı Problemi
```bash
# Remote MySQL ayarlarını tekrar kontrol edin
# IP adresini güncelleyin
```

## 📞 Destek
- Hostinger müşteri desteği
- GitHub issues
- Dokümantasyon: `docs/DEPLOY_VPS.md`
