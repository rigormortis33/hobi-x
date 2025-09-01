// Test için .env dosyasını doğrudan yükleme
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// .env dosyasını doğru yoldan yükle
const envPath = path.resolve(__dirname, './.env');  // Server klasörü içinde
if (fs.existsSync(envPath)) {
  console.log('ENV dosyası bulundu:', envPath);
  dotenv.config({ path: envPath });
} else {
  console.log('ENV dosyası bulunamadı:', envPath);
}

// Bağlantı ayarları
const dbConfig = {
  host: process.env.DB_HOST || 'srv1787.hstgr.io',
  user: process.env.DB_USER || 'u588148465_hobix',
  password: process.env.DB_PASSWORD || 'Emreninyalanlari33.',
  database: process.env.DB_NAME || 'u588148465_tuncay',
  port: process.env.DB_PORT || 3306
};

console.log('Bağlantı ayarları:');
console.log('Host:', dbConfig.host);
console.log('User:', dbConfig.user);
console.log('Database:', dbConfig.database);
console.log('Port:', dbConfig.port);

async function testDatabaseConnection() {
  console.log('\nVeritabanına bağlanılıyor...');
  
  try {
    // Bağlantıyı oluştur
    const connection = await mysql.createConnection(dbConfig);
    console.log('✓ Bağlantı başarılı!');
    
    // Test sorgusu çalıştır
    const [results] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('✓ Sorgu sonucu:', results[0].solution);
    
    // Veritabanı sürümünü kontrol et
    const [versionResults] = await connection.query('SELECT VERSION() as version');
    console.log('✓ MySQL Versiyonu:', versionResults[0].version);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('✗ Bağlantı hatası:');
    console.error('  → Hata mesajı:', error.message);
    
    if (error.message.includes('Access denied')) {
      console.error('  → Kullanıcı adı veya şifre yanlış olabilir');
      console.error('  → VEYA IP adresiniz MySQL sunucusunda izinli değil');
      
      // IP adresini çıkar
      const ipMatch = error.message.match(/'[^']*'@'([^']*)'/);
      const ipAddress = ipMatch ? ipMatch[1] : 'bilinmeyen';
      
      console.error(`  → IP Adresiniz: ${ipAddress}`);
      console.error('  → Hostinger kontrol panelinden "Uzak MySQL" bölümüne bu IP adresini eklediğinizden emin olun');
    }
    
    console.error('  → Hata kodu:', error.code);
    console.error('  → Hata numarası:', error.errno);
    return false;
  }
}

testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\nTest başarıyla tamamlandı!');
    } else {
      console.log('\nBağlantı başarısız oldu. Lütfen ayarlarınızı kontrol edin.');
    }
  })
  .catch(err => {
    console.error('Test çalıştırılırken beklenmedik bir hata oluştu:', err);
  });
