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
       '{"maxAttempts": 6, "difficultyLevels": ["kolay", "normal", "zor"]}'),
     ('kelime_matrisi', 'Kelime Matrisi', '4x4 matriste kelimeler bulun!', 'kelime_matrisi_icon.png',
       '{"gridSize": 4, "categories": ["temel", "doga", "esya", "yemek", "aile", "soyut"], "difficultyLevels": ["kolay", "orta", "zor"]}'),
     ('sudoku', 'Sudoku', 'Rakamları doğru yerlere yerleştirin!', 'sudoku_icon.png',
       '{"gridSize": 9, "difficultyLevels": ["kolay", "orta", "zor"], "maxMistakes": 3}'),
     ('kelime_dedektifi', 'Kelime Dedektifi', 'İpucu ile kelimeyi bulun!', 'kelime_dedektifi_icon.png',
       '{"maxLives": 6, "difficultyLevels": ["kolay", "orta", "zor"]}'),
     ('anagram', 'Anagram', 'Harfleri yeniden düzenleyin!', 'anagram_icon.png',
       '{"difficultyLevels": ["kolay", "orta", "zor"]}')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), description = VALUES(description), settings = VALUES(settings)`,

    // Kelime matrisi için kelime tablosu
    `CREATE TABLE IF NOT EXISTS kelime_matrisi_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      word VARCHAR(20) NOT NULL,
      category VARCHAR(50),
      difficulty VARCHAR(20) DEFAULT 'orta',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Sudoku için puzzle tablosu
    `CREATE TABLE IF NOT EXISTS sudoku_puzzles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      puzzle_data JSON NOT NULL,
      solution_data JSON NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'orta',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Kelime dedektifi için kelime tablosu
    `CREATE TABLE IF NOT EXISTS kelime_dedektifi_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      word VARCHAR(50) NOT NULL,
      clue TEXT NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'orta',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

    // Anagram için kelime tablosu
    `CREATE TABLE IF NOT EXISTS anagram_words (
      id INT AUTO_INCREMENT PRIMARY KEY,
      word VARCHAR(50) NOT NULL,
      difficulty VARCHAR(20) DEFAULT 'orta',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci`,

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

    // Kelime matrisi örnek kelimeler
    `INSERT IGNORE INTO kelime_matrisi_words (word, category, difficulty) VALUES
     ('ELMA', 'yemek', 'kolay'),
     ('ARABA', 'esya', 'kolay'),
     ('DENIZ', 'doga', 'kolay'),
     ('GÜNEŞ', 'doga', 'kolay'),
     ('KİTAP', 'esya', 'kolay'),
     ('BİLGİSAYAR', 'esya', 'orta'),
     ('TELEFON', 'esya', 'orta'),
     ('ÇİÇEK', 'doga', 'orta'),
     ('AĞAÇ', 'doga', 'orta'),
     ('OKUL', 'esya', 'orta')`,

    // Kelime dedektifi örnek kelimeler
    `INSERT IGNORE INTO kelime_dedektifi_words (word, clue, difficulty) VALUES
     ('ELMA', 'Kırmızı veya yeşil, ağaçta yetişir.', 'kolay'),
     ('BİLGİSAYAR', 'Kod yazmak için kullanılır.', 'orta'),
     ('KİTAP', 'Okumak için sayfaları çevirirsin.', 'kolay'),
     ('ARABA', 'Tekerlekli, motorlu ulaşım aracı.', 'kolay'),
     ('KEDİ', 'Evcil, miyavlayan hayvan.', 'kolay'),
     ('OKUL', 'Eğitim alınan yer.', 'kolay'),
     ('MÜZİK', 'Dinlenir, notalarla yazılır.', 'orta'),
     ('DENİZ', 'Mavi, tuzlu, yüzülür.', 'kolay'),
     ('GÜNEŞ', 'Dünyayı ısıtır, yıldızdır.', 'kolay'),
     ('ÇİÇEK', 'Renkli, güzel kokar.', 'kolay')`,

    // Anagram örnek kelimeler
    `INSERT IGNORE INTO anagram_words (word, difficulty) VALUES
     ('elma', 'kolay'),
     ('masa', 'kolay'),
     ('araba', 'kolay'),
     ('kalem', 'kolay'),
     ('kitap', 'kolay'),
     ('oyuncak', 'orta'),
     ('bilgisayar', 'zor'),
     ('telefon', 'orta'),
     ('kedi', 'kolay'),
     ('köpek', 'kolay')`,

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
