// Sabit değerlerle bağlantı testi
const mysql = require('mysql2/promise');

async function testDbConnection() {
  // Doğrudan sabit değerler ile bağlantı
  const dbConfig = {
    host: 'srv1787.hstgr.io',
    user: 'u588148465_hobix',
    password: 'Deneme-33',
    database: 'u588148465_tuncay',
    waitForConnections: true,
    connectionLimit: 1
  };

  console.log('Sabit değerlerle veritabanına bağlanmaya çalışıyorum:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);

  try {
    // Bağlantıyı oluştur
    const connection = await mysql.createConnection(dbConfig);
    console.log('Bağlantı başarılı!');
    
    // Basit bir sorgu çalıştır
    const [results] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('Sorgu sonucu:', results[0].solution);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('Bağlantı hatası:');
    console.error('Hata mesajı:', error.message);
    console.error('Hata kodu:', error.code);
    console.error('Hata numarası:', error.errno);
    
    return false;
  }
}

testDbConnection()
  .then(success => {
    console.log('Test tamamlandı, başarı durumu:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test çalıştırılırken hata:', err);
    process.exit(1);
  });
