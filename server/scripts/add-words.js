// Otomatik kelime ekleme scripti
// Kullanım: node add-words.js [kelime1] [kelime2] ... [--category=kategori]

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Veritabanı bağlantı bilgileri
const dbConfig = {
  host: 'srv1787.hstgr.io',
  user: 'u588148465_garibancoder',
  password: 'Emreninyalanlari33.',
  database: 'u588148465_hobix',
  connectTimeout: 10000
};

// Komut satırı argümanlarını işle
function parseArgs() {
  const args = process.argv.slice(2);
  const words = [];
  let category = 'genel';

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      category = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      // Dosyadan kelime oku
      const filePath = arg.split('=')[1];
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileWords = JSON.parse(fileContent);
        words.push(...fileWords);
      } catch (error) {
        console.error(`Dosya okunamadı: ${filePath}`, error.message);
        process.exit(1);
      }
    } else {
      words.push(arg.toUpperCase());
    }
  }

  return { words, category };
}

// Kelimeleri veritabanına ekle
async function addWords(words, category = 'genel') {
  let connection;

  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Bağlantı başarılı!\n');

    // Tablo var mı kontrol et, yoksa oluştur
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS kelime_matrisi_words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50) DEFAULT 'genel',
        difficulty VARCHAR(20) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_difficulty (difficulty)
      )
    `);

    console.log(`📝 ${words.length} kelime ekleniyor (kategori: ${category})...`);

    // Kelimeleri tek tek ekle (çakışmaları önle)
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const word of words) {
      try {
        await connection.execute(
          'INSERT INTO kelime_matrisi_words (word, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE word = word',
          [word.toUpperCase(), category]
        );
        insertedCount++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          duplicateCount++;
        } else {
          throw error;
        }
      }
    }

    console.log(`✅ ${insertedCount} yeni kelime eklendi`);
    if (duplicateCount > 0) {
      console.log(`⚠️  ${duplicateCount} kelime zaten mevcut (atlandı)`);
    }

    // İstatistikleri göster
    const [stats] = await connection.execute(`
      SELECT
        category,
        COUNT(*) as total,
        AVG(CHAR_LENGTH(word)) as avg_length,
        MIN(CHAR_LENGTH(word)) as min_length,
        MAX(CHAR_LENGTH(word)) as max_length
      FROM kelime_matrisi_words
      GROUP BY category
      ORDER BY total DESC
    `);

    console.log('\n📊 Kategori İstatistikleri:');
    stats.forEach(stat => {
      const avgLength = stat.avg_length ? Number(stat.avg_length).toFixed(1) : 'N/A';
      console.log(`  ${stat.category}: ${stat.total} kelime (ortalama: ${avgLength} harf)`);
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Bağlantı kapatıldı');
    }
  }
}

// Örnek kelime listesi
const exampleWords = [
  'VOLKAN', 'ŞELALE', 'GÖLGE', 'ALGORİTMA', 'VERİTABANI',
  'BULUT', 'KUANTUM', 'EVREN', 'MOLEKÜL', 'ELEKTROMANYETİK',
  'FOTOELEKTRİK', 'TERMODİNAMİK', 'KROMOZOM', 'MİKRODENETLEYİCİ',
  'NANOTEKNOLOJİ', 'BİYOTEKNOLOJİ', 'KÜRESEL', 'İKLİM', 'ENERJİ'
];

// Ana fonksiyon
async function main() {
  const { words, category } = parseArgs();

  if (words.length === 0) {
    console.log('📚 Kullanım örnekleri:');
    console.log('  node add-words.js VOLKAN ŞELALE GÖLGE');
    console.log('  node add-words.js --category=doga VOLKAN ŞELALE');
    console.log('  node add-words.js --file=kelimeler.json');
    console.log('  node add-words.js --category=teknoloji ALGORİTMA VERİTABANI');
    console.log('\n🎯 Örnek kelimeler ekleniyor...');
    await addWords(exampleWords, 'ornek');
  } else {
    await addWords(words, category);
  }
}

// Script çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addWords, parseArgs };
