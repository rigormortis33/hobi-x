# Hobi-X

Hobi-X, Türkçe kelime ve bulmaca oyunlarını bir araya getiren mobil uygulama platformudur. Uygulama içerisinde çeşitli kelime oyunları ve bulmacalar sunarak kullanıcılara eğlenceli ve eğitici bir deneyim sunar.

## 📱 Oyunlar

- **Kelime Matrisi**: 4x4 harf matrisinde kelimeler bulma oyunu
- **Sudoku**: Klasik sayı bulmaca oyunu
- **Kelime Dedektifi**: Karışık harfler içinden kelime bulma
- **Anagram**: Harfleri yeniden düzenleyerek kelime oluşturma oyunu

*Yakında Gelecek:*
- Adam Asmaca
- Kelime Avı
- Eşleştirme
- 2048
- X-O (Tic-tac-toe)

## 🚀 Başlarken

### Gereksinimler

- Node.js (v14.0.0 veya üstü)
- npm veya yarn
- React Native CLI
- Android Studio veya Xcode (geliştirme için)
- Expo CLI

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/rigormortis33/hobi-x.git

# Proje dizinine gidin
cd hobi-x

# Bağımlılıkları yükleyin
npm install

# Mobil uygulama klasörüne gidin
cd HobiXMobile

# Mobil bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

## 📦 Proje Yapısı

```
hobi-x/
├── HobiXMobile/           # Ana React Native mobil uygulama
│   ├── src/
│   │   ├── components/    # Oyun bileşenleri
│   │   ├── screens/       # Ana ekranlar
│   │   ├── services/      # API servisleri
│   │   └── types/         # TypeScript tipleri
│   ├── App.tsx            # Ana uygulama bileşeni
│   └── ...
├── mobile/                # Alternatif/eski mobil uygulama
├── server/                # Node.js backend API
├── docs/                  # Dokümantasyon
└── scripts/               # Deployment ve yardımcı scriptler
```

## 🧪 Kullanılan Teknolojiler

- React Native
- TypeScript
- Expo
- AsyncStorage
- Node.js (Backend)

## 🎮 Özellikler

- Light/Dark tema desteği
- Kategori ve zorluk seviyesi seçenekleri
- Yüksek skor kaydetme
- İpucu sistemi
- Seviye atlama sistemi Bulmaca Oyunları Platformu

Hobi-X, Türkçe karakterleri tam destekleyen, modüler yapıda, kolayca oyun ekleyip çıkarılabilen bir bulmaca oyunları platformudur. Bu proje hem backend API hem de modern React Native mobil uygulamasını içerir.

## Proje Yapısı

```
Hobi-X/
├── server/          # Backend API (Node.js + Express)
├── mobile/          # React Native mobil uygulama
├── docs/           # Dokümantasyon
└── scripts/        # Deployment scriptleri
```

## Özellikler

### Backend (API)
- Türkçe karakter desteği (UTF-8)
- Modüler oyun sistemi
- JWT tabanlı kimlik doğrulama
- MySQL veritabanı entegrasyonu
- Admin paneli
- RESTful API

### Mobil Uygulama (React Native)
- Modern, responsive tasarım
- Gece/Gündüz tema desteği
- Oyun kartları ile grid layout
- Günlük oyun önerileri
- Bottom navigation
- Cross-platform (iOS/Android)

## Projede Bulunan Oyunlar

1. **Adam Asmaca** - Türkçe kelimeler ile klasik adam asmaca oyunu

## Yeni Oyun Ekleme

Yeni bir oyun eklemek için şu adımları izleyin:

1. `server/games/` klasörüne yeni bir JS dosyası ekleyin (örn: `SudokuGame.js`)
2. `GameModule` sınıfını genişletin ve gerekli metodları uygulayın
3. Veritabanında oyuna özgü tabloları oluşturun
4. Oyunu `game_types` tablosuna ekleyin

## Kurulum

### Backend Kurulumu

#### Gereksinimler
- Node.js (v14+)
- MySQL (5.7+)

#### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını yapılandırın:
```
PORT=3000
NODE_ENV=development
DB_HOST=srv1787.hstgr.io
DB_USER=u588148465_hobix
DB_PASSWORD=xxxx
DB_NAME=u588148465_tuncay
JWT_SECRET=güvenli_bir_anahtar
JWT_EXPIRES_IN=7d
```

### Mobil Uygulama Kurulumu

#### Gereksinimler
- Node.js (v14+)
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için - sadece macOS)

#### Adımlar

1. Mobil klasörüne gidin:
```bash
cd mobile
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. iOS için (sadece macOS):
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

4. Android için:
```bash
npx react-native run-android
```

3. Veritabanını kurun:
```bash
npm run setup-db
```

4. Sunucuyu başlatın:
```bash
npm start
```

## API Dokümantasyonu

### Kimlik Doğrulama

- `POST /api/v1/auth/register` - Yeni kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi

### Oyunlar

- `GET /api/v1/games` - Tüm oyunları listele
- `GET /api/v1/games/:gameId` - Belirli bir oyunun detaylarını al
- `POST /api/v1/games/:gameId/puzzle` - Yeni bulmaca oluştur
- `POST /api/v1/games/:gameId/puzzle/:puzzleId/check` - Cevap kontrolü

### Kullanıcı İşlemleri

- `GET /api/v1/users/profile` - Kullanıcı profilini getir
- `PUT /api/v1/users/profile` - Profil bilgilerini güncelle
- `GET /api/v1/users/scores` - Kullanıcı skorlarını getir

### Admin İşlemleri

- `GET /api/v1/admin/stats` - Oyun istatistiklerini getir
- `PATCH /api/v1/admin/games/:gameId` - Oyun durumunu güncelle
- `POST /api/v1/admin/games/hangman/words` - Adam asmaca için yeni kelime ekle

## Lisans

ISC

## Dağıtım (VPS)

Detaylı rehber için: `docs/DEPLOY_VPS.md`

Hızlı özet:
- `server/.env.example` dosyasını `server/.env` olarak kopyalayıp doldurun.
- Bağımlılıkları kurun: `npm install`
- PM2 ile başlatın: `pm2 start ecosystem.config.js --env production`
- Opsiyonel: Nginx reverse proxy ile 80/443 üzerinden yayın.
