import React, { useMemo, useRef, useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SudokuGame from '../components/SudokuGame';

/*********************************
 * Theme System
 *********************************/
type ThemeMode = 'light' | 'dark';

const ThemeContext = createContext<{ mode: ThemeMode; toggle: () => void }>({
  mode: 'light',
  toggle: () => {},
});

const useTheme = () => useContext(ThemeContext);

const lightPalette = {
  bg: '#FCFCFD',
  card: '#FFFFFF',
  text: '#0B1621',
  subtext: '#54606C',
  stroke: 'rgba(0,0,0,0.06)',
  accent: '#3B82F6',
  accentAlt: '#10B981',
  banner: '#EEF2FF',
  bannerText: '#1E2A78',
};

const darkPalette = {
  bg: '#0B1220',
  card: '#121A2A',
  text: '#E6EDF7',
  subtext: '#94A3B8',
  stroke: 'rgba(255,255,255,0.06)',
  accent: '#60A5FA',
  accentAlt: '#34D399',
  banner: '#0F172A',
  bannerText: '#CBD5E1',
};

function usePalette(mode: ThemeMode) {
  return mode === 'dark' ? darkPalette : lightPalette;
}

/*********************************
 * Game Types
 *********************************/
type GameItem = {
  key: string;
  title: string;
  emoji: string;
  tintFrom: string;
  tintTo: string;
  route?: string;
};

const GAMES: GameItem[] = [
  { key: 'hangman', title: 'Adam Asmaca', emoji: '🪢', tintFrom: '#FFD6AE', tintTo: '#FFB77A' },
  { key: 'sudoku', title: 'Sudoku', emoji: '🔢', tintFrom: '#C9E8FF', tintTo: '#9FD4FF' },
  { key: 'wordsearch', title: 'Kelime Avı', emoji: '🔍', tintFrom: '#D5F5E3', tintTo: '#A5E8CE' },
  { key: 'memory', title: 'Eşleştirme', emoji: '🧠', tintFrom: '#E9D5FF', tintTo: '#C4B5FD' },
  { key: '2048', title: '2048', emoji: '🎲', tintFrom: '#FFE3E3', tintTo: '#FFC6C6' },
  { key: 'tic', title: 'X-O', emoji: '❌', tintFrom: '#FDE68A', tintTo: '#FCD34D' },
];

/*********************************
 * Main Component
 *********************************/
export default function HobiXHomeScreen() {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'sudoku'>('home');

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('hobiX:theme');
        if (saved === 'dark' || saved === 'light') setMode(saved);
      } catch {}
    })();
  }, []);

  const toggle = async () => {
    const m = mode === 'light' ? 'dark' : 'light';
    setMode(m);
    try {
      await AsyncStorage.setItem('hobiX:theme', m);
    } catch {}
  };

  const handleGamePress = (gameKey: string) => {
    console.log('Game pressed:', gameKey);
    if (gameKey === 'sudoku') {
      setCurrentScreen('sudoku');
    }
    // Add other games here
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const palette = usePalette(mode);

  // Show game screen if selected
  if (currentScreen === 'sudoku') {
    return <SudokuGame onBack={handleBackToHome} theme={mode} />;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>        
        <StatusBar
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={palette.bg}
        />
        <View style={[styles.container, { backgroundColor: palette.bg }]}>          
          <Header palette={palette} />
          <DailyBanner palette={palette} onPlaySudoku={() => setCurrentScreen('sudoku')} />
          <GameGrid palette={palette} onGamePress={handleGamePress} />
          <BottomActions palette={palette} />
        </View>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

/*********************************
 * Header Component
 *********************************/
function Header({ palette }: { palette: ReturnType<typeof usePalette> }) {
  const { mode, toggle } = useTheme();
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        <Text style={[styles.brand, { color: palette.text }]}>
          Hobi<Text style={{ color: palette.accent }}>-X</Text>
        </Text>
        <Text style={[styles.subtitle, { color: palette.subtext }]}>Oyun Merkezi</Text>
      </View>

      <View style={styles.headerRight}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.modeSwitch,
            { 
              backgroundColor: mode === 'dark' ? palette.card : '#F6F7FA', 
              borderColor: palette.stroke, 
              opacity: pressed ? 0.8 : 1 
            },
          ]}
        >
          <Text style={{ fontSize: 16 }}>{mode === 'dark' ? '🌙' : '🌞'}</Text>
        </Pressable>

        <Pressable
          onPress={() => console.log('Profile pressed')}
          style={({ pressed }) => [
            styles.avatar, 
            { borderColor: palette.stroke, opacity: pressed ? 0.85 : 1 }
          ]}
        >
          <Text style={{ fontSize: 16 }}>👤</Text>
        </Pressable>
      </View>
    </View>
  );
}

/*********************************
 * Daily Banner Component
 *********************************/
function DailyBanner({ palette, onPlaySudoku }: { 
  palette: ReturnType<typeof usePalette>;
  onPlaySudoku: () => void;
}) {
  return (
    <View style={[styles.banner, { backgroundColor: palette.banner, borderColor: palette.stroke }]}>      
      <View style={{ flex: 1 }}>
        <Text style={[styles.bannerTitle, { color: palette.bannerText }]}>Bugünün Oyunu</Text>
        <Text style={[styles.bannerText, { color: palette.bannerText }]}>
          Sudoku — Zihnini ısıt, seriyi başlat! 🔢
        </Text>
      </View>
      <Pressable
        onPress={onPlaySudoku}
        style={({ pressed }) => [
          styles.cta, 
          { backgroundColor: palette.accent, opacity: pressed ? 0.9 : 1 }
        ]}
      >
        <Text style={styles.ctaText}>Oyna</Text>
      </Pressable>
    </View>
  );
}

/*********************************
 * Game Grid Component
 *********************************/
function GameGrid({ palette, onGamePress }: { 
  palette: ReturnType<typeof usePalette>; 
  onGamePress: (gameKey: string) => void 
}) {
  const numColumns = 2;

  return (
    <FlatList
      data={GAMES}
      numColumns={numColumns}
      keyExtractor={(it) => it.key}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContent}
      renderItem={({ item }) => <GameCard item={item} palette={palette} onPress={onGamePress} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

function GameCard({ item, palette, onPress }: { 
  item: GameItem; 
  palette: ReturnType<typeof usePalette>; 
  onPress: (gameKey: string) => void 
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(scale, { 
      toValue: 0.97, 
      duration: 100, 
      easing: Easing.out(Easing.quad), 
      useNativeDriver: true 
    }).start();
  };
  
  const onPressOut = () => {
    Animated.timing(scale, { 
      toValue: 1, 
      duration: 120, 
      easing: Easing.out(Easing.quad), 
      useNativeDriver: true 
    }).start();
  };

  const handlePress = () => {
    console.log('Open game:', item.key);
    onPress(item.key);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: palette.card,
            borderColor: palette.stroke,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <View style={[styles.cardTint, { backgroundColor: item.tintFrom }]} />
        <View style={[styles.cardTintOverlay, { backgroundColor: item.tintTo }]} />
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{item.title}</Text>
      </Pressable>
    </Animated.View>
  );
}

/*********************************
 * Bottom Actions Component
 *********************************/
function BottomActions({ palette }: { palette: ReturnType<typeof usePalette> }) {
  const items = useMemo(
    () => [
      { key: 'home', label: 'Ana Ekran', emoji: '🏠' },
      { key: 'popular', label: 'Popüler', emoji: '⭐' },
      { key: 'tasks', label: 'Görevler', emoji: '🎯' },
      { key: 'profile', label: 'Profil', emoji: '👤' },
    ],
    []
  );

  return (
    <View style={[styles.bottomBar, { borderColor: palette.stroke, backgroundColor: palette.card }]}>      
      {items.map((it) => (
        <Pressable
          key={it.key}
          onPress={() => console.log('Bottom nav:', it.key)}
          style={({ pressed }) => [styles.bottomItem, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.bottomEmoji}>{it.emoji}</Text>
          <Text style={[styles.bottomLabel, { color: palette.subtext }]}>{it.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/*********************************
 * Styles
 *********************************/
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { gap: 2 },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modeSwitch: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 36,
  },
  avatar: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    gap: 12,
  },
  bannerTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  bannerText: { fontSize: 14, marginTop: 2, fontWeight: '600' },
  cta: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  ctaText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.3 },
  gridContent: { paddingBottom: 92 },
  gridRow: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardEmoji: { fontSize: 28, position: 'absolute', top: 10, right: 12, opacity: 0.9 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 42,
    opacity: 0.7,
  },
  cardTintOverlay: {
    position: 'absolute',
    top: 26,
    left: 0,
    right: 0,
    height: 24,
    opacity: 0.6,
  },
  bottomBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    height: 64,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  bottomItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bottomEmoji: { fontSize: 18, marginBottom: 4 },
  bottomLabel: { fontSize: 12, fontWeight: '700' },
});
