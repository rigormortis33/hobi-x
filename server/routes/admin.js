const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const { getAllGames, getGame } = require('../games');

// Admin yetkisi kontrolü
router.use(authMiddleware);
router.use(adminMiddleware);

// Tüm oyun istatistiklerini getir
router.get('/stats', async (req, res) => {
  try {
    const [gameStats] = await pool.query(`
      SELECT g.id, g.name, 
             COUNT(DISTINCT ap.id) AS total_puzzles,
             COUNT(DISTINCT us.user_id) AS total_players
      FROM game_types g
      LEFT JOIN active_puzzles ap ON g.id = ap.game_id
      LEFT JOIN user_scores us ON g.id = us.game_id
      GROUP BY g.id, g.name
    `);
    
    res.json({
      success: true,
      stats: gameStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu',
      error: error.message
    });
  }
});

// Oyun durumunu güncelle (etkinleştir/devre dışı bırak)
router.patch('/games/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { enabled } = req.body;
    
    await pool.query(
      'UPDATE game_types SET enabled = ? WHERE id = ?',
      [enabled, gameId]
    );
    
    res.json({
      success: true,
      message: `Oyun ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Oyun güncellenirken hata oluştu',
      error: error.message
    });
  }
});

// Adam asmaca için yeni kelime ekle
router.post('/games/hangman/words', async (req, res) => {
  try {
    const { word, category, difficulty } = req.body;
    
    if (!word || word.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Kelime boş olamaz'
      });
    }
    
    await pool.query(
      'INSERT INTO hangman_words (word, category, difficulty) VALUES (?, ?, ?)',
      [word.toUpperCase(), category, difficulty || 'normal']
    );
    
    res.json({
      success: true,
      message: 'Kelime başarıyla eklendi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Kelime eklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
