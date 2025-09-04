const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/db');

const app = express();

// Router tanımlamaları
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyaları serve et
app.use(express.static('public'));

// API rotaları için JSON header ayarla
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// API rotaları
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/games', gameRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// Basit sağlık kontrolü
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Ana sayfa - Web oyun arayüzü
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Oyun sayfaları
app.get('/games/:game', (req, res) => {
  const game = req.params.game;
  const gameFile = __dirname + `/public/games/${game}.html`;

  // Dosya var mı kontrol et
  if (require('fs').existsSync(gameFile)) {
    res.sendFile(gameFile);
  } else {
    res.status(404).sendFile(__dirname + '/public/index.html');
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Sunucu hatası', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
  try {
    const ok = await testConnection();
    if (!ok) {
      console.warn('DB bağlantı testi başarısız, servis yine de ayakta.');
    }
  } catch (err) {
    console.warn('DB testi hata verdi, servis yine de ayakta kalacak:', err?.message || err);
  }
});

module.exports = app;
