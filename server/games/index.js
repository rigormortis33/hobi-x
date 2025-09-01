const fs = require('fs');
const path = require('path');

// Tüm oyun modüllerini yükle
const gameModules = {};

// games klasöründeki tüm .js dosyalarını oku (GameModule.js ve index.js hariç)
fs.readdirSync(__dirname)
  .filter(file => {
    return file.endsWith('.js') && 
           file !== 'GameModule.js' && 
           file !== 'index.js';
  })
  .forEach(file => {
    try {
      // Her oyun modülünü yükle
      const game = require(path.join(__dirname, file));
      gameModules[game.id] = game;
      console.log(`Oyun modülü yüklendi: ${game.name}`);
    } catch (error) {
      console.error(`Oyun modülü yüklenirken hata: ${file}`, error);
    }
  });

// Tüm oyunları getir
function getAllGames() {
  return Object.values(gameModules).map(game => game.getSettings());
}

// ID'ye göre oyun getir
function getGame(gameId) {
  return gameModules[gameId];
}

module.exports = {
  getAllGames,
  getGame
};
