// Veritabanındaki kategorili kelimeleri JSON'a aktarma scripti
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

async function exportCategoriesToJSON() {
  let connection;

  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Bağlantı başarılı!\n');

    console.log('📤 Veritabanındaki kategorileri JSON formatına aktarıyorum...');

    // Tüm kategorileri ve kelimelerini al
    const [allWords] = await connection.execute('SELECT word, category FROM kelime_matrisi_words ORDER BY category, word');

    // Kategorilere göre grupla
    const categories = {};
    allWords.forEach(row => {
      if (!categories[row.category]) {
        categories[row.category] = [];
      }
      categories[row.category].push(row.word);
    });

    // JSON formatına dönüştür
    const jsonData = {
      metadata: {
        totalWords: allWords.length,
        totalCategories: Object.keys(categories).length,
        exportDate: new Date().toISOString(),
        source: 'database'
      },
      categories: categories
    };

    // JSON dosyasına yaz
    const outputPath = path.join(__dirname, 'kelimler-kategorili.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log('✅ Kategorili JSON dosyası oluşturuldu!');
    console.log('📁 Dosya yolu:', outputPath);
    console.log('\n📊 İstatistikler:');
    console.log('  - Toplam kelime:', allWords.length);
    console.log('  - Toplam kategori:', Object.keys(categories).length);

    console.log('\n📂 Kategoriler:');
    Object.entries(categories).forEach(([category, words]) => {
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
  await exportCategoriesToJSON();
}

// Script çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { exportCategoriesToJSON };
