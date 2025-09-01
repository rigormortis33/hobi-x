// Basit veritabanı bağlantı testi
require('dotenv').config();
const { testConnection } = require('./config/db');

async function runTest() {
  try {
    console.log('Veritabanı bağlantısı test ediliyor...');
    const result = await testConnection();
    
    if (result) {
      console.log('Bağlantı testi başarılı!');
    } else {
      console.log('Bağlantı başarısız oldu.');
    }
  } catch (error) {
    console.error('Test sırasında hata oluştu:', error);
  }
}

runTest();
