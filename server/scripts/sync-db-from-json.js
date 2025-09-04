// Kategorili JSON'dan veritabanını güncelleme scripti
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

async function syncDatabaseFromCategorizedJSON() {
  let connection;

  try {
    console.log('🔄 Kategorili JSON\'dan veritabanı senkronize ediliyor...');
    connection = await mysql.createConnection(dbConfig);

    // Kategorili JSON'u oku
    const categorizedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'kelimler-kategorili.json'), 'utf8'));
    console.log('📄 JSON\'dan yüklenen kelime sayısı:', categorizedData.metadata.totalWords);

    // Mevcut veritabanındaki kelime sayısını kontrol et
    const [existingWords] = await connection.execute('SELECT COUNT(*) as count FROM kelime_matrisi_words');
    console.log('🗄️  Mevcut veritabanı kelime sayısı:', existingWords[0].count);

    // Tüm mevcut kelimeleri sil (tabloyu yeniden dolduracağız)
    await connection.execute('DELETE FROM kelime_matrisi_words');
    console.log('🗑️  Mevcut kelimeler temizlendi');

    // Kategorili JSON'dan kelimeleri ekle
    let totalInserted = 0;
    for (const [category, words] of Object.entries(categorizedData.categories)) {
      console.log(`📝 ${category} kategorisine ${words.length} kelime ekleniyor...`);

      for (const word of words) {
        await connection.execute(
          'INSERT INTO kelime_matrisi_words (word, category) VALUES (?, ?)',
          [word.toUpperCase(), category]
        );
        totalInserted++;
      }
    }

    console.log('✅ Veritabanı başarıyla güncellendi!');
    console.log('📊 Final durum:');
    console.log('  - Eklenen toplam kelime:', totalInserted);
    console.log('  - Kategori sayısı:', Object.keys(categorizedData.categories).length);

    // Kategori dağılımını göster
    console.log('\n📂 Kategori dağılımı:');
    Object.entries(categorizedData.categories).forEach(([category, words]) => {
      console.log('  ' + category + ': ' + words.length + ' kelime');
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Bağlantı kapatıldı');
    }
  }
}

// Ana fonksiyon
async function main() {
  await syncDatabaseFromCategorizedJSON();
}

// Script çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { syncDatabaseFromCategorizedJSON };
