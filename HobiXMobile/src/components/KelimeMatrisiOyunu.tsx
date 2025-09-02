import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kategorilere ayrılmış kelime sözlükleri
const KELIME_KATEGORILERI = {
  // Temel kelimeler - En kolay seviye
  temel: {
    kisa: [
      'ALT', 'ANA', 'ARA', 'ART', 'BAL', 'BEL', 'BOL', 'BUL', 'DAL', 'DEL', 'DIL', 'DOL', 
      'EKL', 'ELM', 'GEL', 'GOR', 'GUL', 'HAL', 'HEP', 'ICE', 'ILK', 'KAL', 'KEL', 'KOL', 
      'KUL', 'LAL', 'MAL', 'MEL', 'MIL', 'MOL', 'NAL', 'OKU', 'ONA', 'PAL', 'SAL', 'SOL', 
      'SUL', 'TAL', 'TEL', 'TOL', 'TUL', 'VER', 'YAL', 'YEL', 'YOL'
    ],
    orta: [
      'ALMA', 'ARMA', 'BALE', 'BELA', 'DEME', 'DOLA', 'ELMA', 'GALA', 'HALE', 'KALE', 'LALE', 
      'MALE', 'NALE', 'PALE', 'SALE', 'TALE', 'VALE', 'YALE', 'ALAN', 'BALAN', 'DALAN', 
      'GALAN', 'KALAN', 'MALAN', 'NALAN', 'PALAN', 'SALAN', 'TALAN', 'VALAN', 'YALAN'
    ]
  },
  
  // Doğa ve hayvan kategorisi
  doga: {
    kolay: [
      'DAĞ', 'AY', 'GÜN', 'SU', 'KAR', 'KUM', 'GÖL', 'YOL', 'TAŞ', 'KÖK', 'KUŞ', 
      'BAL', 'YAZ', 'KIŞ', 'GÖK'
    ],
    orta: [
      'AĞAÇ', 'ORMAN', 'DENIZ', 'GÜNEŞ', 'BAHÇE', 'ÇİÇEK', 'KUĞU', 'FIRTINA', 
      'YAĞMUR', 'RÜZGAR', 'YILDIZ', 'ÇİMEN', 'TOPRAK'
    ],
    zor: [
      'KARTAL', 'ASLAN', 'KAPLAN', 'ZEBRA', 'BALINA', 'FİL', 'PAPAĞAN', 'TİMSAH', 
      'KÖPEKBALIĞI', 'KAPLUMBAĞA', 'GÖKKÜŞAĞI'
    ]
  },
  
  // Renkler ve eşyalar
  esya: {
    kolay: [
      'MAVİ', 'SARI', 'MOR', 'GRİ', 'MASA', 'KAPI', 'CAM', 'KİTAP', 'SAAT', 
      'KALEM', 'ÇANTA', 'YÜZÜK'
    ],
    orta: [
      'KIRMIZI', 'YEŞİL', 'PEMBE', 'SİYAH', 'BEYAZ', 'TURUNCU', 'GÜMÜŞ', 'ALTIN', 
      'SANDALYE', 'BİLEZİK', 'GÖZLÜK', 'KÜPE', 'AYNA'
    ]
  },
  
  // Yiyecek ve içecekler
  yemek: {
    kolay: [
      'SU', 'ÇAY', 'ET', 'BAL', 'TUZ', 'YAĞ', 'UN', 'SÜT', 'KEK'
    ],
    orta: [
      'EKMEK', 'KAHVE', 'MEYVE', 'SEBZE', 'BALIK', 'TAVUK', 'YUMURTA', 'PEYNİR', 
      'ŞEKER', 'ÇORBA'
    ],
    zor: [
      'MAKARNA', 'HAMBURGER', 'ÇİKOLATA', 'DONDURMA', 'PORTAKAL', 'MANDALINA', 'KAŞAR'
    ]
  },
  
  // Aile ve insan
  aile: {
    kolay: [
      'ANNE', 'BABA', 'KIZ', 'ABLA', 'ABİ', 'DEDE', 'NINE', 'AMCA', 'TEYZE', 'KUZEN', 
      'EL', 'GÖZ', 'SAÇ'
    ],
    orta: [
      'ÇOCUK', 'BEBEK', 'DAYAK', 'HALA', 'AKRABA', 'TORUN'
    ]
  },
  
  // Soyut kavramlar
  soyut: {
    kolay: [
      'AŞK', 'UMUT', 'HEP', 'HAZ', 'YAS'
    ],
    orta: [
      'SEVGİ', 'DOSTLUK', 'HUZUR', 'BARIŞ', 'SAYGI', 'ÖZGÜRLÜK'
    ],
    zor: [
      'MUTLULUK', 'ÜZÜNTÜ', 'MACERA', 'ADALET', 'CESARET'
    ]
  }
};

// Tüm kelimeleri birleştiren sözlük oluşturma
const tümKelimeleriTopla = () => {
  const kelimeler = new Set<string>();
  
  Object.values(KELIME_KATEGORILERI).forEach(kategori => {
    Object.values(kategori).forEach(zorluk => {
      zorluk.forEach(kelime => kelimeler.add(kelime));
    });
  });
  
  return kelimeler;
};

const KELIME_SOZLUGU = tümKelimeleriTopla();

// Türkçe harfler ve frekansları
const TURKCE_HARFLER = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
const HARF_FREKANSLARI = {
  'A': 12, 'E': 10, 'I': 8, 'İ': 8, 'O': 7, 'U': 6, 'Ü': 4, 'Ö': 3,
  'N': 7, 'R': 7, 'L': 6, 'T': 6, 'S': 6, 'K': 5, 'M': 5, 'D': 5,
  'Y': 4, 'B': 4, 'V': 3, 'G': 3, 'P': 3, 'C': 3, 'H': 3, 'Z': 2,
  'F': 2, 'Ş': 2, 'Ç': 2, 'Ğ': 2, 'J': 1
};

// Zorluk seviyeleri ve kategoriler için tipler
type ZorlukSeviyesi = 'kolay' | 'orta' | 'zor';
type KelimeKategori = 'doga' | 'esya' | 'yemek' | 'aile' | 'soyut' | 'hepsi';

interface KelimeMatrisiOyunuProps {
  palette: any;
  onBack?: () => void;
  baslangicZorluk?: ZorlukSeviyesi;
  baslangicKategori?: KelimeKategori;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Ekranın genişliğine göre kare boyutunu hesapla
const TILE_SIZE = Math.min(70, (SCREEN_WIDTH - 64) / 4); // 4x4 matris için (4 sütun ve aralarında boşluk)

export default function KelimeMatrisiOyunu({ 
  palette, 
  onBack, 
  baslangicZorluk = 'kolay', 
  baslangicKategori = 'hepsi' 
}: KelimeMatrisiOyunuProps) {
  const [oyunDurumu, setOyunDurumu] = useState('menu'); // menu, playing, paused, gameOver
  const [matris, setMatris] = useState<Array<{id: number, harf: string, secili: boolean, bulunan: boolean}>>([]);
  const [secilenKelime, setSecilenKelime] = useState('');
  const [secilenHucreler, setSecilenHucreler] = useState<number[]>([]);
  const [bulunanKelimeler, setBulunanKelimeler] = useState<string[]>([]);
  const [skor, setSkor] = useState(0);
  const [seviye, setSeviye] = useState(1);
  const [sure, setSure] = useState(180); // 3 dakika
  const [hedefSkor, setHedefSkor] = useState(500);
  const [touchStarted, setTouchStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [zorlukSeviyesi, setZorlukSeviyesi] = useState<ZorlukSeviyesi>(baslangicZorluk);
  const [kategori, setKategori] = useState<KelimeKategori>(baslangicKategori);
  const [ipucu, setIpucu] = useState<string | null>(null);
  const [ipucuKullanim, setIpucuKullanim] = useState(0);
  const [gizliKelimeler, setGizliKelimeler] = useState<string[]>([]);
  const [matristeKelimeler, setMatristeKelimeler] = useState<string[]>([]);
  const gridSize = 4; // 4x4 matris

  // High score'u yükle
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const saved = await AsyncStorage.getItem('kelimeMatrisi_highScore');
        if (saved) {
          setHighScore(parseInt(saved));
        }
      } catch (error) {
        console.error('High score yüklenirken hata:', error);
      }
    };
    loadHighScore();
  }, []);

  // High score'u kaydet
  const saveHighScore = useCallback(async (newScore: number) => {
    try {
      if (newScore > highScore) {
        await AsyncStorage.setItem('kelimeMatrisi_highScore', newScore.toString());
        setHighScore(newScore);
      }
    } catch (error) {
      console.error('High score kaydedilirken hata:', error);
    }
  }, [highScore]);

  // Rastgele harf üretme fonksiyonu
  const rastgeleHarfUret = useCallback(() => {
    const harfler: string[] = [];
    Object.entries(HARF_FREKANSLARI).forEach(([harf, frekans]) => {
      for (let i = 0; i < frekans; i++) {
        harfler.push(harf);
      }
    });
    return harfler[Math.floor(Math.random() * harfler.length)];
  }, []);

  // Yeni matris oluşturma
  const yeniMatrisOlustur = useCallback(() => {
    // Matris harflerini sesli ve sessiz olarak dengeli dağıtmaya çalışalım
    const sesliHarfler = ['A', 'E', 'I', 'İ', 'O', 'U', 'Ü', 'Ö'];
    const yeniMatris = [];
    
    // Minimum sesli harf sayısı (en az 4-6 sesli harf olsun)
    const minSesliSayisi = zorlukSeviyesi === 'kolay' ? 6 : 
                           zorlukSeviyesi === 'orta' ? 5 : 4;
    
    // Sesli harf sayacı
    let sesliSayisi = 0;
    
    for (let i = 0; i < 16; i++) {
      let harf;
      
      // Eğer yeterli sesli harf yoksa ve sona yaklaşıyorsak zorla sesli harf ekle
      if (sesliSayisi < minSesliSayisi && i >= 12) {
        // Zorla sesli harf ekleme
        harf = sesliHarfler[Math.floor(Math.random() * sesliHarfler.length)];
        sesliSayisi++;
      } else {
        // Normal harf seçimi
        harf = rastgeleHarfUret();
        if (sesliHarfler.includes(harf)) {
          sesliSayisi++;
        }
      }
      
      yeniMatris.push({
        id: i,
        harf: harf,
        secili: false,
        bulunan: false
      });
    }
    
    setMatris(yeniMatris);
    return yeniMatris.map(h => h.harf); // Oluşturulan harfleri döndür (kelime kontrolü için)
  }, [rastgeleHarfUret, zorlukSeviyesi]);

  // Kategoriye göre kelime havuzu oluşturma
  const kategoriKelimeleriniAl = useCallback(() => {
    // Kategori seçimine göre kelimeleri filtrele
    let kelimeHavuzu: string[] = [];
    
    if (kategori === 'hepsi') {
      // Tüm kategorileri topla
      Object.values(KELIME_KATEGORILERI).forEach(kategoriGrubu => {
        Object.values(kategoriGrubu).forEach(zorlukGrubu => {
          kelimeHavuzu = [...kelimeHavuzu, ...zorlukGrubu];
        });
      });
    } else {
      // Sadece seçilen kategoriyi al
      const seciliKategori = KELIME_KATEGORILERI[kategori];
      if (seciliKategori) {
        Object.values(seciliKategori).forEach(zorlukGrubu => {
          kelimeHavuzu = [...kelimeHavuzu, ...zorlukGrubu];
        });
      }
    }
    
    // Zorluk seviyesine göre filtreleme (opsiyonel)
    if (zorlukSeviyesi === 'kolay') {
      // Kolay seviyede daha kısa kelimeler
      return kelimeHavuzu.filter(kelime => kelime.length <= 5);
    } else if (zorlukSeviyesi === 'orta') {
      // Orta seviyede orta uzunlukta kelimeler
      return kelimeHavuzu.filter(kelime => kelime.length >= 4 && kelime.length <= 7);
    } else {
      // Zor seviyede daha uzun ve karmaşık kelimeler
      return kelimeHavuzu.filter(kelime => kelime.length >= 5);
    }
  }, [kategori, zorlukSeviyesi]);
  
  // Matristeki harflere göre bulunabilecek kelimeleri belirle
  const kelimeMatristenBulunabilir = useCallback((kelime: string, matrisHarfleri: string[]) => {
    // Matristeki harfleri kullanarak bu kelime oluşturulabilir mi kontrol et
    // Basitleştirilmiş mantık: Her harfin matris içinde olup olmadığını kontrol ediyoruz
    const harfSayaci: Record<string, number> = {};
    
    // Matristeki her harfin sayısını hesapla
    matrisHarfleri.forEach(harf => {
      harfSayaci[harf] = (harfSayaci[harf] || 0) + 1;
    });
    
    // Kelime için gereken harfleri kontrol et
    const kelimeHarfSayaci: Record<string, number> = {};
    for (let i = 0; i < kelime.length; i++) {
      const harf = kelime[i];
      kelimeHarfSayaci[harf] = (kelimeHarfSayaci[harf] || 0) + 1;
    }
    
    // Kelimenin her harfi yeterli sayıda matris içinde var mı?
    for (const [harf, sayi] of Object.entries(kelimeHarfSayaci)) {
      if (!harfSayaci[harf] || harfSayaci[harf] < sayi) {
        return false;
      }
    }
    
    return true;
  }, []);

  // Oyunu başlatma
  const oyunuBaslat = useCallback(() => {
    setOyunDurumu('playing');
    
    // Kategoriye göre kelime havuzunu al
    const filtrelenmisKelimeHavuzu = kategoriKelimeleriniAl();
    
    // Zorluk seviyesine göre süreyi ayarla
    let baslangicSuresi = zorlukSeviyesi === 'kolay' ? 240 : // 4 dakika
                         zorlukSeviyesi === 'orta' ? 180 : // 3 dakika
                         120; // 2 dakika (zor)
    
    // Matris oluştur
    yeniMatrisOlustur();
    
    // Matriste bulunabilecek kelimeleri belirle (yeni matris oluşturulduktan sonra)
    const matrisHarfleri = matris.map(h => h.harf);
    const bulunabilecekKelimeler = filtrelenmisKelimeHavuzu.filter(kelime => 
      kelimeMatristenBulunabilir(kelime, matrisHarfleri)
    );
    
    setMatristeKelimeler(bulunabilecekKelimeler);
    setSecilenKelime('');
    setSecilenHucreler([]);
    setBulunanKelimeler([]);
    setSkor(0);
    setSeviye(1);
    setSure(baslangicSuresi);
    setHedefSkor(zorlukSeviyesi === 'kolay' ? 300 : zorlukSeviyesi === 'orta' ? 500 : 800);
    setIpucu(null);
    setIpucuKullanim(0);
  }, [kategori, zorlukSeviyesi, kategoriKelimeleriniAl, kelimeMatristenBulunabilir, matris, yeniMatrisOlustur]);

  // Zaman sayacı
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (oyunDurumu === 'playing' && sure > 0) {
      interval = setInterval(() => {
        setSure(prev => {
          if (prev <= 1) {
            setOyunDurumu('gameOver');
            saveHighScore(skor);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [oyunDurumu, sure, skor, saveHighScore]);

  // Komşu hücre kontrolü
  const komsumu = (id1: number, id2: number) => {
    const [row1, col1] = [Math.floor(id1 / gridSize), id1 % gridSize];
    const [row2, col2] = [Math.floor(id2 / gridSize), id2 % gridSize];

    // Yatay, dikey ve çapraz komşular
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    // En fazla 1 birim uzaklıktaki hücreler komşudur
    return (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0));
  };

  // Hücre seçimi
  const hucreSecimKontrolu = (id: number) => {
    if (oyunDurumu !== 'playing') return;

    // Eğer hücre zaten seçiliyse ve son seçilenise, geri al
    if (secilenHucreler.includes(id)) {
      const sonSecilenIndex = secilenHucreler[secilenHucreler.length - 1];
      if (id === sonSecilenIndex && secilenHucreler.length > 1) {
        // Son seçileni geri al
        const yeniSecim = secilenHucreler.slice(0, -1);
        setSecilenHucreler(yeniSecim);
        setSecilenKelime(yeniSecim.map(i => matris[i].harf).join(''));
        
        const yeniMatris = [...matris];
        yeniMatris[id].secili = false;
        setMatris(yeniMatris);
      }
      return;
    }

    // İlk seçimse, direkt ekle
    if (secilenHucreler.length === 0) {
      const yeniSecim = [id];
      setSecilenHucreler(yeniSecim);
      setSecilenKelime(matris[id].harf);

      const yeniMatris = [...matris];
      yeniMatris[id].secili = true;
      setMatris(yeniMatris);
      return;
    }

    // Komşu kontrolü
    const sonSecilenIndex = secilenHucreler[secilenHucreler.length - 1];
    if (!komsumu(sonSecilenIndex, id)) {
      return;
    }

    // Hücreyi ekle
    const yeniSecim = [...secilenHucreler, id];
    setSecilenHucreler(yeniSecim);
    setSecilenKelime(yeniSecim.map(i => matris[i].harf).join(''));

    const yeniMatris = [...matris];
    yeniMatris[id].secili = true;
    setMatris(yeniMatris);
  };

  // Kelime onaylama
  const kelimeOnayla = () => {
    if (secilenKelime.length < 3) {
      return;
    }

    const kelimeBulunan = KELIME_SOZLUGU.has(secilenKelime);
    const zatenBulunmus = bulunanKelimeler.includes(secilenKelime);

    if (kelimeBulunan && !zatenBulunmus) {
      // Kelime doğru ve daha önce bulunmamış
      // Zorluk seviyesine göre farklı puan hesaplaması yapalım
      let puanCarpani = 10; // Temel puan
      
      // Zorluk seviyesine göre çarpanı ayarla
      if (zorlukSeviyesi === 'orta') puanCarpani = 15;
      if (zorlukSeviyesi === 'zor') puanCarpani = 20;
      
      // Kelime uzunluğuna göre bonus puan
      let uzunlukBonusu = 1;
      if (secilenKelime.length > 6) uzunlukBonusu = 1.5;
      if (secilenKelime.length > 8) uzunlukBonusu = 2;
      
      // Toplam skoru hesapla
      const yeniSkor = Math.floor(secilenKelime.length * puanCarpani * seviye * uzunlukBonusu);
      const toplamSkor = skor + yeniSkor;
      
      setSkor(toplamSkor);
      setBulunanKelimeler(prev => [...prev, secilenKelime]);
      
      // Kullanılan hücreleri işaretle
      const yeniMatris = [...matris];
      secilenHucreler.forEach(id => {
        yeniMatris[id].bulunan = true;
        yeniMatris[id].secili = false;
      });
      setMatris(yeniMatris);

      // Seviye kontrolü - zorluk seviyesine göre hedefi ayarlıyoruz
      if (toplamSkor >= hedefSkor) {
        setSeviye(prev => prev + 1);
        
        // Zorluk seviyesine göre hedef artışı
        const hedefCarpan = zorlukSeviyesi === 'kolay' ? 1.3 : 
                            zorlukSeviyesi === 'orta' ? 1.5 : 1.7;
        
        setHedefSkor(prev => Math.floor(prev * hedefCarpan));
        
        // Bonus süre - kolay seviyede daha fazla, zor seviyede daha az
        const bonusSure = zorlukSeviyesi === 'kolay' ? 40 : 
                          zorlukSeviyesi === 'orta' ? 30 : 20;
        
        setSure(prev => Math.min(prev + bonusSure, 300)); // Maksimum 5 dakika
        
        // Yeni matris oluştur
        setTimeout(() => {
          const yeniHarfler = yeniMatrisOlustur();
          
          // Yeni matristeki bulunabilecek kelimeleri güncelle
          const filtrelenmisKelimeHavuzu = kategoriKelimeleriniAl();
          const bulunabilecekKelimeler = filtrelenmisKelimeHavuzu.filter(kelime => 
            kelimeMatristenBulunabilir(kelime, yeniHarfler)
          );
          setMatristeKelimeler(bulunabilecekKelimeler);
          setBulunanKelimeler([]);
        }, 1000);
      }

      secimiTemizle();
    } else if (zatenBulunmus) {
      // Kelime zaten bulunmuş
      secimiTemizle();
    } else {
      // Kelime bulunamadı - kullanıcı devam etsin
      // Seçimi temizleme, sadece visual feedback ver
    }
  };

  // Seçimi temizle
  const secimiTemizle = () => {
    setSecilenKelime('');
    setSecilenHucreler([]);
    const yeniMatris = matris.map(hucre => ({ ...hucre, secili: false }));
    setMatris(yeniMatris);
  };

  // Süre formatı
  const sureFormati = (saniye: number) => {
    const dakika = Math.floor(saniye / 60);
    const kalan = saniye % 60;
    return `${dakika}:${kalan.toString().padStart(2, '0')}`;
  };

  // Touch handlers
  const handleTouchStart = (id: number) => {
    setTouchStarted(true);
    hucreSecimKontrolu(id);
  };

  const handleTouchMove = (e: any) => {
    if (!touchStarted) return;
    
    // Touch koordinatlarına göre hangi hücrenin üzerinde olduğunu bul
    // Bu React Native için özelleştirilmeli
  };

  const handleTouchEnd = () => {
    setTouchStarted(false);
  };

  // Kategori değiştirme fonksiyonu
  const kategoriDegistir = (yeniKategori: KelimeKategori) => {
    setKategori(yeniKategori);
  };
  
  // Zorluk seviyesi değiştirme fonksiyonu
  const zorlukDegistir = (yeniZorluk: ZorlukSeviyesi) => {
    setZorlukSeviyesi(yeniZorluk);
  };

  // İpucu kullanma fonksiyonu
  const ipucuGoster = () => {
    if (matristeKelimeler.length === 0 || ipucuKullanim >= 3) return;
    
    // Henüz bulunmamış rastgele bir kelime seç
    const bulunmamisKelimeler = matristeKelimeler.filter(kelime => !bulunanKelimeler.includes(kelime));
    if (bulunmamisKelimeler.length === 0) return;
    
    const rastgeleKelime = bulunmamisKelimeler[Math.floor(Math.random() * bulunmamisKelimeler.length)];
    const ilkHarf = rastgeleKelime.charAt(0);
    const sonHarf = rastgeleKelime.charAt(rastgeleKelime.length - 1);
    
    setIpucu(`İpucu: "${ilkHarf}" ile başlayıp "${sonHarf}" ile biten ${rastgeleKelime.length} harfli bir kelime`);
    setIpucuKullanim(prev => prev + 1);
    
    // İpucunu 5 saniye sonra temizle
    setTimeout(() => {
      setIpucu(null);
    }, 5000);
  };

  // Menu ekranı render
  if (oyunDurumu === 'menu') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette?.bg || '#f9fafb' }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.menuContainer}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: palette?.text || '#111827' }]}>📊 Kelime Matrisi</Text>
              <Text style={[styles.description, { color: palette?.subtext || '#6b7280' }]}>
                Harfleri birleştirerek kelimeler oluşturun!
              </Text>
            </View>
            
            <View style={[styles.infoBox, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
              <Text style={[styles.infoText, { color: palette?.text || '#111827' }]}>
                ⭐ 4x4 matris üzerinde kelime arayın
              </Text>
              <Text style={[styles.infoText, { color: palette?.text || '#111827' }]}>
                🏆 Uzun kelimeler daha çok puan getirir
              </Text>
              <Text style={[styles.infoText, { color: palette?.text || '#111827' }]}>
                ⏱️ Zamanla yarışın ve seviye atlayın
              </Text>
            </View>
            
            {/* Kategori Seçimi */}
            <View style={[styles.optionsContainer, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
              <Text style={[styles.optionsTitle, { color: palette?.text || '#111827' }]}>Kategori Seçin</Text>
              <View style={styles.optionsRow}>
                {(['hepsi', 'doga', 'esya', 'yemek', 'aile', 'soyut'] as KelimeKategori[]).map((kat) => (
                  <Pressable
                    key={kat}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: kategori === kat 
                          ? (palette?.accent || '#3b82f6') 
                          : (palette?.card || '#ffffff'),
                        borderColor: palette?.border || '#d1d5db'
                      }
                    ]}
                    onPress={() => kategoriDegistir(kat)}
                  >
                    <Text 
                      style={[
                        styles.optionButtonText, 
                        { color: kategori === kat ? '#FFFFFF' : (palette?.text || '#111827') }
                      ]}
                    >
                      {kat === 'hepsi' ? 'Hepsi' : 
                       kat === 'doga' ? 'Doğa' : 
                       kat === 'esya' ? 'Eşyalar' :
                       kat === 'yemek' ? 'Yemek' :
                       kat === 'aile' ? 'Aile' :
                       'Soyut'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {/* Zorluk Seçimi */}
            <View style={[styles.optionsContainer, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
              <Text style={[styles.optionsTitle, { color: palette?.text || '#111827' }]}>Zorluk Seviyesi</Text>
              <View style={styles.optionsRow}>
                {(['kolay', 'orta', 'zor'] as ZorlukSeviyesi[]).map((zorSev) => (
                  <Pressable
                    key={zorSev}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: zorlukSeviyesi === zorSev 
                          ? (palette?.accent || '#3b82f6') 
                          : (palette?.card || '#ffffff'),
                        borderColor: palette?.border || '#d1d5db'
                      }
                    ]}
                    onPress={() => zorlukDegistir(zorSev)}
                  >
                    <Text 
                      style={[
                        styles.optionButtonText, 
                        { color: zorlukSeviyesi === zorSev ? '#FFFFFF' : (palette?.text || '#111827') }
                      ]}
                    >
                      {zorSev.charAt(0).toUpperCase() + zorSev.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            
            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: pressed ? (palette?.accentAlt || '#93c5fd') : (palette?.accent || '#3b82f6'), borderColor: palette?.stroke || '#e5e7eb' }
              ]}
              onPress={oyunuBaslat}
            >
              <Text style={styles.startButtonText}>🎮 Oyunu Başlat</Text>
            </Pressable>

            {onBack && (
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  { backgroundColor: pressed ? (palette?.stroke || '#e5e7eb') : (palette?.card || '#ffffff'), borderColor: palette?.border || '#d1d5db' }
                ]}
                onPress={onBack}
              >
                <Text style={[styles.backButtonText, { color: palette?.text || '#111827' }]}>🏠 Ana Sayfa</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // GameOver ekranı render
  if (oyunDurumu === 'gameOver') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette?.bg || '#f9fafb' }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.menuContainer}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: palette?.text || '#111827' }]}>🏁 Oyun Bitti!</Text>
              <Text style={[styles.description, { color: palette?.subtext || '#6b7280' }]}>
                Tebrikler, güzel bir performans!
              </Text>
            </View>
            
            <View style={[styles.scoreContainer, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: palette?.subtext || '#6b7280' }]}>Final Skoru:</Text>
                <Text style={[styles.scoreValue, { color: palette?.accent || '#3b82f6' }]}>{skor}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: palette?.subtext || '#6b7280' }]}>En Yüksek Skor:</Text>
                <Text style={[styles.scoreValue, { color: palette?.success || '#a5d6a7' }]}>{Math.max(skor, highScore)}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: palette?.subtext || '#6b7280' }]}>Ulaşılan Seviye:</Text>
                <Text style={[styles.scoreValue, { color: palette?.warning || '#ffc107' }]}>{seviye}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: palette?.subtext || '#6b7280' }]}>Bulunan Kelime:</Text>
                <Text style={[styles.scoreValue, { color: palette?.error || '#f44336' }]}>{bulunanKelimeler.length}</Text>
              </View>
            </View>
            
            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                { backgroundColor: pressed ? (palette?.accentAlt || '#93c5fd') : (palette?.accent || '#3b82f6'), borderColor: palette?.stroke || '#e5e7eb' }
              ]}
              onPress={oyunuBaslat}
            >
              <Text style={styles.startButtonText}>🔄 Tekrar Oyna</Text>
            </Pressable>

            {onBack && (
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  { backgroundColor: pressed ? (palette?.stroke || '#e5e7eb') : (palette?.card || '#ffffff'), borderColor: palette?.border || '#d1d5db' }
                ]}
                onPress={onBack}
              >
                <Text style={[styles.backButtonText, { color: palette?.text || '#111827' }]}>🏠 Ana Sayfa</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Oyun ekranı render
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette?.bg || '#f9fafb' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Üst Panel */}
        <View style={[styles.headerPanel, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: palette?.accent || '#3b82f6' }]}>{skor}</Text>
            <Text style={[styles.statsLabel, { color: palette?.subtext || '#6b7280' }]}>Skor</Text>
          </View>
          
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: palette?.success || '#a5d6a7' }]}>L{seviye}</Text>
            <Text style={[styles.statsLabel, { color: palette?.subtext || '#6b7280' }]}>Seviye</Text>
          </View>
          
          <View style={styles.statsItem}>
            <Text style={[styles.statsValue, { color: palette?.warning || '#ffc107' }]}>{sureFormati(sure)}</Text>
            <Text style={[styles.statsLabel, { color: palette?.subtext || '#6b7280' }]}>Süre</Text>
          </View>
        </View>

        {/* Kategori ve Zorluk Bilgisi */}
        <View style={[styles.infoPanel, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: palette?.accent || '#3b82f6' }]}>
              {kategori === 'hepsi' ? '📚 Tüm Kategoriler' :
               kategori === 'doga' ? '🌳 Doğa' :
               kategori === 'esya' ? '🪑 Eşyalar' :
               kategori === 'yemek' ? '🍔 Yemek' :
               kategori === 'aile' ? '👨‍👩‍👧‍👦 Aile' :
               '💭 Soyut'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoValue, { color: zorlukSeviyesi === 'kolay' 
              ? palette?.success || '#a5d6a7' 
              : zorlukSeviyesi === 'orta' 
                ? palette?.warning || '#ffc107'
                : palette?.error || '#f44336' }]}>
              {zorlukSeviyesi === 'kolay' ? '😊 Kolay' :
               zorlukSeviyesi === 'orta' ? '😐 Orta' : 
               '😰 Zor'}
            </Text>
          </View>
        </View>
        
        {/* İpucu Gösterimi */}
        {ipucu && (
          <View style={[styles.hintContainer, { 
            backgroundColor: palette?.accentLight || '#93c5fd20', 
            borderColor: palette?.accent || '#3b82f6' 
          }]}>
            <Text style={[styles.hintText, { color: palette?.accent || '#3b82f6' }]}>{ipucu}</Text>
          </View>
        )}

        {/* Kelime Display */}
        <View style={[
          styles.kelimeDisplay,
          { 
            backgroundColor: secilenKelime.length >= 3 
              ? KELIME_SOZLUGU.has(secilenKelime) 
                ? bulunanKelimeler.includes(secilenKelime)
                  ? palette?.warningLight || '#fff8e1'
                  : palette?.successLight || '#e8f5e9'
                : palette?.errorLight || '#ffebee'
              : palette?.card || '#ffffff',
            borderColor: secilenKelime.length >= 3
              ? KELIME_SOZLUGU.has(secilenKelime)
                ? bulunanKelimeler.includes(secilenKelime)
                  ? palette?.warning || '#ffc107'
                  : palette?.success || '#a5d6a7'
                : palette?.error || '#f44336'
              : palette?.stroke || '#e5e7eb'
          }
        ]}>
          <Text style={[styles.kelimeText, { 
            color: palette?.text || '#111827',
            fontSize: secilenKelime ? 24 : 18
          }]}>
            {secilenKelime || 'Kelime seçin...'}
          </Text>
          
          {secilenKelime.length >= 3 && (
            <Text style={[styles.kelimeDurum, { 
              color: KELIME_SOZLUGU.has(secilenKelime)
                ? bulunanKelimeler.includes(secilenKelime)
                  ? palette?.warning || '#ffc107'
                  : palette?.success || '#a5d6a7'
                : palette?.error || '#f44336'
            }]}>
              {KELIME_SOZLUGU.has(secilenKelime)
                ? bulunanKelimeler.includes(secilenKelime)
                  ? 'Zaten bulundu'
                  : '✓ Geçerli kelime'
                : 'Geçersiz kelime'
              }
            </Text>
          )}
        </View>

        {/* Oyun Matrisi */}
        <View style={[styles.gameBoard, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
          <View style={styles.matrix}>
            {/* 4x4 matris olarak düzenliyoruz */}
            {Array(4).fill(0).map((_, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.matrixRow}>
                {Array(4).fill(0).map((_, colIndex) => {
                  const hucreIndex = rowIndex * 4 + colIndex;
                  const hucre = matris[hucreIndex];
                  if (!hucre) return null;
                  
                  return (
                    <TouchableWithoutFeedback 
                      key={hucre.id}
                      onPressIn={() => handleTouchStart(hucre.id)}
                    >
                      <View style={[
                        styles.hucre,
                        {
                          backgroundColor: hucre.bulunan
                            ? palette?.success || '#a5d6a7'
                            : hucre.secili
                              ? palette?.accent || '#3b82f6'
                              : palette?.card || '#ffffff',
                          borderColor: hucre.secili
                            ? palette?.accentAlt || '#93c5fd'
                            : hucre.bulunan
                              ? palette?.successAlt || '#81c784'
                              : palette?.stroke || '#e5e7eb',
                        }
                      ]}>
                        <Text style={[
                          styles.hucreText,
                          {
                            color: hucre.bulunan || hucre.secili
                              ? '#FFFFFF'
                              : palette?.text || '#111827',
                          }
                        ]}>
                          {hucre.harf}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Kontrol Butonları */}
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: pressed ? (palette?.successAlt || '#81c784') : (palette?.success || '#a5d6a7'), borderColor: palette?.stroke || '#e5e7eb' }
            ]}
            onPress={kelimeOnayla}
          >
            <Text style={styles.controlButtonText}>Onayla</Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: pressed ? (palette?.errorAlt || '#e57373') : (palette?.error || '#f44336'), borderColor: palette?.stroke || '#e5e7eb' }
            ]}
            onPress={secimiTemizle}
          >
            <Text style={styles.controlButtonText}>Temizle</Text>
          </Pressable>
        </View>
        
        {/* İpucu ve Bulunan Kelimeler Başlık */}
        <View style={styles.listHeader}>
          <Text style={[styles.bulunanBaslik, { color: palette?.text || '#111827' }]}>
            Bulunan Kelimeler ({bulunanKelimeler.length})
          </Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.hintButton,
              { 
                backgroundColor: pressed ? (palette?.accentAlt || '#93c5fd') : (palette?.accent || '#3b82f6'),
                opacity: ipucuKullanim >= 3 ? 0.5 : 1
              }
            ]}
            onPress={ipucuGoster}
            disabled={ipucuKullanim >= 3}
          >
            <Text style={styles.hintButtonText}>
              {`💡 İpucu ${ipucuKullanim}/3`}
            </Text>
          </Pressable>
        </View>

        {/* Bulunan Kelimeler */}
        <View style={[styles.bulunanKelimeler, { backgroundColor: palette?.card || '#ffffff', borderColor: palette?.stroke || '#e5e7eb' }]}>
          {bulunanKelimeler.length > 0 ? (
            <View style={styles.kelimeListesi}>
              {bulunanKelimeler.map((kelime, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.kelimeItem,
                    { backgroundColor: palette?.accent || '#3b82f6', borderColor: palette?.stroke || '#e5e7eb' }
                  ]}
                >
                  <Text style={styles.kelimeItemText}>{kelime}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyListContainer}>
              <Text style={[styles.emptyListText, { color: palette?.subtext || '#6b7280' }]}>
                Henüz kelime bulunmadı. İlk kelimeyi bulmak için harfleri birleştirin!
              </Text>
            </View>
          )}
        </View>
        
        {/* Ana Sayfa Dönüş Butonu */}
        {onBack && (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? (palette?.stroke || '#e5e7eb') : (palette?.card || '#ffffff'), 
                borderColor: palette?.border || '#d1d5db',
                marginBottom: 16 }
            ]}
            onPress={onBack}
          >
            <Text style={[styles.backButtonText, { color: palette?.text || '#111827' }]}>🏠 Ana Sayfa</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Kategori ve zorluk seçim stilleri
  optionsContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // İpucu stilleri
  hintContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: 'rgba(147, 197, 253, 0.2)',
  },
  hintText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  hintButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // İnfo paneli stilleri
  infoPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  infoItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Liste başlık stilleri
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyListContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  startButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scoreLabel: {
    fontSize: 16,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
  },
  kelimeDisplay: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  kelimeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  kelimeDurum: {
    fontSize: 14,
    marginTop: 4,
  },
  gameBoard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  matrix: {
    justifyContent: 'center',
    alignItems: 'center',
    width: TILE_SIZE * 4 + 32, // 4 sütun + kenar boşlukları
    alignSelf: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  hucre: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  hucreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bulunanKelimeler: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  bulunanBaslik: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  kelimeListesi: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  kelimeItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
  },
  kelimeItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
