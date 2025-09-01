const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Zorunlu alanları kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Kullanıcı adı, email ve şifre zorunludur' });
    }

    // Kullanıcı adı veya email var mı kontrol et
    const [userExists] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (userExists.length > 0) {
      return res.status(409).json({ success: false, message: 'Bu kullanıcı adı veya email zaten kullanılıyor' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı ekle
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, created_at) VALUES (?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, full_name || '']
    );

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kayıt işlemi başarısız', error: error.message });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Kimlik doğrulama başarısız' });
    }

    const user = users[0];

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Kimlik doğrulama başarısız' });
    }

    // Son giriş zamanını güncelle
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // JWT token oluştur
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin === 1
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        points: user.points,
        avatar: user.avatar,
        isAdmin: user.is_admin === 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Giriş işlemi başarısız', error: error.message });
  }
});

module.exports = router;
