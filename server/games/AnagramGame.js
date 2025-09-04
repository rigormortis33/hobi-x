const GameModule = require('./GameModule');
const { pool } = require('../config/db');

class AnagramGame extends GameModule {
  constructor() {
    super(
      'anagram',
      'Anagram',
      'Harfleri yeniden düzenleyin!',
      'anagram_icon.png'
    );
  }

  // Kelimeyi karıştır
  shuffleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  }

  async generatePuzzle(difficulty = 'orta') {
    try {
      // Veritabanından zorluk seviyesine göre rastgele kelime seç
      const [rows] = await pool.query(
        'SELECT * FROM anagram_words WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
        [difficulty]
      );

      if (rows.length === 0) {
        throw new Error('Uygun kelime bulunamadı');
      }

      const word = rows[0].word;
      const shuffled = this.shuffleWord(word);

      // Kelimeyi veritabanına kaydet
      const [result] = await pool.query(
        'INSERT INTO active_puzzles (game_id, content, solution, created_at) VALUES (?, ?, ?, NOW())',
        [this.id, JSON.stringify({
          shuffled: shuffled,
          attempts: 0,
          maxAttempts: 3
        }), word]
      );

      return {
        puzzleId: result.insertId,
        puzzle: {
          shuffled: shuffled,
          length: word.length,
          attempts: 0,
          maxAttempts: 3
        }
      };
    } catch (error) {
      console.error('Anagram bulmaca oluşturma hatası:', error);
      throw error;
    }
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
      const solution = puzzle.solution;
      let currentState = JSON.parse(puzzle.content);

      const userAnswer = answer.toLowerCase();
      const correctAnswer = solution.toLowerCase();

      let attempts = currentState.attempts + 1;
      let completed = false;
      let correct = false;

      if (userAnswer === correctAnswer) {
        correct = true;
        completed = true;
      }

      // Güncel durumu güncelle
      const updatedContent = {
        shuffled: currentState.shuffled,
        attempts: attempts,
        maxAttempts: currentState.maxAttempts
      };

      await pool.query(
        'UPDATE active_puzzles SET content = ?, completed = ? WHERE id = ?',
        [JSON.stringify(updatedContent), completed ? 1 : 0, puzzleId]
      );

      return {
        correct: correct,
        answer: userAnswer,
        attempts: attempts,
        maxAttempts: currentState.maxAttempts,
        completed: completed,
        solution: completed ? solution : null,
        gameOver: attempts >= currentState.maxAttempts && !correct
      };
    } catch (error) {
      console.error('Anagram cevap kontrolü hatası:', error);
      throw error;
    }
  }

  // Oyuna özgü ayarları döndür
  getSettings() {
    return {
      ...super.getSettings(),
      difficultyLevels: ['kolay', 'orta', 'zor']
    };
  }
}

module.exports = new AnagramGame();
