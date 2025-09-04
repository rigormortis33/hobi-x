const GameModule = require('./GameModule');
const { pool } = require('../config/db');

class KelimeDedektifiGame extends GameModule {
  constructor() {
    super(
      'kelime_dedektifi',
      'Kelime Dedektifi',
      'İpucu ile kelimeyi bulun!',
      'kelime_dedektifi_icon.png'
    );

    this.maxLives = 6;
  }

  async generatePuzzle(difficulty = 'orta') {
    try {
      // Veritabanından zorluk seviyesine göre rastgele kelime seç
      const [rows] = await pool.query(
        'SELECT * FROM kelime_dedektifi_words WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
        [difficulty]
      );

      if (rows.length === 0) {
        throw new Error('Uygun kelime bulunamadı');
      }

      const wordData = rows[0];
      const word = wordData.word.toUpperCase();

      // Kelimeyi veritabanına kaydet
      const [result] = await pool.query(
        'INSERT INTO active_puzzles (game_id, content, solution, created_at) VALUES (?, ?, ?, NOW())',
        [this.id, JSON.stringify({
          word: '_'.repeat(word.length),
          guessedLetters: [],
          wrongLetters: [],
          lives: this.maxLives,
          clue: wordData.clue
        }), word]
      );

      return {
        puzzleId: result.insertId,
        puzzle: {
          word: '_'.repeat(word.length),
          length: word.length,
          guessedLetters: [],
          wrongLetters: [],
          lives: this.maxLives,
          clue: wordData.clue
        }
      };
    } catch (error) {
      console.error('Kelime dedektifi bulmaca oluşturma hatası:', error);
      throw error;
    }
  }

  async checkAnswer(puzzleId, guess) {
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
      const solution = puzzle.solution;
      let currentState = JSON.parse(puzzle.content);

      let wordState = currentState.word.split('');
      let guessedLetters = currentState.guessedLetters || [];
      let wrongLetters = currentState.wrongLetters || [];
      let lives = currentState.lives;
      let found = false;

      // Tek bir harf tahmin edildiyse
      if (guess.length === 1) {
        const letter = guess.toUpperCase();

        if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
          return {
            word: wordState.join(''),
            guessedLetters: guessedLetters,
            wrongLetters: wrongLetters,
            lives: lives,
            found: false,
            message: 'Bu harfi zaten tahmin ettiniz!'
          };
        }

        // Kelimenin içinde harfi kontrol et
        for (let i = 0; i < solution.length; i++) {
          if (solution[i].toUpperCase() === letter) {
            wordState[i] = solution[i]; // Orijinal harfi koru
            found = true;
          }
        }

        if (found) {
          guessedLetters.push(letter);
        } else {
          wrongLetters.push(letter);
          lives--;
        }
      }
      // Tüm kelimeyi tahmin ediyorsa
      else if (guess.length === solution.length) {
        if (guess.toUpperCase() === solution.toUpperCase()) {
          wordState = solution.split('');
          found = true;
        } else {
          lives--;
        }
      }

      const completed = wordState.join('') === solution;
      const failed = lives <= 0;

      // Güncel durumu güncelle
      const updatedContent = {
        word: wordState.join(''),
        guessedLetters: guessedLetters,
        wrongLetters: wrongLetters,
        lives: lives,
        clue: currentState.clue
      };

      await pool.query(
        'UPDATE active_puzzles SET content = ?, completed = ? WHERE id = ?',
        [JSON.stringify(updatedContent), completed || failed ? 1 : 0, puzzleId]
      );

      return {
        word: wordState.join(''),
        guessedLetters: guessedLetters,
        wrongLetters: wrongLetters,
        lives: lives,
        found: found,
        completed: completed,
        failed: failed,
        solution: (completed || failed) ? solution : null
      };
    } catch (error) {
      console.error('Kelime dedektifi cevap kontrolü hatası:', error);
      throw error;
    }
  }

  // Oyuna özgü ayarları döndür
  getSettings() {
    return {
      ...super.getSettings(),
      maxLives: this.maxLives,
      difficultyLevels: ['kolay', 'orta', 'zor']
    };
  }
}

module.exports = new KelimeDedektifiGame();
