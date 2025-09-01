import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

interface HangmanGameProps {
  onBack: () => void;
  theme: 'light' | 'dark';
}

const WORDS = [
  'JAVASCRIPT',
  'REACT',
  'NATIVE',
  'MOBILE',
  'OYUN',
  'KELIME',
  'PROGRAM',
  'TEKNOLOJI',
  'BILGISAYAR',
  'INTERNET',
];

const ALPHABET = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'.split('');

export default function HangmanGame({ onBack, theme }: HangmanGameProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const maxWrongGuesses = 6;

  const palette = theme === 'dark' 
    ? {
        bg: '#0B1220',
        card: '#121A2A',
        text: '#E6EDF7',
        subtext: '#94A3B8',
        accent: '#60A5FA',
        wrong: '#EF4444',
        correct: '#10B981',
      }
    : {
        bg: '#FCFCFD',
        card: '#FFFFFF',
        text: '#0B1621',
        subtext: '#54606C',
        accent: '#3B82F6',
        wrong: '#EF4444',
        correct: '#10B981',
      };

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.includes(letter) || gameStatus !== 'playing') return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        Alert.alert('Oyun Bitti!', `Kelime: ${currentWord}`, [
          { text: 'Yeni Oyun', onPress: startNewGame }
        ]);
      }
    } else {
      // Check if word is complete
      const wordComplete = currentWord
        .split('')
        .every(letter => newGuessedLetters.includes(letter));
      
      if (wordComplete) {
        setGameStatus('won');
        Alert.alert('Tebrikler!', 'Kelimeyi buldunuz!', [
          { text: 'Yeni Oyun', onPress: startNewGame }
        ]);
      }
    }
  };

  const displayWord = currentWord
    .split('')
    .map(letter => guessedLetters.includes(letter) ? letter : '_')
    .join(' ');

  const hangmanStages = [
    '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n      |\n      |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n      |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n  |   |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n /|   |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n      |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n /    |\n=========',
    '  +---+\n  |   |\n  |   |\n  O   |\n /|\\  |\n / \\  |\n=========',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={[styles.backButton, { backgroundColor: palette.card }]}>
          <Text style={[styles.backButtonText, { color: palette.text }]}>← Geri</Text>
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Adam Asmaca</Text>
        <Pressable onPress={startNewGame} style={[styles.newGameButton, { backgroundColor: palette.accent }]}>
          <Text style={styles.newGameButtonText}>Yeni Oyun</Text>
        </Pressable>
      </View>

      <View style={[styles.hangmanContainer, { backgroundColor: palette.card }]}>
        <Text style={[styles.hangman, { color: palette.text }]}>
          {hangmanStages[wrongGuesses]}
        </Text>
      </View>

      <View style={styles.wordContainer}>
        <Text style={[styles.word, { color: palette.text }]}>{displayWord}</Text>
        <Text style={[styles.wrongCounter, { color: palette.wrong }]}>
          Yanlış: {wrongGuesses} / {maxWrongGuesses}
        </Text>
      </View>

      <View style={styles.alphabetContainer}>
        {ALPHABET.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = isGuessed && currentWord.includes(letter);
          const isWrong = isGuessed && !currentWord.includes(letter);
          
          return (
            <Pressable
              key={letter}
              onPress={() => guessLetter(letter)}
              disabled={isGuessed || gameStatus !== 'playing'}
              style={[
                styles.letterButton,
                {
                  backgroundColor: isCorrect 
                    ? palette.correct 
                    : isWrong 
                    ? palette.wrong 
                    : palette.card,
                  opacity: isGuessed ? 0.6 : 1,
                }
              ]}
            >
              <Text style={[
                styles.letterText,
                { 
                  color: isGuessed ? '#FFFFFF' : palette.text 
                }
              ]}>
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newGameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newGameButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hangmanContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  hangman: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 14,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  wrongCounter: {
    fontSize: 16,
    fontWeight: '600',
  },
  alphabetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  letterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  letterText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
