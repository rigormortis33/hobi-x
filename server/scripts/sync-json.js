// JSON dosyalarını senkronize etme scripti
const fs = require('fs');
const path = require('path');

function syncJSONFiles() {
  console.log('🔄 JSON dosyaları senkronize ediliyor...');

  // Orijinal JSON'u oku
  const originalWords = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'games', 'turkce_kelimeler.json'), 'utf8'));
  console.log('📄 Orijinal JSON:', originalWords.length, 'kelime');

  // Kategorili JSON'u oku
  const categorizedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'kelimler-kategorili.json'), 'utf8'));

  // Tüm kategorideki kelimeleri bir set'e koy
  const allCategorizedWords = new Set();
  Object.values(categorizedData.categories).forEach(categoryWords => {
    categoryWords.forEach(word => allCategorizedWords.add(word));
  });

  console.log('🗄️  Kategorili JSON:', allCategorizedWords.size, 'kelime');

  // Orijinalde olup kategorilide olmayan kelimeler
  const missingWords = originalWords.filter(word => !allCategorizedWords.has(word.toUpperCase()));
  console.log('➕ Eklenecek kelime sayısı:', missingWords.length);

  if (missingWords.length > 0) {
    console.log('Eklenecek kelimeler:', missingWords.join(', '));

    // Genel kategoriye ekle
    if (!categorizedData.categories.genel) {
      categorizedData.categories.genel = [];
    }
    categorizedData.categories.genel.push(...missingWords.map(w => w.toUpperCase()));

    // Metadata'yı güncelle
    categorizedData.metadata.totalWords += missingWords.length;
    categorizedData.metadata.totalCategories = Object.keys(categorizedData.categories).length;
    categorizedData.metadata.lastSync = new Date().toISOString();

    // Güncellenmiş JSON'u kaydet
    fs.writeFileSync(path.join(__dirname, 'kelimler-kategorili.json'), JSON.stringify(categorizedData, null, 2));
    console.log('✅ Kategorili JSON güncellendi!');
  } else {
    console.log('✅ Tüm kelimeler zaten mevcut!');
  }

  // Final istatistikler
  const finalCount = Object.values(categorizedData.categories).reduce((sum, words) => sum + words.length, 0);
  console.log('\n📊 Final durum:');
  console.log('  - Toplam kelime:', finalCount);
  console.log('  - Toplam kategori:', Object.keys(categorizedData.categories).length);
}

// Ana fonksiyon
function main() {
  syncJSONFiles();
}

// Script çalıştır
if (require.main === module) {
  main();
}

module.exports = { syncJSONFiles };
