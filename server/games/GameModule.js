/**
 * Temel Oyun Modülü Sınıfı
 * Tüm oyunlar bu sınıfı genişletmelidir
 */
class GameModule {
  constructor(id, name, description, icon) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.enabled = true;
  }

  // Her oyun, bu metodu kendi yapısına göre uygulamalı
  async generatePuzzle(difficulty) {
    throw new Error('generatePuzzle metodu uygulanmamış');
  }

  // Cevap kontrolü
  async checkAnswer(puzzleId, answer) {
    throw new Error('checkAnswer metodu uygulanmamış');
  }

  // Oyun ayarlarını döndür
  getSettings() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      enabled: this.enabled
    };
  }
}

module.exports = GameModule;
