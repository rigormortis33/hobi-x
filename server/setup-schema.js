// Veritabanı şeması yükleme script'i
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🗄️  Veritabanı şeması yükleniyor...\n');

  const dbConfig = {
    host: 'srv1787.hstgr.io',
    user: 'u588148465_garibancoder',
    password: 'Emreninyalanlari33.',
    database: 'u588148465_hobix',
    multipleStatements: true,
    connectTimeout: 10000
  };

  let connection;

  try {
    console.log('🔌 Veritabanına bağlanılıyor...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Bağlantı başarılı!\n');

    // Şema dosyasını oku
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    console.log(`📄 Şema dosyası okunuyor: ${schemaPath}`);

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Şema dosyası bulunamadı: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log(`📏 Şema dosyası boyutu: ${schemaSQL.length} karakter\n`);

    // SQL'i parçalara ayır (semicolon ile)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Çalıştırılacak SQL komut sayısı: ${statements.length}\n`);

    // Her komutu çalıştır
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;

      try {
        console.log(`⚡ Komut ${i + 1}/${statements.length} çalıştırılıyor...`);
        await connection.execute(statement);
        console.log('✅ Başarılı');
      } catch (error) {
        // Bazı hatalar normal olabilir (örn: "table already exists")
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Tablo zaten mevcut, atlanıyor');
        } else {
          console.log(`❌ Hata: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n🎉 Veritabanı şeması başarıyla yüklendi!');
    console.log('📊 Mevcut tablolar kontrol ediliyor...');

    // Tabloları listele
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 Oluşturulan tablolar (${tables.length} adet):`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('\n❌ Şema yükleme hatası:');
    console.error(`   Mesaj: ${error.message}`);
    console.error(`   Kod: ${error.code || 'Bilinmiyor'}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Veritabanı bağlantısı kapatıldı.');
    }
  }
}

setupDatabase();
