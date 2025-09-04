const express = require('express');
const router = express.Router();
const { getAllGames, getGame } = require('../games');
const authMiddleware = require('../middlewares/auth');

// Kelime Matrisi özel route'ları
router.get('/kelime-matrisi/generate', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Rastgele 8-12 kelime seç
    const [words] = await connection.execute(
      'SELECT id, word, category, difficulty, hint FROM kelime_matrisi_words ORDER BY RAND() LIMIT ?',
      [Math.floor(Math.random() * 5) + 8] // 8-12 arası
    );

    await connection.end();

    if (words.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Yeterli kelime bulunamadı'
      });
    }

    // Grid oluştur (kelimeleri yerleştirecek şekilde)
    const grid = generateWordGrid(words.map(w => w.word));
    const sessionId = 'km_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    res.json({
      success: true,
      sessionId: sessionId,
      grid: grid,
      totalWords: words.length,
      words: words.map(w => {
        console.log('Word mapping:', w); // Debug log
        return { 
          id: w.id, 
          word: w.word, 
          length: w.word.length, 
          category: w.category, 
          difficulty: w.difficulty, 
          hint: w.hint 
        };
      })
    });
  } catch (error) {
    console.error('Kelime Matrisi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Oyun oluşturulamadı',
      error: error.message
    });
  }
});

// Grid oluşturma fonksiyonu
function generateWordGrid(words) {
  const size = 12; // 12x12 grid
  const grid = Array(size).fill().map(() => Array(size).fill(''));

  // Kelimeleri grid'e yerleştir
  const placedWords = [];
  const directions = [
    [0, 1],   // sağ
    [1, 0],   // aşağı
    [1, 1],   // sağ-aşağı
    [-1, 1],  // sağ-yukarı
    [0, -1],  // sol
    [-1, 0],  // yukarı
    [-1, -1], // sol-yukarı
    [1, -1]   // sol-aşağı
  ];

  for (const word of words) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 50) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      if (canPlaceWord(grid, word, startRow, startCol, direction[0], direction[1])) {
        placeWord(grid, word, startRow, startCol, direction[0], direction[1]);
        placedWords.push({
          word: word,
          startRow: startRow,
          startCol: startCol,
          direction: direction,
          positions: getWordPositions(word, startRow, startCol, direction[0], direction[1])
        });
        placed = true;
      }
      attempts++;
    }
  }

  // Boş hücreleri rastgele harflerle doldur
  const letters = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return grid;
}

function canPlaceWord(grid, word, row, col, dRow, dCol) {
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;

    if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
      return false;
    }

    if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
      return false;
    }
  }
  return true;
}

function placeWord(grid, word, row, col, dRow, dCol) {
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;
    grid[newRow][newCol] = word[i];
  }
}

function getWordPositions(word, row, col, dRow, dCol) {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    positions.push({
      row: row + i * dRow,
      col: col + i * dCol,
      letter: word[i]
    });
  }
  return positions;
}

router.post('/kelime-matrisi/check', async (req, res) => {
  try {
    const { word, sessionId } = req.body;

    if (!word || word.length < 3) {
      return res.json({
        success: false,
        correct: false,
        message: 'Kelime çok kısa (minimum 3 harf)'
      });
    }

    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Veritabanında kelimeyi ara
    const [rows] = await connection.execute(
      'SELECT id, word, category, difficulty, hint FROM kelime_matrisi_words WHERE word = ?',
      [word.toUpperCase()]
    );

    await connection.end();

    if (rows.length > 0) {
      const foundWord = rows[0];
      res.json({
        success: true,
        correct: true,
        word: foundWord.word,
        category: foundWord.category,
        difficulty: foundWord.difficulty,
        hint: foundWord.hint,
        points: calculatePoints(foundWord.word.length, foundWord.difficulty)
      });
    } else {
      res.json({
        success: true,
        correct: false,
        word: word.toUpperCase(),
        message: 'Bu kelime sözlükte bulunamadı',
        points: 0
      });
    }
  } catch (error) {
    console.error('Kelime kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kelime kontrol edilemedi',
      error: error.message
    });
  }
});

// Puan hesaplama fonksiyonu
function calculatePoints(wordLength, difficulty) {
  const basePoints = wordLength * 10;
  const difficultyMultiplier = {
    'kolay': 1,
    'orta': 1.5,
    'zor': 2
  };

  return Math.floor(basePoints * (difficultyMultiplier[difficulty] || 1));
}

// Kelime yönetimi API endpoint'leri
router.get('/kelime-matrisi/stats', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [total] = await connection.execute('SELECT COUNT(*) as count FROM kelime_matrisi_words');
    const [categories] = await connection.execute('SELECT category, COUNT(*) as count FROM kelime_matrisi_words GROUP BY category ORDER BY count DESC LIMIT 10');
    const [difficulties] = await connection.execute('SELECT difficulty, COUNT(*) as count FROM kelime_matrisi_words GROUP BY difficulty');

    await connection.end();

    res.json({
      success: true,
      stats: {
        total: total[0].count,
        categories: categories,
        difficulties: difficulties
      }
    });
  } catch (error) {
    console.error('İstatistik alma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistik alınamadı',
      error: error.message
    });
  }
});

// Rastgele kelime önerisi
router.post('/kelime-matrisi/add-word', async (req, res) => {
  try {
    const { word, category, difficulty, hint } = req.body;

    // Validasyon
    if (!word || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Kelime, kategori ve zorluk seviyesi zorunludur'
      });
    }

    // Kelime kontrolü (sadece Türkçe harfler)
    const turkishRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/;
    if (!turkishRegex.test(word)) {
      return res.status(400).json({
        success: false,
        message: 'Kelime sadece Türkçe harfler içermelidir'
      });
    }

    // Zorluk seviyesi kontrolü
    const validDifficulties = ['kolay', 'orta', 'zor'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz zorluk seviyesi. Geçerli değerler: kolay, orta, zor'
      });
    }

    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Kelime zaten var mı kontrol et
    const [existing] = await connection.execute(
      'SELECT id FROM kelime_matrisi_words WHERE word = ?',
      [word.toLowerCase()]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({
        success: false,
        message: 'Bu kelime zaten mevcut'
      });
    }

    // Kelimeyi ekle
    const [result] = await connection.execute(
      'INSERT INTO kelime_matrisi_words (word, category, difficulty, hint) VALUES (?, ?, ?, ?)',
      [word.toLowerCase(), category, difficulty, hint || '']
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Kelime başarıyla eklendi',
      wordId: result.insertId
    });
  } catch (error) {
    console.error('Kelime ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kelime eklenemedi',
      error: error.message
    });
  }
});

// AI destekli kelime üretimi endpoint'i
router.post('/kelime-matrisi/generate-ai', async (req, res) => {
  try {
    const { category, difficulty, count = 5 } = req.body;

    // OpenAI API çağrısı simülasyonu (gerçek implementasyon için API key gerekli)
    const generatedWords = await generateWordsWithAI(category, difficulty, count);

    // Üretilen kelimeleri veritabanına ekle
    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config({ path: '../.env' });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const addedWords = [];
    for (const wordData of generatedWords) {
      try {
        // Kelime zaten var mı kontrol et
        const [existing] = await connection.execute(
          'SELECT id FROM kelime_matrisi_words WHERE word = ?',
          [wordData.word.toLowerCase()]
        );

        if (existing.length === 0) {
          await connection.execute(
            'INSERT INTO kelime_matrisi_words (word, category, difficulty, hint) VALUES (?, ?, ?, ?)',
            [wordData.word.toLowerCase(), wordData.category, wordData.difficulty, wordData.hint]
          );
          addedWords.push(wordData);
        }
      } catch (error) {
        console.error(`Kelime eklenirken hata (${wordData.word}):`, error);
      }
    }

    await connection.end();

    res.json({
      success: true,
      message: `${addedWords.length} kelime başarıyla üretildi ve eklendi`,
      words: addedWords
    });
  } catch (error) {
    console.error('AI kelime üretimi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI kelime üretimi başarısız',
      error: error.message
    });
  }
});

// AI ile kelime üretme fonksiyonu
async function generateWordsWithAI(category, difficulty, count) {
  // Bu basit bir simülasyon - gerçek OpenAI API entegrasyonu için API key gerekli
  const categories = {
    'Teknoloji': ['yazılım', 'donanım', 'algoritma', 'veritabanı', 'bulut', 'yapayzeka', 'robot', 'sensör', 'mikroişlemci', 'kablosuz'],
    'Bilim': ['fizik', 'kimya', 'biyoloji', 'matematik', 'astronomi', 'jeoloji', 'mikrobiyoloji', 'genetik', 'kuantum', 'evrim'],
    'Spor': ['futbol', 'basketbol', 'tenis', 'yüzme', 'atletizm', 'jimnastik', 'voleybol', 'hentbol', 'boks', 'eskrim'],
    'Doğa': ['orman', 'dağ', 'nehir', 'göl', 'okyanus', 'çöl', 'vadi', 'platö', 'kanyon', 'volkan']
  };

  const words = categories[category] || categories['Teknoloji'];
  const selectedWords = [];

  // Rastgele kelimeler seç
  for (let i = 0; i < count && words.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words.splice(randomIndex, 1)[0];

    selectedWords.push({
      word: word.toUpperCase(),
      category: category,
      difficulty: difficulty,
      hint: getHintForWord(word, category)
    });
  }

  return selectedWords;
}

// Kelime için ipucu üretme
function getHintForWord(word, category) {
  const hints = {
    'Teknoloji': {
      'yazılım': 'Bilgisayar programı',
      'donanım': 'Fiziksel bilgisayar parçası',
      'algoritma': 'Problem çözme adımları',
      'veritabanı': 'Veri depolama sistemi',
      'bulut': 'İnternet tabanlı veri depolama',
      'yapayzeka': 'Akıllı makine öğrenmesi',
      'robot': 'Otomatik çalışan makine',
      'sensör': 'Çevre ölçen cihaz',
      'mikroişlemci': 'Bilgisayar beyni',
      'kablosuz': 'Kablo gerektirmeyen bağlantı'
    },
    'Bilim': {
      'fizik': 'Madde ve enerji bilimi',
      'kimya': 'Maddelerin yapısı ve değişimi',
      'biyoloji': 'Canlılar bilimi',
      'matematik': 'Sayılar ve şekiller bilimi',
      'astronomi': 'Gökyüzü ve uzay bilimi',
      'jeoloji': 'Yer bilimi',
      'mikrobiyoloji': 'Mikroorganizmalar bilimi',
      'genetik': 'Kalıtım bilimi',
      'kuantum': 'Atom altı parçacıklar',
      'evrim': 'Türlerin değişimi'
    }
  };

  return hints[category]?.[word.toLowerCase()] || `${category} ile ilgili terim`;
}

// Otomatik kelime içe aktarma endpoint'i
router.post('/kelime-matrisi/import', async (req, res) => {
  try {
    const { source, category, words } = req.body;

    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config({ path: '../.env' });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    let wordsToImport = [];

    if (source === 'custom' && words) {
      wordsToImport = words;
    } else if (source === 'wikipedia') {
      wordsToImport = await importFromWikipedia(category);
    } else if (source === 'tdk') {
      wordsToImport = await importFromTDK(category);
    }

    const addedWords = [];
    for (const word of wordsToImport) {
      try {
        // Kelime kontrolü
        const cleanWord = word.toLowerCase().trim();
        if (cleanWord.length < 3) continue;

        // Türkçe harf kontrolü
        const turkishRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ\s]+$/;
        if (!turkishRegex.test(cleanWord)) continue;

        // Kelime zaten var mı kontrol et
        const [existing] = await connection.execute(
          'SELECT id FROM kelime_matrisi_words WHERE word = ?',
          [cleanWord]
        );

        if (existing.length === 0) {
          const difficulty = cleanWord.length > 6 ? 'zor' : cleanWord.length > 4 ? 'orta' : 'kolay';
          await connection.execute(
            'INSERT INTO kelime_matrisi_words (word, category, difficulty, hint) VALUES (?, ?, ?, ?)',
            [cleanWord, category, difficulty, `${category} kelimesi`]
          );
          addedWords.push(cleanWord);
        }
      } catch (error) {
        console.error(`Kelime içe aktarılırken hata (${word}):`, error);
      }
    }

    await connection.end();

    res.json({
      success: true,
      message: `${addedWords.length} kelime başarıyla içe aktarıldı`,
      addedCount: addedWords.length,
      words: addedWords
    });
  } catch (error) {
    console.error('İçe aktarma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İçe aktarma başarısız',
      error: error.message
    });
  }
});

// Wikipedia'dan kelime içe aktarma
async function importFromWikipedia(category) {
  // Bu basit bir simülasyon - gerçek Wikipedia API entegrasyonu için
  const categoryWords = {
    'Teknoloji': ['programlama', 'internet', 'mobil', 'tablet', 'akıllı', 'sanal', 'gerçeklik', 'blokzincir', 'kripto', 'veri'],
    'Bilim': ['deney', 'araştırma', 'keşif', 'teori', 'hipotez', 'analiz', 'sentez', 'spekülasyon', 'paradigma', 'metodoloji'],
    'Spor': ['maraton', 'sprint', 'rekortmen', 'şampiyon', 'final', 'yarışma', 'turnuva', 'lig', 'kupa', 'madalya'],
    'Doğa': ['ekosistem', 'biyom', 'habitat', 'biyoçeşitlilik', 'iklim', 'erozyon', 'sediment', 'fotosentez', 'solunum', 'döngü']
  };

  return categoryWords[category] || [];
}

// TDK'dan kelime içe aktarma
async function importFromTDK(category) {
  // Bu basit bir simülasyon - gerçek TDK API entegrasyonu için
  const categoryWords = {
    'Teknoloji': ['bilgi', 'işlem', 'sistem', 'ağ', 'protokol', 'arayüz', 'platform', 'uygulama', 'geliştirme', 'test'],
    'Bilim': ['gözlem', 'ölçüm', 'hesaplama', 'model', 'simülasyon', 'denklem', 'fonksiyon', 'değişken', 'sabit', 'orantı'],
    'Spor': ['antrenman', 'kondisyon', 'teknik', 'strateji', 'takım', 'oyuncu', 'hakem', 'stadyum', 'saha', 'salon'],
    'Doğa': ['çevre', 'koruma', 'sürdürülebilir', 'enerji', 'kaynak', 'atık', 'recycle', 'yenilenebilir', 'fosil', 'karbon']
  };

  return categoryWords[category] || [];
}

// Matriks içinde kelime bulma endpoint'i
router.post('/kelime-matrisi/find-in-matrix', async (req, res) => {
  try {
    const { matrix } = req.body;

    if (!matrix || !Array.isArray(matrix)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz matris verisi'
      });
    }

    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config({ path: '../.env' });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Tüm kelimeleri al
    const [words] = await connection.execute('SELECT word FROM kelime_matrisi_words');
    await connection.end();

    const foundWords = [];
    const matrixWords = words.map(w => w.word.toUpperCase());

    // Matriste kelime ara
    for (const word of matrixWords) {
      const positions = findWordInMatrix(matrix, word);
      if (positions.length > 0) {
        foundWords.push({
          word: word,
          length: word.length,
          positions: positions
        });
      }
    }

    // Ek olarak matriste anlamlı kelimeler ara (3+ harf)
    const additionalWords = findMeaningfulWordsInMatrix(matrix);
    for (const word of additionalWords) {
      // Kelime listesinde yoksa ekle
      if (!matrixWords.includes(word) && word.length >= 3) {
        foundWords.push({
          word: word,
          length: word.length,
          positions: findWordInMatrix(matrix, word),
          isNew: true
        });
      }
    }

    res.json({
      success: true,
      foundWords: foundWords,
      totalFound: foundWords.length
    });
  } catch (error) {
    console.error('Matriks kelime arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kelime arama başarısız',
      error: error.message
    });
  }
});

// Matriste kelime arama fonksiyonu
function findWordInMatrix(matrix, word) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const directions = [
    [0, 1],   // sağ
    [1, 0],   // aşağı
    [1, 1],   // sağ-aşağı
    [1, -1],  // sol-aşağı
    [0, -1],  // sol
    [-1, 0],  // yukarı
    [-1, -1], // sol-yukarı
    [-1, 1]   // sağ-yukarı
  ];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (const [dRow, dCol] of directions) {
        const positions = [];
        let found = true;

        for (let i = 0; i < word.length; i++) {
          const newRow = row + i * dRow;
          const newCol = col + i * dCol;

          if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols ||
              matrix[newRow][newCol] !== word[i]) {
            found = false;
            break;
          }

          positions.push({ row: newRow, col: newCol, letter: word[i] });
        }

        if (found) {
          return positions;
        }
      }
    }
  }

  return [];
}

// Matriste anlamlı kelimeler bulma fonksiyonu
function findMeaningfulWordsInMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const foundWords = new Set();

  // Türkçe kelime kökleri ve ekleri
  const turkishRoots = ['gel', 'git', 'yap', 'et', 'ol', 'ver', 'al', 'bak', 'gör', 'bil', 'çalış', 'yaşa', 'sev', 'söyle', 'oku', 'yaz', 'çiz', 'çalış', 'öğren', 'anla', 'düşün', 'hatırla', 'unut', 'ara', 'bul', 'kaybet', 'kazan', 'kaybet', 'dene', 'başla', 'bitir', 'devam', 'dur', 'bekle', 'acele', 'yavaş', 'hızlı', 'büyük', 'küçük', 'uzun', 'kısa', 'geniş', 'dar', 'yüksek', 'alçak', 'sıcak', 'soğuk', 'temiz', 'kirli', 'güzel', 'çirkin', 'iyi', 'kötü', 'doğru', 'yanlış', 'kolay', 'zor', 'basit', 'karmaşık'];

  // Tüm yönlerde 3+ harfli kelimeler ara
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1],
    [0, -1], [-1, 0], [-1, -1], [-1, 1]
  ];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      for (const [dRow, dCol] of directions) {
        let word = '';

        for (let i = 0; i < Math.min(8, Math.max(rows, cols)); i++) {
          const newRow = row + i * dRow;
          const newCol = col + i * dCol;

          if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
            break;
          }

          word += matrix[newRow][newCol];

          // 3+ harfli kelimeleri kontrol et
          if (word.length >= 3) {
            if (isMeaningfulWord(word)) {
              foundWords.add(word);
            }
          }
        }
      }
    }
  }

  return Array.from(foundWords);
}

// Kelimenin anlamlı olup olmadığını kontrol etme
function isMeaningfulWord(word) {
  // Basit heceleme kontrolü
  const vowels = 'aeıioöuüAEIİOÖUÜ';
  const consonants = 'bcçdfgğhjklmnprsştvyzBCÇDFGĞHJKLMNPRSŞTVYZ';

  // En az bir ünlü harf olmalı
  if (!vowels.split('').some(v => word.includes(v))) {
    return false;
  }

  // Türkçe kelime yapısı kontrolü (basit)
  const hasValidStructure = /^[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/;

  return hasValidStructure.test(word) && word.length >= 3 && word.length <= 12;
}

// Rastgele kelime önerisi
router.get('/kelime-matrisi/suggest', async (req, res) => {
  try {
    const { category, difficulty, count = 5 } = req.query;

    const mysql = require('mysql2/promise');
    const dotenv = require('dotenv');
    dotenv.config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    let query = 'SELECT word, category, difficulty, hint FROM kelime_matrisi_words WHERE 1=1';
    let params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty && difficulty !== 'all') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(parseInt(count));

    const [words] = await connection.execute(query, params);
    await connection.end();

    res.json({
      success: true,
      words: words
    });
  } catch (error) {
    console.error('Kelime önerisi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kelime önerisi alınamadı',
      error: error.message
    });
  }
});

// Genel oyun route'ları - tüm oyunlar için
router.get('/:gameId/generate', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { difficulty = 'orta' } = req.query;

    const game = getGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı'
      });
    }

    const puzzle = await game.generatePuzzle(difficulty);
    res.json({
      success: true,
      ...puzzle
    });
  } catch (error) {
    console.error('Bulmaca oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bulmaca oluşturulamadı'
    });
  }
});

router.post('/:gameId/check', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { puzzleId, answer } = req.body;

    const game = getGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı'
      });
    }

    const result = await game.checkAnswer(puzzleId, answer);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Cevap kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Cevap kontrol edilemedi'
    });
  }
});

// Cevap kontrolü
router.post('/:gameId/puzzle/:puzzleId/check', authMiddleware, async (req, res) => {
  try {
    const { gameId, puzzleId } = req.params;
    const { answer } = req.body;
    const game = getGame(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı'
      });
    }
    
    const result = await game.checkAnswer(puzzleId, answer);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cevap kontrol edilirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
