const GameModule = require('./GameModule');
const { pool } = require('../config/db');

class HangmanGame extends GameModule {
  constructor() {
    super(
      'hangman',
      'Adam Asmaca',
      'Kelimeyi tahmin etmeye çalışın, her yanlış harfte adam biraz daha asılır!',
      'hangman_icon.png'
    );
    
    this.maxAttempts = 6;
  }

  async generatePuzzle(difficulty = 'normal') {
    try {
      // Veritabanından zorluk seviyesine göre rastgele kelime seçme
      const [rows] = await pool.query(
        'SELECT * FROM hangman_words WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
        [difficulty]
      );

      if (rows.length === 0) {
        throw new Error('Uygun kelime bulunamadı');
      }

      const word = rows[0].word;
      
      // Kelimeyi veritabanına kaydet ve ID'sini döndür
      const [result] = await pool.query(
        'INSERT INTO active_puzzles (game_id, content, solution, created_at) VALUES (?, ?, ?, NOW())',
        [this.id, JSON.stringify({ word: '_'.repeat(word.length), attempts: 0 }), word]
      );

      return {
        puzzleId: result.insertId,
        puzzle: {
          word: '_'.repeat(word.length),
          length: word.length,
          attempts: 0,
          maxAttempts: this.maxAttempts
        }
      };
    } catch (error) {
      console.error('Bulmaca oluşturma hatası:', error);
      throw error;
    }
  }

  async checkAnswer(puzzleId, guess) {
    try {
      // Aktif bulmacayı veritabanından al
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
      let attempts = currentState.attempts;
      let found = false;

      // Tek bir harf tahmin edildiyse
      if (guess.length === 1) {
        // Kelimenin içinde harfi kontrol et
        for (let i = 0; i < solution.length; i++) {
          if (solution[i].localeCompare(guess, 'tr', { sensitivity: 'base' }) === 0) {
            wordState[i] = solution[i]; // Orijinal harfi koru (büyük/küçük)
            found = true;
          }
        }

        if (!found) {
          attempts++;
        }
      }
      // Tüm kelimeyi tahmin ediyorsa
      else if (guess.length === solution.length) {
        if (guess.localeCompare(solution, 'tr', { sensitivity: 'base' }) === 0) {
          wordState = solution.split('');
        } else {
          attempts++;
        }
      }

      const completed = wordState.join('') === solution;
      const failed = attempts >= this.maxAttempts;

      // Güncel durumu güncelle
      const updatedContent = { 
        word: wordState.join(''), 
        attempts: attempts 
      };
      
      await pool.query(
        'UPDATE active_puzzles SET content = ?, completed = ? WHERE id = ?',
        [JSON.stringify(updatedContent), completed || failed ? 1 : 0, puzzleId]
      );

      return {
        word: wordState.join(''),
        attempts: attempts,
        maxAttempts: this.maxAttempts,
        found: found,
        completed: completed,
        failed: failed,
        solution: (completed || failed) ? solution : null
      };
    } catch (error) {
      console.error('Cevap kontrolü hatası:', error);
      throw error;
    }
  }

  // Oyuna özgü ayarları döndür
  getSettings() {
    return {
      ...super.getSettings(),
      maxAttempts: this.maxAttempts,
      difficultyLevels: ['kolay', 'normal', 'zor']
    };
  }
}

module.exports = new HangmanGame();
