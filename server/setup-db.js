// Veritabanı şeması kurulum betiği
const { pool } = require('./config/db');

async function createSchema() {
  console.log('Veritabanı şeması oluşturuluyor...');
  
  const queries = [
    // Türkçe karakter desteği için karakter setini ayarla
    "SET NAMES utf8mb4",
    "SET character_set_connection = utf8mb4",
    
    // Kullanıcılar tablosu
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      avatar VARCHAR(255),
      points INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL,
      is_admin BOOLEAN DEFAULT FALSE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Oyun türleri tablosu
    `CREATE TABLE IF NOT EXISTS game_types (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      enabled BOOLEAN DEFAULT TRUE,
      settings JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Adam asmaca kelimeleri tablosu
    `CREATE TABLE IF NOT EXISTS hangman_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      word VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      difficulty VARCHAR(20) DEFAULT 'normal',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Aktif bulmacalar tablosu
    `CREATE TABLE IF NOT EXISTS active_puzzles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      game_id VARCHAR(50) NOT NULL,
      user_id INT,
      content JSON NOT NULL,
      solution TEXT NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'normal',
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (game_id) REFERENCES game_types(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Kullanıcı skorları tablosu
    `CREATE TABLE IF NOT EXISTS user_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      game_id VARCHAR(50) NOT NULL,
      score INT NOT NULL,
      puzzle_id INT,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (game_id) REFERENCES game_types(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`
  ];

  try {
    const connection = await pool.getConnection();
    
    for (const query of queries) {
      console.log('Çalıştırılıyor:', query.split('(')[0] + '...');
      await connection.query(query);
    }
    
    connection.release();
    console.log('✓ Tüm tablolar başarıyla oluşturuldu!');
    return true;
  } catch (error) {
    console.error('✗ Şema oluşturma hatası:', error.message);
    return false;
  }
}

async function insertSampleData() {
  console.log('\nÖrnek veriler ekleniyor...');
  
  const sampleQueries = [
    // Adam Asmaca oyununu ekle
    `INSERT INTO game_types (id, name, description, icon, settings)
     VALUES ('hangman', 'Adam Asmaca', 'Kelimeyi tahmin etmeye çalışın!', 'hangman_icon.png', 
       '{"maxAttempts": 6, "difficultyLevels": ["kolay", "normal", "zor"]}')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), description = VALUES(description)`,

    // Örnek kelimeler
    `INSERT IGNORE INTO hangman_words (word, category, difficulty) VALUES
     ('KALEM', 'Okul', 'kolay'),
     ('KİTAP', 'Okul', 'kolay'),
     ('DEFTER', 'Okul', 'kolay'),
     ('BİLGİSAYAR', 'Teknoloji', 'normal'),
     ('TELEFON', 'Teknoloji', 'normal'),
     ('PENCERE', 'Ev', 'normal'),
     ('MASAÜSTÜ', 'Teknoloji', 'normal'),
     ('MİKRODENETLEYİCİ', 'Teknoloji', 'zor'),
     ('DÜZGÜNALTIGEN', 'Matematik', 'zor'),
     ('ALGORİTMA', 'Teknoloji', 'zor')`,

    // Admin kullanıcısı oluştur (şifre: admin123)
    `INSERT INTO users (username, email, password, full_name, is_admin)
     VALUES ('admin', 'admin@hobi-x.com', '$2b$10$JAuULjrS8Z.DcBRHmSJxGO1Tq1vLBpFzpKjiLJO.TTxXn3JhUGJYC', 'Sistem Yöneticisi', TRUE)
     ON DUPLICATE KEY UPDATE email = VALUES(email)`
  ];

  try {
    const connection = await pool.getConnection();
    
    for (const query of sampleQueries) {
      console.log('Veri ekleniyor...');
      await connection.query(query);
    }
    
    connection.release();
    console.log('✓ Örnek veriler başarıyla eklendi!');
    return true;
  } catch (error) {
    console.error('✗ Veri ekleme hatası:', error.message);
    return false;
  }
}

async function setupDatabase() {
  try {
    console.log('Veritabanı kurulumu başlatılıyor...\n');
    
    const schemaResult = await createSchema();
    if (!schemaResult) {
      console.log('Şema oluşturma başarısız, işlem durduruluyor.');
      return;
    }
    
    const dataResult = await insertSampleData();
    if (!dataResult) {
      console.log('Veri ekleme başarısız, ancak şema oluşturuldu.');
      return;
    }
    
    console.log('\n🎉 Veritabanı kurulumu başarıyla tamamlandı!');
    console.log('Admin kullanıcısı: admin / admin123');
    console.log('Sunucuyu başlatmak için: npm start');
    
  } catch (error) {
    console.error('Kurulum sırasında beklenmedik hata:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
