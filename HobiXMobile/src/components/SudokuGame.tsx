import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';

interface SudokuGameProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

export default function SudokuGame({ onBack, theme }: SudokuGameProps) {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
  const [mistakes, setMistakes] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const palette = theme === 'dark' 
    ? {
        bg: '#0B1220',
        card: '#121A2A',
        text: '#E6EDF7',
        subtext: '#94A3B8',
        accent: '#60A5FA',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        border: 'rgba(255,255,255,0.1)',
        sudokuBg: '#1E293B',
        cellBg: '#334155',
        cellSelected: '#3B82F6',
        cellFixed: '#475569',
      }
    : {
        bg: '#FCFCFD',
        card: '#FFFFFF',
        text: '#0B1621',
        subtext: '#54606C',
        accent: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        border: 'rgba(0,0,0,0.1)',
        sudokuBg: '#F8FAFC',
        cellBg: '#FFFFFF',
        cellSelected: '#DBEAFE',
        cellFixed: '#F1F5F9',
      };

  // Sudoku çözücü algoritması
  const isValidMove = useCallback((board, row, col, num) => {
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
  }, []);

  const solveSudoku = useCallback((board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }, [isValidMove]);

  // Yeni oyun oluşturma
  const generatePuzzle = useCallback(() => {
    const newBoard = Array(9).fill().map(() => Array(9).fill(0));
    
    // Diagonal kutularını doldur
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let row = i; row < i + 3; row++) {
        for (let col = i; col < i + 3; col++) {
          const randomIndex = Math.floor(Math.random() * nums.length);
          newBoard[row][col] = nums[randomIndex];
          nums.splice(randomIndex, 1);
        }
      }
    }

    // Kalan hücreleri çöz
    solveSudoku(newBoard);

    // Rastgele hücreleri kaldır (zorluk ayarı)
    const puzzle = newBoard.map(row => [...row]);
    const cellsToRemove = 40; // Orta zorluk
    
    for (let i = 0; i < cellsToRemove; i++) {
      let row, col;
      do {
        row = Math.floor(Math.random() * 9);
        col = Math.floor(Math.random() * 9);
      } while (puzzle[row][col] === 0);
      
      puzzle[row][col] = 0;
    }

    return puzzle;
  }, [solveSudoku]);

  // Yeni oyun başlat
  const startNewGame = useCallback(() => {
    const newPuzzle = generatePuzzle();
    setBoard(newPuzzle);
    setInitialBoard(newPuzzle.map(row => [...row]));
    setSelectedCell({ row: -1, col: -1 });
    setMistakes(0);
    setGameCompleted(false);
    setTimer(0);
    setIsTimerRunning(true);
  }, [generatePuzzle]);

  // Oyun tamamlanma kontrolü
  const checkGameCompletion = useCallback((currentBoard) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] === 0) return false;
      }
    }
    return true;
  }, []);

  // Hücre seçimi
  const handleCellClick = (row, col) => {
    if (gameCompleted) return;
    setSelectedCell({ row, col });
  };

  // Sayı girişi
  const handleNumberInput = (num) => {
    if (gameCompleted || selectedCell.row === -1 || selectedCell.col === -1) return;
    
    const { row, col } = selectedCell;
    
    // İlk değer kontrolü
    if (initialBoard[row][col] !== 0) return;

    const newBoard = [...board];
    
    if (num === 0) {
      newBoard[row][col] = 0;
    } else {
      // Hamle doğruluğu kontrolü
      if (!isValidMove(board, row, col, num)) {
        setMistakes(prev => prev + 1);
        return;
      }
      newBoard[row][col] = num;
    }

    setBoard(newBoard);

    // Oyun tamamlanma kontrolü
    if (checkGameCompletion(newBoard)) {
      setGameCompleted(true);
      setIsTimerRunning(false);
    }
  };

  // Sıfırlama
  const resetGame = () => {
    Alert.alert(
      'Oyunu Sıfırla',
      'Tüm ilerlemeni kaybedeceksin. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sıfırla', 
          style: 'destructive',
          onPress: () => {
            setBoard(initialBoard.map(row => [...row]));
            setSelectedCell({ row: -1, col: -1 });
            setMistakes(0);
            setGameCompleted(false);
            setTimer(0);
            setIsTimerRunning(true);
          }
        },
      ]
    );
  };

  // İpucu gösterme
  const getHint = (row, col) => {
    if (!showHints || board[row][col] !== 0) return null;
    
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(board, row, col, num)) {
        return num;
      }
    }
    return null;
  };

  // Timer
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Oyunu başlat
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Zaman formatı
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cell style helper
  const getCellStyle = (row, col) => {
    const isSelected = selectedCell.row === row && selectedCell.col === col;
    const isFixed = initialBoard[row][col] !== 0;
    const rightBorder = (col + 1) % 3 === 0 && col !== 8;
    const bottomBorder = (row + 1) % 3 === 0 && row !== 8;

    return [
      styles.cell,
      {
        backgroundColor: isSelected 
          ? palette.cellSelected 
          : isFixed 
          ? palette.cellFixed 
          : palette.cellBg,
        borderColor: palette.border,
        borderRightWidth: rightBorder ? 2 : 1,
        borderBottomWidth: bottomBorder ? 2 : 1,
        borderRightColor: rightBorder ? palette.text : palette.border,
        borderBottomColor: bottomBorder ? palette.text : palette.border,
      }
    ];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={[styles.backButton, { backgroundColor: palette.card }]}>
          <Text style={[styles.backButtonText, { color: palette.text }]}>← Geri</Text>
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Sudoku</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.statLabel, { color: palette.subtext }]}>⏱ Süre</Text>
          <Text style={[styles.statValue, { color: palette.accent }]}>{formatTime(timer)}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.statLabel, { color: palette.subtext }]}>❌ Hata</Text>
          <Text style={[styles.statValue, { color: palette.error }]}>{mistakes}</Text>
        </View>
      </View>

      {/* Sudoku Board */}
      <View style={[styles.boardContainer, { backgroundColor: palette.sudokuBg }]}>
        <View style={styles.board}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Pressable
                key={`${rowIndex}-${colIndex}`}
                style={getCellStyle(rowIndex, colIndex)}
                onPress={() => handleCellClick(rowIndex, colIndex)}
                disabled={gameCompleted}
              >
                <Text style={[
                  styles.cellText,
                  {
                    color: initialBoard[rowIndex][colIndex] !== 0 
                      ? palette.text 
                      : palette.accent,
                    fontWeight: initialBoard[rowIndex][colIndex] !== 0 ? '700' : '600'
                  }
                ]}>
                  {cell !== 0 ? cell : ''}
                </Text>
                {showHints && cell === 0 && (
                  <Text style={[styles.hintText, { color: palette.subtext }]}>
                    {getHint(rowIndex, colIndex)}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <Pressable
            key={num}
            style={({ pressed }) => [
              styles.numberButton,
              { 
                backgroundColor: palette.card,
                borderColor: palette.border,
                opacity: pressed ? 0.7 : 1
              }
            ]}
            onPress={() => handleNumberInput(num)}
            disabled={gameCompleted}
          >
            <Text style={[styles.numberButtonText, { color: palette.text }]}>
              {num === 0 ? '×' : num}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: palette.accent, opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={startNewGame}
        >
          <Text style={[styles.controlButtonText, { color: '#FFFFFF' }]}>🏆 Yeni Oyun</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            { backgroundColor: palette.error, opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={resetGame}
        >
          <Text style={[styles.controlButtonText, { color: '#FFFFFF' }]}>🔄 Sıfırla</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.controlButton,
            { 
              backgroundColor: showHints ? palette.success : palette.card,
              borderColor: palette.border,
              borderWidth: showHints ? 0 : 1,
              opacity: pressed ? 0.8 : 1 
            }
          ]}
          onPress={() => setShowHints(!showHints)}
        >
          <Text style={[
            styles.controlButtonText, 
            { color: showHints ? '#FFFFFF' : palette.text }
          ]}>
            {showHints ? '👁 İpucu Açık' : '👁 İpucu'}
          </Text>
        </Pressable>
      </View>

      {/* Game Completed Modal */}
      <Modal
        visible={gameCompleted}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Tebrikler!</Text>
            <Text style={[styles.modalMessage, { color: palette.subtext }]}>
              Sudoku'yu başarıyla tamamladınız!{'\n\n'}
              ⏱ Süre: {formatTime(timer)}{'\n'}
              ❌ Hata sayısı: {mistakes}
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: palette.accent }]}
              onPress={startNewGame}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Yeni Oyun Başlat</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  boardContainer: {
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    alignSelf: 'center',
  },
  board: {
    width: 306, // 34 * 9
    height: 306,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: 34,
    height: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellText: {
    fontSize: 18,
    fontWeight: '600',
  },
  hintText: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    fontWeight: '500',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 6,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  numberButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
