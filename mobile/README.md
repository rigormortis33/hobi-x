# Hobi-X Mobil Uygulama

Modern React Native tabanlı mobil oyun uygulaması.

## Özellikler

- **Modern Tasarım**: Clean ve kullanıcı dostu arayüz
- **Gece/Gündüz Tema**: AsyncStorage ile kalıcı tema desteği
- **Oyun Kartları**: Gradient arka planlar ile görsel oyun kartları
- **Bottom Navigation**: Ana navigasyon sistemi
- **Cross-Platform**: iOS ve Android desteği
- **TypeScript**: Tip güvenli kod
- **Backend Entegrasyonu**: Node.js API ile bağlantı

## Oyunlar

1. **Adam Asmaca** - Türkçe kelimeler ile klasik oyun
2. **Sudoku** - Sayı bulmacası
3. **Kelime Avı** - Kelime bulma oyunu
4. **Eşleştirme** - Hafıza oyunu
5. **2048** - Sayı birleştirme oyunu
6. **X-O** - Klasik tic-tac-toe

## Teknolojiler

- React Native 0.73
- TypeScript
- React Navigation
- AsyncStorage
- React Native Vector Icons
- ESLint & Prettier

## Kurulum

### Gereksinimler

- Node.js 14+
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için - sadece macOS)

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. iOS için pod install (sadece macOS):
```bash
cd ios && pod install && cd ..
```

3. Uygulamayı çalıştırın:

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Metro Server:**
```bash
npm start
```

## API Konfigürasyonu

Mobil uygulama `src/services/ApiService.ts` dosyasındaki `baseURL` ayarını backend sunucunuza göre değiştirin:

```typescript
// Development
this.baseURL = 'http://localhost:3000/api/v1';

// Production
this.baseURL = 'https://your-domain.com/api/v1';
```

## Dosya Yapısı

```
mobile/
├── src/
│   ├── screens/
│   │   └── HobiXHomeScreen.tsx    # Ana ekran
│   ├── components/
│   │   └── HangmanGame.tsx        # Adam Asmaca oyunu
│   ├── services/
│   │   └── ApiService.ts          # Backend API servisi
│   └── types/
│       └── index.ts               # TypeScript tipleri
├── App.tsx                        # Ana uygulama bileşeni
├── index.js                       # Entry point
├── package.json
└── README.md
```

## Tema Sistemi

Uygulama, kalıcı tema desteği sunar:

- **Light Theme**: Açık renkli, modern tasarım
- **Dark Theme**: Koyu renkli, göz dostu tasarım
- **AsyncStorage**: Tema tercihi cihazda saklanır

Tema değişimi header'daki güneş/ay ikonu ile yapılabilir.

## Geliştirme

### Yeni Oyun Ekleme

1. `src/screens/HobiXHomeScreen.tsx` dosyasındaki `GAMES` arrayına yeni oyun ekleyin
2. `src/components/` klasörüne oyun bileşenini ekleyin
3. Navigation sistemine entegre edin

### API Entegrasyonu

API servisleri `src/services/ApiService.ts` dosyasında tanımlanmıştır:

- Authentication (login, register, logout)
- Game operations (getGames, playGame, saveScore)
- User operations (profile, scores, leaderboard)

## Deployment

### Android APK Oluşturma

```bash
cd android
./gradlew assembleRelease
```

### iOS Build

```bash
cd ios
xcodebuild -workspace HobiXMobile.xcworkspace -scheme HobiXMobile archive
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje ISC lisansı altındadır.
