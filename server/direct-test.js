// Sabit değerlerle bağlantı testi
const mysql = require('mysql2/promise');

async function testDbConnection() {
  // Farklı kombinasyonları test et
  const testConfigs = [
    {
      name: 'Direct-test.js bilgileri',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_garibancoder',
        password: 'Emreninyalanlari33.',
        database: 'u588148465_hobix',
        waitForConnections: true,
        connectionLimit: 1,
        ssl: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: '.env bilgileri',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_tuncay',
        password: 'Emreninyalanlari33.',
        database: 'u588148465_hobix',
        waitForConnections: true,
        connectionLimit: 1,
        ssl: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: 'SSL olmadan direct-test',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_hobix',
        password: 'Deneme-33',
        database: 'u588148465_tuncay',
        waitForConnections: true,
        connectionLimit: 1
      }
    },
    {
      name: 'SSL olmadan .env',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_tuncay',
        password: 'Emreninyalanlari33.',
        database: 'u588148465_hobix',
        waitForConnections: true,
        connectionLimit: 1
      }
    }
  ];

  for (const testCase of testConfigs) {
    console.log(`\n=== ${testCase.name} testi ===`);
    console.log(`Host: ${testCase.config.host}`);
    console.log(`User: ${testCase.config.user}`);
    console.log(`Database: ${testCase.config.database}`);
    console.log(`SSL: ${testCase.config.ssl ? 'Evet' : 'Hayır'}`);

    try {
      const connection = await mysql.createConnection(testCase.config);
      console.log('✅ Bağlantı başarılı!');
      
      const [results] = await connection.query('SELECT 1 + 1 AS solution');
      console.log('✅ Sorgu sonucu:', results[0].solution);
      
      await connection.end();
      console.log('✅ Test başarılı!');
      return true;
    } catch (error) {
      console.error('❌ Bağlantı hatası:', error.message);
      console.error('❌ Hata kodu:', error.code);
      console.error('❌ Hata numarası:', error.errno);
    }
  }
  
  console.log('\n❌ Tüm testler başarısız oldu!');
  return false;
}

testDbConnection()
  .then(success => {
    console.log('\nGenel sonuç:', success ? 'Başarılı' : 'Başarısız');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test çalıştırılırken hata:', err);
    process.exit(1);
  });
