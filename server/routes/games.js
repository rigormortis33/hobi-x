const express = require('express');
const router = express.Router();
const { getAllGames, getGame } = require('../games');
const authMiddleware = require('../middlewares/auth');

// Tüm oyunları listeleme
router.get('/', async (req, res) => {
  try {
    const games = getAllGames();
    res.json({
      success: true,
      games: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Oyunlar listelenirken hata oluştu',
      error: error.message
    });
  }
});

// Belirli bir oyun için detay alma
router.get('/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = getGame(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı'
      });
    }
    
    res.json({
      success: true,
      game: game.getSettings()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Oyun bilgisi alınırken hata oluştu',
      error: error.message
    });
  }
});

// Yeni bulmaca oluşturma
router.post('/:gameId/puzzle', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = getGame(gameId);
    const { difficulty } = req.body;
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Oyun bulunamadı'
      });
    }
    
    const puzzle = await game.generatePuzzle(difficulty);
    res.json({
      success: true,
      puzzle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulmaca oluşturulurken hata oluştu',
      error: error.message
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
