# VPS SSH Kurulumu ve Anahtar Oluşturma Rehberi

## SSH Araçlarını Kurma

VPS terminalinde şu komutları çalıştırın:

```bash
# Sistem güncellemelerini kontrol et
apt update

# SSH araçlarını kur
apt install -y openssh-client openssh-server

# SSH servisini başlat
systemctl start ssh
systemctl enable ssh

# SSH durumunu kontrol et
systemctl status ssh
```

## SSH Anahtarı Oluşturma

SSH araçları kurulduktan sonra:

```bash
# SSH anahtarı oluştur (ed25519 algoritması ile)
ssh-keygen -t ed25519 -C "tuncayyilmaz3358@gmail.com"

# Karşılaşacağınız sorular:
# Enter file in which to save the key (/root/.ssh/id_ed25519): [Enter]
# Enter passphrase (empty for no passphrase): [Şifre girebilirsiniz veya boş bırakın]
# Enter same passphrase again: [Şifreyi tekrar girin]

# Anahtarları görüntüle
ls -la ~/.ssh/
cat ~/.ssh/id_ed25519.pub
```

## Anahtarı Yetkilendir

```bash
# Public key'i authorized_keys'e ekle
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# İzinleri ayarla
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# SSH servisini yeniden başlat
systemctl restart ssh
```

## Yerel Makineden Bağlantı Testi

Yerel makinenizde:

```bash
# SSH anahtarını VPS'ye kopyala
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@srv971310.hstgr.io

# Veya manuel olarak
scp ~/.ssh/id_ed25519.pub root@srv971310.hstgr.io:~/.ssh/authorized_keys
```

## Güvenlik Ayarları

VPS'te SSH güvenliğini artırın:

```bash
# SSH konfigürasyonunu düzenle
nano /etc/ssh/sshd_config

# Aşağıdaki ayarları değiştirin:
# Port 22 → Port 2222 (farklı port kullanın)
# PermitRootLogin yes → PermitRootLogin no (root login'i kapatın)
# PasswordAuthentication yes → PasswordAuthentication no (şifre ile login'i kapatın)

# SSH servisini yeniden başlat
systemctl restart ssh
```

## Bağlantı Testi

```bash
# Anahtar ile bağlan
ssh -i ~/.ssh/id_ed25519 root@srv971310.hstgr.io

# Veya farklı port kullanıyorsanız
ssh -i ~/.ssh/id_ed25519 -p 2222 root@srv971310.hstgr.io
```

## Otomatik Bağlantı için Config

Yerel makinenizde `~/.ssh/config` dosyası oluşturun:

```bash
nano ~/.ssh/config

# Aşağıdaki içeriği ekleyin:
Host vps-hobi-x
    HostName srv971310.hstgr.io
    User root
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

## Kullanım

```bash
# Kolay bağlantı
ssh vps-hobi-x

# Dosya transferi
scp dosya.zip vps-hobi-x:~/
rsync -avz ./proje/ vps-hobi-x:~/proje/
```
