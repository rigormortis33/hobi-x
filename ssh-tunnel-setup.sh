# SSH Tunneling ile MySQL Bağlantısı
# Bu script SSH tunneling kurarak MySQL'e güvenli bağlantı sağlar

#!/bin/bash

# SSH Tunneling ayarları
SSH_HOST="srv1787.hstgr.io"  # MySQL sunucusu
SSH_USER="u588148465"       # SSH kullanıcı adı (genellikle MySQL kullanıcı adıyla aynı)
SSH_PORT="22"               # SSH port (varsayılan 22)
LOCAL_PORT="3307"           # Yerel makinede kullanılacak port
REMOTE_HOST="127.0.0.1"     # Uzak sunucudaki MySQL host (localhost)
REMOTE_PORT="3306"          # Uzak sunucudaki MySQL port

echo "SSH Tunneling başlatılıyor..."
echo "SSH Host: $SSH_HOST"
echo "SSH User: $SSH_USER"
echo "Local Port: $LOCAL_PORT"
echo "Remote MySQL: $REMOTE_HOST:$REMOTE_PORT"

# SSH anahtar kontrolü (varsa)
SSH_KEY=""
if [ -f ~/.ssh/id_rsa ]; then
    SSH_KEY="-i ~/.ssh/id_rsa"
    echo "SSH anahtarı bulundu: ~/.ssh/id_rsa"
fi

# Tunneling komutu
TUNNEL_CMD="ssh $SSH_KEY -L $LOCAL_PORT:$REMOTE_HOST:$REMOTE_PORT -N $SSH_USER@$SSH_HOST -p $SSH_PORT"

echo ""
echo "Tunneling komutu:"
echo "$TUNNEL_CMD"
echo ""
echo "Bu komut ile:"
echo "- Yerel port $LOCAL_PORT, uzak MySQL sunucusuna yönlendirilecek"
echo "- Bağlantı güvenli SSH üzerinden kurulacak"
echo "- MySQL bağlantısı için host: 127.0.0.1, port: $LOCAL_PORT kullanın"
echo ""
echo "Tunneling'i başlatmak için yukarıdaki komutu çalıştırın."
echo "Arka planda çalıştırmak için: $TUNNEL_CMD &"
echo ""
echo "Test bağlantısı için:"
echo "mysql -h 127.0.0.1 -P $LOCAL_PORT -u u588148465_hobix -p u588148465_tuncay"
