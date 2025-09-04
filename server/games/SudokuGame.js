const GameModule = require('./GameModule');
const { pool } = require('../config/db');

class SudokuGame extends GameModule {
  constructor() {
    super(
      'sudoku',
      'Sudoku',
      'Rakamları doğru yerlere yerleştirin!',
      'sudoku_icon.png'
    );

    this.gridSize = 9;
    this.maxMistakes = 3;
  }

  // Sudoku çözücü algoritması
  isValidMove(board, row, col, num) {
    // Satır kontrolü
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }

    // Sütun kontrolü
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }

    // 3x3 kutu kontrolü
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  // Sudoku çöz
  solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(board, row, col, num)) {
              board[row][col] = num;
              if (this.solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // Tam Sudoku oluştur
  generateFullSudoku() {
    const board = Array(9).fill().map(() => Array(9).fill(0));

    // İlk satırı rastgele doldur
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 9; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      board[0][i] = numbers[randomIndex];
      numbers.splice(randomIndex, 1);
    }

    // Sudoku'yu çöz
    this.solveSudoku(board);
    return board;
  }

  // Zorluk seviyesine göre hücreleri kaldır
  removeCells(board, difficulty) {
    const cellsToRemove = {
      'kolay': 30,
      'orta': 45,
      'zor': 55
    };

    const toRemove = cellsToRemove[difficulty] || 45;
    let removed = 0;

    while (removed < toRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (board[row][col] !== 0) {
        board[row][col] = 0;
        removed++;
      }
    }

    return board;
  }

  // Board'u kopyala
  copyBoard(board) {
    return board.map(row => [...row]);
  }

  async generatePuzzle(difficulty = 'orta') {
    try {
      // Tam Sudoku oluştur
      const solution = this.generateFullSudoku();

      // Zorluk seviyesine göre hücreleri kaldır
      const puzzle = this.removeCells(this.copyBoard(solution), difficulty);

      // Veritabanına kaydet
      const [result] = await pool.query(
        'INSERT INTO active_puzzles (game_id, content, solution, created_at) VALUES (?, ?, ?, NOW())',
        [this.id, JSON.stringify({ puzzle: puzzle, mistakes: 0 }), JSON.stringify({ solution: solution })]
      );

      return {
        puzzleId: result.insertId,
        puzzle: {
          puzzle: puzzle,
          mistakes: 0,
          maxMistakes: this.maxMistakes,
          gridSize: this.gridSize
        }
      };
    } catch (error) {
      console.error('Sudoku bulmaca oluşturma hatası:', error);
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
      const content = JSON.parse(puzzle.content);
      const solution = JSON.parse(puzzle.solution);

      const { row, col, value } = answer;
      const currentPuzzle = content.puzzle;
      const correctSolution = solution.solution;

      // Hamle geçerli mi kontrol et
      const isValid = correctSolution[row][col] === value;
      const isEmpty = currentPuzzle[row][col] === 0;

      let mistakes = content.mistakes || 0;
      let completed = false;

      if (isValid && isEmpty) {
        // Doğru hamle
        currentPuzzle[row][col] = value;

        // Oyun tamamlandı mı kontrol et
        completed = this.isBoardComplete(currentPuzzle);
      } else if (!isValid && isEmpty) {
        // Yanlış hamle
        mistakes++;
      }

      // Güncel durumu kaydet
      const updatedContent = {
        puzzle: currentPuzzle,
        mistakes: mistakes
      };

      await pool.query(
        'UPDATE active_puzzles SET content = ?, completed = ? WHERE id = ?',
        [JSON.stringify(updatedContent), completed ? 1 : 0, puzzleId]
      );

      return {
        correct: isValid,
        row: row,
        col: col,
        value: value,
        mistakes: mistakes,
        maxMistakes: this.maxMistakes,
        completed: completed,
        gameOver: mistakes >= this.maxMistakes
      };
    } catch (error) {
      console.error('Sudoku cevap kontrolü hatası:', error);
      throw error;
    }
  }

  // Board tamamlandı mı kontrol et
  isBoardComplete(board) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) return false;
      }
    }
    return true;
  }

  // Oyuna özgü ayarları döndür
  getSettings() {
    return {
      ...super.getSettings(),
      gridSize: this.gridSize,
      maxMistakes: this.maxMistakes,
      difficultyLevels: ['kolay', 'orta', 'zor']
    };
  }
}

module.exports = new SudokuGame();
