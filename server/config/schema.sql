-- Türkçe karakter desteği için veritabanı oluştur (eğer mevcut değilse)
CREATE DATABASE IF NOT EXISTS u588148465_tuncay
CHARACTER SET utf8mb4
COLLATE utf8mb4_turkish_ci;

USE u588148465_tuncay;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
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
);

-- Oyun türleri tablosu
CREATE TABLE IF NOT EXISTS game_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Aktif bulmacalar tablosu
CREATE TABLE IF NOT EXISTS active_puzzles (
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
);

-- Adam asmaca kelimeleri tablosu
CREATE TABLE IF NOT EXISTS hangman_words (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı skorları tablosu
CREATE TABLE IF NOT EXISTS user_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  puzzle_id INT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES game_types(id)
);

-- Örnek verileri ekle (Adam Asmaca için)
INSERT INTO game_types (id, name, description, icon, settings)
VALUES 
  ('hangman', 'Adam Asmaca', 'Kelimeyi tahmin etmeye çalışın!', 'hangman_icon.png', 
   '{"maxAttempts": 6, "difficultyLevels": ["kolay", "normal", "zor"]}')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- Örnek kelimeler
INSERT INTO hangman_words (word, category, difficulty) VALUES
  ('KALEM', 'Okul', 'kolay'),
  ('KİTAP', 'Okul', 'kolay'),
  ('BİLGİSAYAR', 'Teknoloji', 'normal'),
  ('PENCERE', 'Ev', 'normal'),
  ('MİKRODENETLEYİCİ', 'Teknoloji', 'zor'),
  ('DÜZGÜNALTIGEN', 'Matematik', 'zor')
ON DUPLICATE KEY UPDATE
  word = VALUES(word);

-- Admin kullanıcısı oluştur
INSERT INTO users (username, email, password, full_name, is_admin)
VALUES 
  ('admin', 'admin@hobi-x.com', '$2b$10$JAuULjrS8Z.DcBRHmSJxGO1Tq1vLBpFzpKjiLJO.TTxXn3JhUGJYC', 'Sistem Yöneticisi', TRUE)
ON DUPLICATE KEY UPDATE
  email = VALUES(email);
