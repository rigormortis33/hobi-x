// Eksik kelime bulma scripti
const fs = require('fs');
const path = require('path');

function findMissingWords() {
  // Orijinal JSON'u oku
  const originalWords = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'games', 'turkce_kelimeler.json'), 'utf8'));

  // Kategorili JSON'u oku
  const categorizedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'kelimler-kategorili.json'), 'utf8'));

  // Tüm kategorideki kelimeleri bir set'e koy
  const allCategorizedWords = new Set();
  Object.values(categorizedData.categories).forEach(categoryWords => {
    categoryWords.forEach(word => allCategorizedWords.add(word));
  });

  // Orijinalde olup kategorilide olmayan kelimeler
  const missingWords = [];
  originalWords.forEach(word => {
    if (!allCategorizedWords.has(word.toUpperCase())) {
      missingWords.push(word);
    }
  });

  console.log('📄 Orijinal JSON:', originalWords.length, 'kelime');
  console.log('🗄️  Kategorili JSON:', allCategorizedWords.size, 'kelime');
  console.log('➕ Eksik kelime sayısı:', missingWords.length);

  if (missingWords.length > 0) {
    console.log('Eksik kelimeler:', missingWords.join(', '));

    // Eksik kelimeyi genel kategoriye ekle
    if (!categorizedData.categories.genel) {
      categorizedData.categories.genel = [];
    }
    categorizedData.categories.genel.push(missingWords[0].toUpperCase());

    // Metadata'yı güncelle
    categorizedData.metadata.totalWords += 1;
    categorizedData.metadata.lastSync = new Date().toISOString();

    // Güncellenmiş JSON'u kaydet
    fs.writeFileSync(path.join(__dirname, 'kelimler-kategorili.json'), JSON.stringify(categorizedData, null, 2));
    console.log('✅ Eksik kelime eklendi!');
  } else {
    console.log('✅ Tüm kelimeler mevcut!');
  }
}

// Ana fonksiyon
function main() {
  findMissingWords();
}

// Script çalıştır
if (require.main === module) {
  main();
}

module.exports = { findMissingWords };
