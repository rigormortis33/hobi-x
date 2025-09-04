
const fs = require('fs');
const path = require('path');
const GameModule = require('./GameModule');
const { pool } = require('../config/db');

class KelimeMatrisiGame extends GameModule {
  constructor() {
    super(
      'kelime_matrisi',
      'Kelime Matrisi',
      '4x4 matriste kelimeler bulun!',
      'kelime_matrisi_icon.png'
    );

    this.defaultGridSize = 4;
    this.categories = ['temel', 'doga', 'esya', 'yemek', 'aile', 'soyut'];
    this.wordList = []; // Başlangıçta boş, sonra yüklenecek
    this.initializeWordList();
  }

  // Kelime listesini başlat
  async initializeWordList() {
    this.wordList = await this.loadWordList();
  }


  // Türkçe harfler
  getTurkishLetters() {
    return 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');
  }

  // Kelime veri tabanını yükle
  async loadWordList() {
    try {
      // Önce veritabanından kelimeleri dene
      const [rows] = await pool.query('SELECT word FROM kelime_matrisi_words');
      if (rows && rows.length > 0) {
        console.log(`📚 Veritabanından ${rows.length} kelime yüklendi`);
        return rows.map(row => row.word.toUpperCase());
      }
    } catch (dbError) {
      console.warn('Veritabanından kelime yüklenemedi, JSON fallback kullanılıyor:', dbError.message);
    }

    // Fallback olarak JSON'dan yükle
    try {
      const filePath = path.join(__dirname, 'turkce_kelimeler.json');
      const data = fs.readFileSync(filePath, 'utf8');
      const words = JSON.parse(data);
      console.log(`📄 JSON'dan ${words.length} kelime yüklendi`);
      return words.map(w => w.toUpperCase());
    } catch (fileError) {
      console.error('JSON dosyasından da kelime yüklenemedi:', fileError.message);
      return [];
    }
  }


  // Boş grid oluştur
  generateEmptyGrid(gridSize) {
    return Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
  }

  // Gridde kelime yerleştir
  placeWordsInGrid(words, gridSize) {
    const grid = this.generateEmptyGrid(gridSize);
    const letters = this.getTurkishLetters();
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (const word of words) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const dr = dir[0], dc = dir[1];
        const maxRow = dr === 0 ? gridSize : gridSize - word.length;
        const maxCol = dc === 0 ? gridSize : gridSize - word.length;
        const row = Math.floor(Math.random() * maxRow);
        const col = Math.floor(Math.random() * maxCol);
        // Yerleştirilebilir mi kontrolü
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = row + i * dr;
          const c = col + i * dc;
          if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
            canPlace = false;
            break;
          }
          if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = row + i * dr;
            const c = col + i * dc;
            grid[r][c] = word[i];
          }
          placed = true;
        }
        attempts++;
      }
    }
    // Boş kalan yerlere rastgele harf doldur
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    return grid;
  }

  // Matriste kelime var mı kontrol et
  findWordInGrid(grid, word) {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0], // yatay, dikey
      [1, 1], [1, -1], [-1, 1], [-1, -1] // çapraz
    ];

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (grid[row][col] === word[0]) {
          for (const [dr, dc] of directions) {
            if (this.checkWord(grid, word, row, col, dr, dc)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // Belirli yönde kelime kontrol et
  checkWord(grid, word, row, col, dr, dc) {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dr;
      const newCol = col + i * dc;

      if (newRow < 0 || newRow >= this.gridSize ||
          newCol < 0 || newCol >= this.gridSize ||
          grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    return true;
  }


  // Geniş Türkçe kelime kontrolü
  isValidTurkishWord(word) {
    return this.wordList.includes(word.toUpperCase());
  }


  // Zorluk ayarları
  getDifficultySettings(difficulty) {
    switch (difficulty) {
      case 'kolay':
        return { gridSize: 4, wordCount: 5, minLen: 3, maxLen: 5, bonus: 1 };
      case 'orta':
        return { gridSize: 5, wordCount: 7, minLen: 4, maxLen: 6, bonus: 2 };
      case 'zor':
        return { gridSize: 6, wordCount: 10, minLen: 5, maxLen: 8, bonus: 3 };
      default:
        return { gridSize: this.defaultGridSize, wordCount: 5, minLen: 3, maxLen: 5, bonus: 1 };
    }
  }

  // Zorluk ve kelime yerleştirme ile bulmaca oluştur
  async generatePuzzle(difficulty = 'orta') {
    try {
      // Kelime listesi yüklenmemişse bekle
      if (this.wordList.length === 0) {
        console.log('⏳ Kelime listesi yükleniyor...');
        await this.initializeWordList();
      }

      const settings = this.getDifficultySettings(difficulty);
      // Uygun kelimeleri seç
      const possibleWords = this.wordList.filter(w => w.length >= settings.minLen && w.length <= settings.maxLen);

      if (possibleWords.length === 0) {
        throw new Error(`Yeterli kelime bulunamadı (${settings.minLen}-${settings.maxLen} harf arası)`);
      }

      const selectedWords = [];
      let attempts = 0;
      // Farklı kelimeler seç
      while (selectedWords.length < settings.wordCount && attempts < 100) {
        const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        if (!selectedWords.includes(word)) selectedWords.push(word);
        attempts++;
      }

      if (selectedWords.length < settings.wordCount) {
        console.warn(`⚠️  Sadece ${selectedWords.length}/${settings.wordCount} kelime seçilebildi`);
      }

      // Gridde kelimeleri yerleştir
      const grid = this.placeWordsInGrid(selectedWords, settings.gridSize);
      // Matrisi veritabanına kaydet
      const [result] = await pool.query(
        'INSERT INTO active_puzzles (game_id, content, solution, created_at) VALUES (?, ?, ?, NOW())',
        [this.id, JSON.stringify({ grid: grid, foundWords: [], score: 0, startTime: Date.now(), difficulty }), JSON.stringify({ validWords: selectedWords })]
      );
      return {
        puzzleId: result.insertId,
        puzzle: {
          grid: grid,
          gridSize: settings.gridSize,
          foundWords: [],
          score: 0,
          difficulty
        }
      };
    } catch (error) {
      console.error('Kelime matrisi bulmaca oluşturma hatası:', error);
      throw error;
    }
  }

  // Geçerli kelimeler listesi oluştur
  getValidWords(grid) {
    const validWords = [];

    // Tüm olası kelime kombinasyonlarını dene
    for (let len = 3; len <= 8; len++) {
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0],
            [1, 1], [1, -1], [-1, 1], [-1, -1]
          ];

          for (const [dr, dc] of directions) {
            let word = '';
            for (let i = 0; i < len; i++) {
              const newRow = row + i * dr;
              const newCol = col + i * dc;

              if (newRow < 0 || newRow >= this.gridSize ||
                  newCol < 0 || newCol >= this.gridSize) {
                break;
              }
              word += grid[newRow][newCol];
            }

            if (word.length === len && this.isValidTurkishWord(word)) {
              validWords.push(word);
            }
          }
        }
      }
    }

    return [...new Set(validWords)]; // Tekrarları kaldır
  }


  async checkAnswer(puzzleId, answer) {
    try {
      // Aktif bulmacayı al
      const [puzzleRows] = await pool.query(
        'SELECT * FROM active_puzzles WHERE id = ? AND game_id = ?',
        [puzzleId, this.id]
      );
      if (puzzleRows.length === 0) {
        throw new Error('Bulmaca bulunamadı');
      }
      const puzzle = puzzleRows[0];
      const content = JSON.parse(puzzle.content);
      const solution = JSON.parse(puzzle.solution);
      const grid = content.grid;
      const foundWords = content.foundWords || [];
      const validWords = solution.validWords || [];
      const difficulty = content.difficulty || 'orta';
      const settings = this.getDifficultySettings(difficulty);
      // Kelimeyi kontrol et
      const word = answer.word.toUpperCase();
      const isValid = validWords.includes(word) && this.findWordInGrid(grid, word) && !foundWords.includes(word);
      let newFoundWords = [...foundWords];
      let score = content.score || 0;
      let bonus = 0;
      if (isValid) {
        newFoundWords.push(word);
        // Skor hesapla: kelime uzunluğu * 10 * zorluk bonusu
        score += word.length * 10 * settings.bonus;
        // Bonus: ardışık doğru cevaplar
        if (newFoundWords.length > 1 && newFoundWords[newFoundWords.length-2].length === word.length) {
          bonus = 10 * settings.bonus;
          score += bonus;
        }
      }
      // Güncel durumu kaydet
      const updatedContent = {
        grid: grid,
        foundWords: newFoundWords,
        score: score,
        difficulty
      };
      await pool.query(
        'UPDATE active_puzzles SET content = ? WHERE id = ?',
        [JSON.stringify(updatedContent), puzzleId]
      );
      return {
        correct: isValid,
        word: word,
        foundWords: newFoundWords,
        score: score,
        validWords: validWords,
        bonus,
        completed: newFoundWords.length >= validWords.length
      };
    } catch (error) {
      console.error('Kelime matrisi cevap kontrolü hatası:', error);
      throw error;
    }
  }


  // Oyuna özgü ayarları döndür
  getSettings() {
    return {
      ...super.getSettings(),
      defaultGridSize: this.defaultGridSize,
      categories: this.categories,
      difficultyLevels: ['kolay', 'orta', 'zor'],
      wordListSize: this.wordList.length
    };
  }
}

module.exports = new KelimeMatrisiGame();
