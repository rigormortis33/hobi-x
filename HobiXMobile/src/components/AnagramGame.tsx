import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kelime listesi
const WORDS = [
  "elma", "masa", "araba", "kalem", "kitap", "oyuncak", "bilgisayar", "telefon",
  "kedi", "köpek", "ev", "okul", "deniz", "güneş", "ay", "yıldız",
  "çiçek", "ağaç", "orman", "dağ", "nehir", "göl", "şehir", "ülke"
];

interface AnagramGameProps {
  palette: any;
  onBack?: () => void;
}

export default function AnagramGame({ palette, onBack }: AnagramGameProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [userWord, setUserWord] = useState('');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameMessage, setGameMessage] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);

  // High score'u yükle
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const saved = await AsyncStorage.getItem('anagram_highScore');
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
      await AsyncStorage.setItem('anagram_highScore', newScore.toString());
      setHighScore(newScore);
    } catch (error) {
      console.error('High score kaydedilirken hata:', error);
    }
  }, []);

  // Kelime karıştırma fonksiyonu
  const shuffleWord = useCallback((word: string): string[] => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters;
  }, []);

  // Yeni kelime yükleme
  const loadNewWord = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setShuffledLetters(shuffleWord(randomWord));
    setUserWord('');
    setGameMessage('');
  }, [shuffleWord]);

  // İlk yükleme
  useEffect(() => {
    loadNewWord();
  }, [loadNewWord]);

  // Harf seçme
  const selectLetter = useCallback((index: number) => {
    const selectedLetter = shuffledLetters[index];
    const newUserWord = userWord + selectedLetter;
    const newShuffledLetters = shuffledLetters.filter((_, i) => i !== index);

    setUserWord(newUserWord);
    setShuffledLetters(newShuffledLetters);
  }, [shuffledLetters, userWord]);

  // Kelimeyi temizleme
  const clearWord = useCallback(() => {
    setUserWord('');
    setShuffledLetters(shuffleWord(currentWord));
  }, [currentWord, shuffleWord]);

  // Kelimeyi gönderme
  const submitWord = useCallback(() => {
    if (userWord.length !== currentWord.length) {
      setGameMessage('Tüm harfleri kullanmalısınız.');
      return;
    }

    if (userWord === currentWord) {
      // Doğru cevap
      const newScore = score + (level * 10);
      setScore(newScore);
      setLevel(prev => prev + 1);
      setGameMessage('🎉 Doğru! Sonraki kelimeye geçiliyor.');

      // High score kontrolü
      if (newScore > highScore) {
        saveHighScore(newScore);
      }

      // Sonraki kelimeye geç
      setTimeout(() => {
        loadNewWord();
      }, 1500);
    } else {
      // Yanlış cevap
      setGameMessage('❌ Yanlış! Tekrar deneyin.');
      clearWord();
    }
  }, [userWord, currentWord, score, level, highScore, saveHighScore, loadNewWord, clearWord]);

  // Harf butonlarını render et
  const renderLetterButtons = () => {
    return shuffledLetters.map((letter, index) => (
      <Pressable
        key={`${letter}-${index}`}
        style={({ pressed }) => [
          styles.letterButton,
          {
            backgroundColor: pressed ? palette.accentAlt : palette.card,
            borderColor: palette.border,
          }
        ]}
        onPress={() => selectLetter(index)}
        disabled={isGameOver}
      >
        <Text style={[styles.letterButtonText, { color: palette.text }]}>
          {letter.toUpperCase()}
        </Text>
      </Pressable>
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: palette.text }]}>🔀 Anagram</Text>
          <Text style={[styles.description, { color: palette.subtext }]}>
            Karışık harflerden anlamlı kelimeyi bul! Harfleri tıklayarak kelimeyi oluştur.
          </Text>
        </View>

        {/* Oyun Alanı */}
        <View style={[styles.gameBoard, { backgroundColor: palette.card, borderColor: palette.stroke }]}>

          {/* Karışık Harfler */}
          <View style={styles.shuffledLettersContainer}>
            <Text style={[styles.sectionTitle, { color: palette.subtext }]}>Harfler:</Text>
            <View style={styles.letterGrid}>
              {renderLetterButtons()}
            </View>
          </View>

          {/* Kullanıcı Kelimesi */}
          <View style={styles.userWordContainer}>
            <Text style={[styles.sectionTitle, { color: palette.subtext }]}>Tahmininiz:</Text>
            <TextInput
              style={[
                styles.userWordInput,
                {
                  backgroundColor: palette.bg,
                  borderColor: palette.stroke,
                  color: palette.text,
                }
              ]}
              value={userWord}
              editable={false}
              placeholder="Harfleri tıklayarak kelimeyi oluşturun..."
              placeholderTextColor={palette.subtext}
            />
          </View>

          {/* Aksiyon Butonları */}
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? palette.stroke : palette.card, borderColor: palette.border }
              ]}
              onPress={clearWord}
              disabled={isGameOver}
            >
              <Text style={[styles.actionButtonText, { color: palette.text }]}>🗑 Temizle</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: pressed ? palette.accentAlt : palette.accent, borderColor: palette.stroke }
              ]}
              onPress={submitWord}
              disabled={isGameOver || userWord.length === 0}
            >
              <Text style={styles.actionButtonText}>✅ Gönder</Text>
            </Pressable>
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
            onPress={loadNewWord}
          >
            <Text style={styles.controlButtonText}>🔄 Sonraki Kelime</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  shuffledLettersContainer: {
    marginBottom: 24,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterButton: {
    width: 50,
    height: 50,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  userWordContainer: {
    marginBottom: 24,
  },
  userWordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
