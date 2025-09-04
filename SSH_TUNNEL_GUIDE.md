# SSH Tunneling Adım Adım Rehber

## 1. SSH Anahtarı Kontrolü
```bash
# SSH anahtarınız var mı kontrol edin
ls -la ~/.ssh/

# Yoksa oluşturun
ssh-keygen -t rsa -b 4096 -C "hobi-x-connection"

# Public key'i Hostinger'a yükleyin
cat ~/.ssh/id_rsa.pub
```

## 2. SSH Bağlantısı Testi
```bash
# Temel SSH bağlantı testi
ssh u588148465@srv1787.hstgr.io

# Anahtar ile bağlantı testi
ssh -i ~/.ssh/id_rsa u588148465@srv1787.hstgr.io
```

## 3. SSH Tunneling Kurulumu

### Yöntem 1: Manuel Komut
```bash
# Terminal'de şu komutu çalıştırın
ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io

# Arka planda çalıştırmak için
ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io &
```

### Yöntem 2: Otomatik Script
```bash
# Hazırladığımız script'i kullanın
./ssh-tunnel-setup.sh

# Script çıktısındaki komutu çalıştırın
```

## 4. MySQL Bağlantısı Testi

### Terminal ile Test
```bash
# Tunnel aktifken MySQL'e bağlanın
mysql -h 127.0.0.1 -P 3307 -u u588148465_hobix -p u588148465_tuncay
```

### Node.js ile Test
```bash
# Hazırladığımız test script'ini çalıştırın
node server/ssh-tunnel-test.js
```

## 5. .env Dosyası Güncelleme

SSH Tunneling çalışırsa .env dosyanızı şöyle güncelleyin:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=u588148465_hobix
DB_PASSWORD=Deneme-33
DB_NAME=u588148465_tuncay
```

## 6. Uygulama Başlatma

```bash
# Server'ı başlatın
npm start

# Veya development modunda
npm run dev
```

## 7. Sorun Giderme

### SSH Bağlantı Problemleri
```bash
# SSH debug modu
ssh -v u588148465@srv1787.hstgr.io

# Port kontrolü
ssh -p 22 u588148465@srv1787.hstgr.io
```

### Tunnel Problemleri
```bash
# Port kullanımını kontrol edin
netstat -tlnp | grep 3307

# Tunnel'ı durdurun
pkill -f "ssh.*3307"

# Yeniden başlatın
ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io &
```

### Güvenlik Notları
- SSH anahtarınızı güvenli tutun
- Şifre yerine anahtar kullanın
- Gerekli olmadığında tunnel'ı kapatın
- Firewall ayarlarınızı kontrol edin

## 8. Otomatik Başlatma (Opsiyonel)

Tunnel'ı sistem başlangıcında otomatik başlatmak için:

```bash
# Cron job ekleyin
crontab -e

# Aşağıdaki satırı ekleyin
@reboot ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io &
```
