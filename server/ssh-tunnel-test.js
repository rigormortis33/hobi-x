// SSH Tunneling ile MySQL bağlantı testi
const mysql = require('mysql2/promise');

async function testSSHTunnel() {
  console.log('🔒 SSH Tunneling ile MySQL bağlantı testi\n');

  // SSH Tunneling ayarları
  const tunnelConfig = {
    host: '127.0.0.1',        // Yerel tunnel endpoint
    port: 3307,               // Yerel tunnel port
    user: 'u588148465_hobix', // MySQL kullanıcı adı
    password: 'Deneme-33',    // MySQL şifre
    database: 'u588148465_tuncay', // Veritabanı adı
    connectTimeout: 10000,
    acquireTimeout: 10000
  };

  console.log('📡 Tunnel bağlantı bilgileri:');
  console.log(`   Host: ${tunnelConfig.host}`);
  console.log(`   Port: ${tunnelConfig.port}`);
  console.log(`   User: ${tunnelConfig.user}`);
  console.log(`   Database: ${tunnelConfig.database}`);
  console.log('');

  try {
    console.log('🔌 Bağlantı kuruluyor...');
    const connection = await mysql.createConnection(tunnelConfig);

    console.log('✅ SSH Tunnel üzerinden bağlantı başarılı!');

    // Veritabanı bilgilerini kontrol et
    const [dbInfo] = await connection.query('SELECT DATABASE() as current_db, USER() as current_user, VERSION() as mysql_version');
    console.log('📊 Veritabanı bilgileri:');
    console.log(`   Mevcut DB: ${dbInfo[0].current_db}`);
    console.log(`   Kullanıcı: ${dbInfo[0].current_user}`);
    console.log(`   MySQL Versiyon: ${dbInfo[0].mysql_version}`);

    // Test sorgusu
    const [result] = await connection.query('SELECT 1 + 1 AS test_result');
    console.log(`🧪 Test sorgusu sonucu: ${result[0].test_result}`);

    // Tablo kontrolü
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Mevcut tablolar (${tables.length} adet):`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });

    await connection.end();
    console.log('\n✅ Test tamamlandı - SSH Tunneling çalışıyor!');

    return true;

  } catch (error) {
    console.log('\n❌ SSH Tunnel bağlantı hatası:');
    console.log(`   Mesaj: ${error.message}`);
    console.log(`   Kod: ${error.code || 'Bilinmiyor'}`);
    console.log(`   Numara: ${error.errno || 'Bilinmiyor'}`);

    console.log('\n🔧 Sorun giderme:');
    console.log('1. SSH tunneling\'in çalıştığından emin olun:');
    console.log('   ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io');
    console.log('');
    console.log('2. SSH bağlantısı için doğru kullanıcı adı ve anahtar kullandığınızdan emin olun');
    console.log('3. Hostinger\'da SSH erişiminin aktif olduğunu kontrol edin');
    console.log('4. Güvenlik duvarının 22. portu engellemediğini kontrol edin');

    return false;
  }
}

// Ana fonksiyon
async function main() {
  console.log('🚀 SSH Tunneling MySQL Test Başlatılıyor...\n');

  // Önce SSH tunneling'in çalışıp çalışmadığını kontrol et
  console.log('⚠️  Önemli: Bu test için SSH tunneling aktif olmalı!');
  console.log('   Terminal\'de şu komutu çalıştırın:');
  console.log('   ssh -i ~/.ssh/id_rsa -L 3307:127.0.0.1:3306 -N u588148465@srv1787.hstgr.io &\n');

  // Kısa bekleme
  console.log('⏳ 3 saniye bekleniyor... (SSH tunnel\'un kurulması için)');
  await new Promise(resolve => setTimeout(resolve, 3000));

  const success = await testSSHTunnel();

  console.log(`\n📋 Genel Sonuç: ${success ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`);

  if (success) {
    console.log('\n🎉 Tebrikler! SSH Tunneling çalışıyor.');
    console.log('📝 Şimdi .env dosyanızda şu ayarları kullanabilirsiniz:');
    console.log('   DB_HOST=127.0.0.1');
    console.log('   DB_PORT=3307');
    console.log('   DB_USER=u588148465_hobix');
    console.log('   DB_PASSWORD=Deneme-33');
    console.log('   DB_NAME=u588148465_tuncay');
  }

  process.exit(success ? 0 : 1);
}

main().catch(err => {
  console.error('\n💥 Kritik hata:', err);
  process.exit(1);
});
