const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

// Kullanıcı profilini getir
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userData.userId;

    const [users] = await pool.query(
      'SELECT id, username, email, full_name, points, avatar, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profil bilgileri alınamadı', error: error.message });
  }
});

// Profil güncelleme
router.put('/profile', async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { full_name, avatar } = req.body;

    await pool.query(
      'UPDATE users SET full_name = ?, avatar = ? WHERE id = ?',
      [full_name, avatar, userId]
    );

    res.json({ success: true, message: 'Profil güncellendi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profil güncellenemedi', error: error.message });
  }
});

// Kullanıcı skorlarını getir
router.get('/scores', async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { game_id } = req.query;

    let query = `
      SELECT us.*, g.name as game_name 
      FROM user_scores us
      JOIN game_types g ON us.game_id = g.id
      WHERE us.user_id = ?
    `;
    
    const queryParams = [userId];
    
    if (game_id) {
      query += ' AND us.game_id = ?';
      queryParams.push(game_id);
    }
    
    query += ' ORDER BY us.completed_at DESC';

    const [scores] = await pool.query(query, queryParams);

    res.json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Skorlar alınamadı', error: error.message });
  }
});

module.exports = router;
