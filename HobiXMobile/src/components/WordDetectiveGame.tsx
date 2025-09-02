import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kelime ve ipucu seti
const WORDS = [
  { word: "ELMA", clue: "Kırmızı veya yeşil, ağaçta yetişir." },
  { word: "BİLGİSAYAR", clue: "Kod yazmak için kullanılır." },
  { word: "KİTAP", clue: "Okumak için sayfaları çevirirsin." },
  { word: "ARABA", clue: "Tekerlekli, motorlu ulaşım aracı." },
  { word: "KEDİ", clue: "Evcil, miyavlayan hayvan." },
  { word: "OKUL", clue: "Eğitim alınan yer." },
  { word: "MÜZİK", clue: "Dinlenir, notalarla yazılır." },
  { word: "DENİZ", clue: "Mavi, tuzlu, yüzülür." },
  { word: "GÜNEŞ", clue: "Dünyayı ısıtır, yıldızdır." },
  { word: "ÇİÇEK", clue: "Renkli, güzel kokar." },
  { word: "TELEFON", clue: "Aramak için kullanılır." },
  { word: "YILDIZ", clue: "Gökyüzünde parlar." },
  { word: "KALEM", clue: "Yazmak için kullanılır." },
  { word: "SAAT", clue: "Zamanı gösterir." },
  { word: "AYNA", clue: "Yansımayı gösterir." },
];

interface WordDetectiveProps {
  palette: any;
  onBack?: () => void;
}

export default function WordDetectiveGame({ palette, onBack }: WordDetectiveProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(6);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongLetters, setWrongLetters] = useState<string[]>([]);
  const [gameMessage, setGameMessage] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);

  // Türkçe harfler
  const TURKISH_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

  // Mevcut kelime
  const currentWord = WORDS[currentWordIndex];

  // High score'u yükle
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const saved = await AsyncStorage.getItem('wordDetective_highScore');
        if (saved) {
          setHighScore(parseInt(saved));
        }
      } catch (error) {
        console.error('High score yüklenirken hata:', error);
      }
    };
    loadHighScore();
  }, []);

  // High score'u kaydet
  const saveHighScore = useCallback(async (newScore: number) => {
    try {
      await AsyncStorage.setItem('wordDetective_highScore', newScore.toString());
      setHighScore(newScore);
    } catch (error) {
      console.error('High score kaydedilirken hata:', error);
    }
  }, []);

  // Harf tahmin etme
  const guessLetter = useCallback((letter: string) => {
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
      return;
    }

    const wordLetters = currentWord.word.split('');

    if (wordLetters.includes(letter)) {
      // Doğru harf
      const newGuessed = [...guessedLetters, letter];
      setGuessedLetters(newGuessed);

      // Skor güncelle
      const newScore = score + (5 * level);
      setScore(newScore);

      // Kelime tamamlandı mı kontrol et
      const isComplete = wordLetters.every(char => newGuessed.includes(char));
      if (isComplete) {
        setGameMessage('🎉 Tebrikler! Kelimeyi buldunuz!');
        setLevel(prev => prev + 1);

        // High score kontrolü
        if (newScore > highScore) {
          saveHighScore(newScore);
        }

        // Sonraki kelimeye geç
        setTimeout(() => {
          nextWord();
        }, 1500);
      }
    } else {
      // Yanlış harf
      const newWrong = [...wrongLetters, letter];
      setWrongLetters(newWrong);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives === 0) {
        setGameMessage(`💀 Oyun bitti! Doğru kelime: ${currentWord.word}`);
        setIsGameOver(true);

        // High score kontrolü
        if (score > highScore) {
          saveHighScore(score);
        }

        setTimeout(() => {
          restartGame();
        }, 2500);
      }
    }
  }, [guessedLetters, wrongLetters, currentWord, score, level, lives, highScore, saveHighScore]);

  // Sonraki kelime
  const nextWord = useCallback(() => {
    const nextIndex = (currentWordIndex + 1) % WORDS.length;
    setCurrentWordIndex(nextIndex);
    setGuessedLetters([]);
    setWrongLetters([]);
    setLives(6);
    setGameMessage('');
  }, [currentWordIndex]);

  // Oyunu yeniden başlat
  const restartGame = useCallback(() => {
    setCurrentWordIndex(0);
    setLevel(1);
    setScore(0);
    setLives(6);
    setGuessedLetters([]);
    setWrongLetters([]);
    setGameMessage('');
    setIsGameOver(false);
  }, []);

  // Kelime boşluklarını render et
  const renderWordBlanks = () => {
    return currentWord.word.split('').map((letter, index) => (
      <View key={index} style={styles.blankContainer}>
        <Text style={[
          styles.blank,
          {
            color: guessedLetters.includes(letter) ? palette.accent : palette.text,
            borderBottomColor: guessedLetters.includes(letter) ? palette.accent : palette.stroke,
          }
        ]}>
          {guessedLetters.includes(letter) ? letter : '_'}
        </Text>
      </View>
    ));
  };

  // Harf butonlarını render et
  const renderLetterPad = () => {
    return TURKISH_LETTERS.map((letter) => {
      const isGuessed = guessedLetters.includes(letter);
      const isWrong = wrongLetters.includes(letter);
      const isDisabled = isGuessed || isWrong || isGameOver;

      return (
        <Pressable
          key={letter}
          style={({ pressed }) => [
            styles.letterButton,
            {
              backgroundColor: isDisabled
                ? palette.stroke
                : pressed
                  ? palette.accentAlt
                  : palette.card,
              borderColor: palette.border,
            }
          ]}
          onPress={() => guessLetter(letter)}
          disabled={isDisabled}
        >
          <Text style={[
            styles.letterButtonText,
            {
              color: isDisabled ? palette.subtext : palette.text,
            }
          ]}>
            {letter}
          </Text>
        </Pressable>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>🔍 Kelime Dedektifi</Text>
          <Text style={[styles.description, { color: palette.subtext }]}>
            İpucuna göre doğru kelimeyi bul! Harfleri tahmin et, yanlışlarda canın azalır.
          </Text>
        </View>

        {/* Oyun Alanı */}
        <View style={[styles.gameBoard, { backgroundColor: palette.card, borderColor: palette.stroke }]}>

          {/* İpucu */}
          <View style={styles.clueContainer}>
            <Text style={[styles.clueLabel, { color: palette.subtext }]}>💡 İpucu:</Text>
            <Text style={[styles.clue, { color: palette.text }]}>{currentWord.clue}</Text>
          </View>

          {/* Kelime Boşlukları */}
          <View style={styles.wordBlanksContainer}>
            {renderWordBlanks()}
          </View>

          {/* Yanlış Harfler */}
          {wrongLetters.length > 0 && (
            <View style={styles.wrongLettersContainer}>
              <Text style={[styles.wrongLettersLabel, { color: palette.error || '#f44336' }]}>
                ❌ Yanlış Harfler:
              </Text>
              <Text style={[styles.wrongLetters, { color: palette.error || '#f44336' }]}>
                {wrongLetters.join(', ')}
              </Text>
            </View>
          )}

          {/* Can */}
          <View style={styles.livesContainer}>
            <Text style={[styles.livesText, { color: palette.warning || '#ff9800' }]}>
              ❤️ Can: {lives}
            </Text>
          </View>

        </View>

        {/* Harf Seçici */}
        <View style={styles.letterPadContainer}>
          <Text style={[styles.letterPadTitle, { color: palette.subtext }]}>Harfleri Seç:</Text>
          <View style={styles.letterPad}>
            {renderLetterPad()}
          </View>
        </View>

        {/* Skor Tablosu */}
        <View style={[styles.scoreboard, { backgroundColor: palette.card, borderColor: palette.stroke }]}>
          <Text style={[styles.scoreText, { color: palette.text }]}>⭐ Skor: {score}</Text>
          <Text style={[styles.highScoreText, { color: palette.accent }]}>🏆 En Yüksek: {highScore}</Text>
          <Text style={[styles.levelText, { color: palette.text }]}>📈 Seviye: {level}</Text>
        </View>

        {/* Oyun Mesajı */}
        {gameMessage !== '' && (
          <View style={[styles.messageContainer, { backgroundColor: palette.banner, borderColor: palette.stroke }]}>
            <Text style={[styles.messageText, { color: palette.bannerText }]}>
              {gameMessage}
            </Text>
          </View>
        )}

        {/* Kontrol Butonları */}
        <View style={styles.controlsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              { backgroundColor: pressed ? palette.accentAlt : palette.accent, borderColor: palette.stroke }
            ]}
            onPress={restartGame}
          >
            <Text style={styles.controlButtonText}>🔄 Yeniden Başlat</Text>
          </Pressable>

          {onBack && (
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                { backgroundColor: pressed ? palette.stroke : palette.card, borderColor: palette.border }
              ]}
              onPress={onBack}
            >
              <Text style={[styles.controlButtonText, { color: palette.text }]}>🏠 Ana Sayfa</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  gameBoard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  clueContainer: {
    marginBottom: 20,
  },
  clueLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  clue: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  wordBlanksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    minHeight: 60,
  },
  blankContainer: {
    margin: 4,
  },
  blank: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'center',
    borderBottomWidth: 3,
    paddingBottom: 4,
  },
  wrongLettersContainer: {
    marginBottom: 16,
  },
  wrongLettersLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wrongLetters: {
    fontSize: 16,
    fontWeight: '500',
  },
  livesContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  livesText: {
    fontSize: 18,
    fontWeight: '600',
  },
  letterPadContainer: {
    marginBottom: 24,
  },
  letterPadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  letterPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  letterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  highScoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
