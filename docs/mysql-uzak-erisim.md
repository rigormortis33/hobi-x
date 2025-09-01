# Hostinger MySQL Uzak Erişim Rehberi

## Sorun
"Access denied for user" hatası aldığınız için, MySQL sunucunuz uzak IP adresinden gelen bağlantılara izin vermiyor.

## Çözüm Adımları

### 1. Hostinger Kontrol Paneline Giriş
1. Hostinger hesabınıza giriş yapın
2. "Hosting" veya "Websiteleriniz" bölümüne gidin
3. İlgili domain veya hosting paketini seçin

### 2. MySQL Veritabanları Bölümüne Erişim
1. Sol menüden "Gelişmiş" kategorisine tıklayın
2. "Veritabanları" seçeneğine tıklayın

### 3. Uzak MySQL Erişimini Yapılandırma
1. "Uzak MySQL" sekmesine tıklayın
2. IP adresinizi ekleyin: `72.60.36.213`
3. Açılır listeden veritabanını seçin: `u588148465_tuncay`
4. "Oluştur" butonuna tıklayın
5. Eğer "%' (wildcard - tüm IP'ler)" seçeneği varsa, onu da deneyebilirsiniz

### 4. Kullanıcı İzinlerini Kontrol Etme
1. "phpMyAdmin" veya "MySQL" bölümüne gidin
2. `mysql.user` tablosunu kontrol edin (eğer erişiminiz varsa)
3. `u588148465_hobix` kullanıcısının izinlerinin '%' host için verildiğinden emin olun

### 5. Doğru Port Numarasını Kullanma
1. MySQL'in varsayılan portu 3306'dır, ancak Hostinger farklı bir port kullanıyor olabilir
2. Hosting kontrol panelinizde MySQL bağlantı detaylarını kontrol edin ve port numarasını not alın

### 6. Veritabanı Bağlantı Bilgilerini Doğrulama
1. Hostinger kontrol panelinde veritabanınızın detaylarına gidin
2. Kullanıcı adı, şifre, veritabanı adı ve host bilgilerini kontrol edin
3. Tüm bilgilerin projenizdeki değerlerle eşleştiğinden emin olun

### 7. Yeni Bir MySQL Kullanıcısı Oluşturma (Opsiyonel)
1. "MySQL" veya "Veritabanları" bölümünden yeni bir MySQL kullanıcısı oluşturun
2. Bu kullanıcıya uzak erişim izni verin
3. Bu yeni kullanıcıyı projenizdeki bağlantı ayarlarında kullanın

## Test Etme
Yukarıdaki adımları tamamladıktan sonra, test betiğini tekrar çalıştırın:
```
node server/test-db.js
```

## Alternatif Çözüm
Eğer uzak MySQL'e bağlanamazsanız, phpMyAdmin arayüzünü kullanarak veritabanı şemasını oluşturabilirsiniz.
