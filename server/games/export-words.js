const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function exportWordsToJson() {
  try {
    console.log('Veritabanına bağlanılıyor...');

    // Veritabanından kelimeleri çek
    const [rows] = await pool.execute('SELECT word FROM kelime_matrisi_words ORDER BY word');

    if (rows.length === 0) {
      console.log('Veritabanında kelime bulunamadı.');
      return;
    }

    // Kelimeleri büyük harfe çevir ve JSON formatına dönüştür
    const words = rows.map(row => row.word.toUpperCase());

    // JSON dosyasına kaydet
    const jsonPath = path.join(__dirname, 'turkce_kelimeler.json');
    fs.writeFileSync(jsonPath, JSON.stringify(words, null, 2), 'utf8');

    console.log(`✅ ${words.length} kelime başarıyla JSON dosyasına aktarıldı!`);
    console.log(`📁 Dosya yolu: ${jsonPath}`);

  } catch (error) {
    console.error('❌ Kelime export hatası:', error.message);
  } finally {
    process.exit(0);
  }
}

// Script çalıştır
exportWordsToJson();
