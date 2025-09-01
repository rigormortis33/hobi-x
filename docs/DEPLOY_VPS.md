# VPS Kurulum ve Dağıtım Rehberi (Ubuntu 22.04+)

Aşağıdaki örnekler `srv971310.hstgr.cloud (72.60.36.213)` KVM 2 için yazılmıştır.

## 1) Sistem Güncelleme ve Gerekli Paketler
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install curl git ufw
```

## 2) Node.js (LTS) Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt -y install nodejs build-essential
node -v && npm -v
```

## 3) PM2 Kurulumu
```bash
sudo npm i -g pm2
pm2 -v
```

## 4) Projeyi Sunucuya Alma
```bash
# SSH ile bağlanın
ssh ubuntu@72.60.36.213

# Klasör oluşturun
mkdir -p ~/apps && cd ~/apps

# Repo/zip nasıl geliyorsa alın (örnek: scp ile kopyalayın)
# scp -r ./Hobi-X ubuntu@72.60.36.213:~/apps/

cd ~/apps/Hobi-X
npm ci || npm install
```

## 5) .env Hazırlama
`server/.env.example` dosyasını `server/.env` olarak kopyalayıp doldurun.

Önemli ortam değişkenleri:
- PORT=3000 (veya 8080)
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET, JWT_EXPIRES_IN

## 6) Güvenlik Duvarı
```bash
sudo ufw allow OpenSSH
sudo ufw allow 3000/tcp
# Eğer Nginx kullanılacaksa 80 ve 443 açın
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## 7) PM2 ile Çalıştırma
```bash
# İlk başlatma
pm2 start ecosystem.config.js --env production

# Loglar
pm2 logs hobi-x-api --lines 50

# Boot'ta otomatik başlatma
pm2 startup
pm2 save
```

## 8) Nginx (Opsiyonel, Reverse Proxy)
```bash
sudo apt -y install nginx
sudo tee /etc/nginx/sites-available/hobi-x.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_pass http://127.0.0.1:3000;
    }

    location /health {
        proxy_pass http://127.0.0.1:3000/health;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/hobi-x.conf /etc/nginx/sites-enabled/hobi-x.conf
sudo nginx -t && sudo systemctl reload nginx
```

## 9) Sağlık Kontrolü
```bash
curl -s http://127.0.0.1:3000/health | jq .
```

## 10) Sorun Giderme
- `pm2 logs`
- `journalctl -u nginx -e`
- DB erişimi: Uzak MySQL IP yetkisi verildi mi? Port doğru mu? TLS gereksinimi var mı?
- Sunucu saat/dil ayarı: `timedatectl`, `locale` (UTF-8)
