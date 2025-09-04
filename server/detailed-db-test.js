// Detaylı MySQL bağlantı testi ve sorun giderme
const mysql = require('mysql2/promise');
const dns = require('dns').promises;

async function detailedTest() {
  console.log('🔍 Detaylı MySQL bağlantı testi başlatılıyor...\n');

  // 1. IP adresini kontrol et
  console.log('📡 IP adresi kontrolü:');
  try {
    const addresses = await dns.lookup('srv1787.hstgr.io');
    console.log(`✅ srv1787.hstgr.io çözümlendi: ${addresses.address}`);
  } catch (error) {
    console.log(`❌ DNS çözümleme hatası: ${error.message}`);
  }

  // 2. Farklı bağlantı yöntemlerini test et
  const testCases = [
    {
      name: 'Temel bağlantı (SSL olmadan)',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_hobix',
        password: 'Deneme-33',
        database: 'u588148465_tuncay',
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      }
    },
    {
      name: 'SSL ile bağlantı',
      config: {
        host: 'srv1787.hstgr.io',
        user: 'u588148465_hobix',
        password: 'Deneme-33',
        database: 'u588148465_tuncay',
        ssl: {
          rejectUnauthorized: false
        },
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      }
    },
    {
      name: 'Port belirtme ile',
      config: {
        host: 'srv1787.hstgr.io',
        port: 3306,
        user: 'u588148465_hobix',
        password: 'Deneme-33',
        database: 'u588148465_tuncay',
        connectTimeout: 10000
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}:`);
    try {
      console.log(`   Host: ${testCase.config.host}`);
      console.log(`   Port: ${testCase.config.port || 3306}`);
      console.log(`   User: ${testCase.config.user}`);
      console.log(`   Database: ${testCase.config.database}`);
      console.log(`   SSL: ${testCase.config.ssl ? 'Evet' : 'Hayır'}`);

      const connection = await mysql.createConnection(testCase.config);
      console.log('✅ Bağlantı başarılı!');

      // Veritabanı bilgilerini kontrol et
      const [dbInfo] = await connection.query('SELECT DATABASE() as current_db, USER() as current_user');
      console.log(`📊 Mevcut veritabanı: ${dbInfo[0].current_db}`);
      console.log(`👤 Mevcut kullanıcı: ${dbInfo[0].current_user}`);

      // Basit sorgu test et
      const [result] = await connection.query('SELECT VERSION() as mysql_version');
      console.log(`🗄️  MySQL sürümü: ${result[0].mysql_version}`);

      await connection.end();
      console.log('✅ Test tamamlandı!');
      return true;

    } catch (error) {
      console.log('❌ Bağlantı hatası:');
      console.log(`   Mesaj: ${error.message}`);
      console.log(`   Kod: ${error.code}`);
      console.log(`   Numara: ${error.errno}`);

      // Özel hata kodlarına göre öneriler
      if (error.errno === 1045) {
        console.log('   💡 Öneri: Kullanıcı adı veya şifre yanlış, ya da IP yetkisi yok');
      } else if (error.errno === 1049) {
        console.log('   💡 Öneri: Veritabanı mevcut değil');
      } else if (error.errno === 2003) {
        console.log('   💡 Öneri: Sunucuya erişilemiyor (firewall, port vb.)');
      } else if (error.errno === 1044) {
        console.log('   💡 Öneri: Kullanıcının veritabanına erişim izni yok');
      }
    }
  }

  console.log('\n❌ Tüm testler başarısız!');
  console.log('\n🔧 Sorun giderme önerileri:');
  console.log('1. Hostinger kontrol panelinde "Remote MySQL" bölümünü kontrol edin');
  console.log('2. IP adresinizin (188.119.43.56) izin listesinde olduğundan emin olun');
  console.log('3. MySQL kullanıcısının doğru veritabanına erişim izni olduğundan emin olun');
  console.log('4. Firewall ayarlarını kontrol edin');
  console.log('5. Hostinger destek ile iletişime geçin');

  return false;
}

detailedTest()
  .then(success => {
    console.log(`\n📋 Genel sonuç: ${success ? 'BAŞARILI' : 'BAŞARISIZ'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n💥 Kritik hata:', err);
    process.exit(1);
  });
