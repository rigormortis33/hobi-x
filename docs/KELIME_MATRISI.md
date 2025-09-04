# Kelime Matrisi Oyunu

Kelime Matrisi, Hobi-X platformundaki interaktif bir kelime bulma oyunudur. 4x4 harflerden oluşan bir matris üzerinde, bitişik harfleri birleştirerek anlamlı kelimeler oluşturmaya dayalı bir oyun mekanizmasına sahiptir.

## 🎮 Oyun Özellikleri

### Temel Mekanikler
- **4x4 Matris**: 16 harf içeren kare matris
- **Kelime Oluşturma**: Bitişik harfleri seçerek kelimeler oluşturma
- **Puan Sistemi**: Kelime uzunluğuna ve zorluk seviyesine göre puanlama
- **Seviye Sistemi**: Belirli puan hedeflerine ulaşıldığında seviye atlama
- **Zaman Sınırı**: Zorluk seviyesine göre değişen süre

### Özelleştirmeler
- **Kategoriler**: Farklı kelime kategorileri arasından seçim
  - Hepsi (tüm kategoriler)
  - Doğa 
  - Eşyalar
  - Yemek
  - Aile
  - Soyut kavramlar
- **Zorluk Seviyeleri**: Oyunun zorluğunu belirleme
  - Kolay (daha kısa kelimeler, daha uzun süre, daha düşük puan hedefi)
  - Orta (orta uzunlukta kelimeler, standart süre, standart puan hedefi)
  - Zor (daha uzun kelimeler, daha kısa süre, daha yüksek puan hedefi)
- **İpucu Sistemi**: Her oyunda 3 ipucu hakkı (ilk harf, son harf ve uzunluk bilgisi)

## 📊 Skor Hesaplama

Skor hesaplama şu faktörlere göre yapılır:
- **Kelime Uzunluğu**: Daha uzun kelimeler daha çok puan getirir
- **Zorluk Seviyesi**: Zorluk seviyesi arttıkça çarpanlar artar
- **Seviye**: Oyun seviyesi yükseldikçe çarpanlar artar
- **Uzunluk Bonusu**: 6+ harfli kelimeler için 1.5x, 8+ harfli kelimeler için 2x bonus

Puan Formülü:
```
Puan = Kelime Uzunluğu × Puan Çarpanı × Seviye × Uzunluk Bonusu
```

Puan çarpanları:
- Kolay: 10 puan
- Orta: 15 puan
- Zor: 20 puan

## ⏱️ Süre ve Seviye Sistemi

### Başlangıç Süreleri
- Kolay: 4 dakika (240 saniye)
- Orta: 3 dakika (180 saniye)
- Zor: 2 dakika (120 saniye)

### Seviye Atlama
Belirli bir hedef skora ulaşıldığında seviye atlama gerçekleşir:
- Kolay seviye hedef artışı: 1.3x
- Orta seviye hedef artışı: 1.5x
- Zor seviye hedef artışı: 1.7x

Seviye atlandığında:
- Yeni bir matris oluşturulur
- Bonus süre eklenir (Kolay: 40 sn, Orta: 30 sn, Zor: 20 sn)
- Bulunan kelimeler listesi sıfırlanır

## 🎲 Matris Oluşturma Algoritması

Matris oluşturulurken dengeli bir harf dağılımı sağlanır:
- Türkçe harf frekansları dikkate alınır
- Zorluk seviyesine göre minimum sesli harf sayısı garantilenir
  - Kolay: En az 6 sesli harf
  - Orta: En az 5 sesli harf
  - Zor: En az 4 sesli harf
- Oyun sonunda veya seviye atlarken yeni matris oluşturulur

## 👾 Teknik Yapı

- **State Yönetimi**: React hooks (useState, useEffect, useCallback)
- **Veri Saklama**: AsyncStorage ile yüksek skorların kaydedilmesi
- **UI Tasarımı**: Responsive tasarım, tema desteği (light/dark)
- **Kelime Veritabanı**: Kategorilere ve zorluk seviyelerine göre düzenlenmiş kelimeler

## 🛠️ Uygulama Örneği

```tsx
<KelimeMatrisiOyunu 
  palette={paletteObject}
  onBack={handleBackFunction} 
  baslangicZorluk="kolay" 
  baslangicKategori="hepsi" 
/>
```

## 📋 Tamamlanmış ve Gelecek Özellikler

### Tamamlanmış
- ✅ Kategori sistemi
- ✅ Zorluk seviyeleri
- ✅ İpucu mekanizması
- ✅ Dengeli harf matrisi oluşturma
- ✅ Yüksek skor kaydetme
- ✅ Tema desteği

### Gelecek Geliştirmeler
- ⬜ Çevrimiçi skor tablosu
- ⬜ Çok oyunculu mod
- ⬜ Günlük zorluklar
- ⬜ Özel tema paketleri
- ⬜ Sosyal medya paylaşımı
