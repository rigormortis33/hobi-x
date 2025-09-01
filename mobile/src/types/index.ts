// Type definitions for Hobi-X Mobile App

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface GameScore {
  id: number;
  userId: number;
  gameType: string;
  score: number;
  level: number;
  timeSpent: number;
  createdAt: string;
}

export interface GameItem {
  key: string;
  title: string;
  emoji: string;
  tintFrom: string;
  tintTo: string;
  route?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface ThemePalette {
  bg: string;
  card: string;
  text: string;
  subtext: string;
  stroke: string;
  accent: string;
  accentAlt: string;
  banner: string;
  bannerText: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggle: () => void;
}

export interface GameScreenProps {
  onBack: () => void;
  theme: ThemeMode;
}

export interface NavigationItem {
  key: string;
  label: string;
  emoji: string;
  route?: string;
}

export interface HangmanGameState {
  currentWord: string;
  guessedLetters: string[];
  wrongGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
}

export interface ScoreData {
  gameType: string;
  score: number;
  level: number;
  timeSpent: number;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  gameType: string;
  level: number;
  createdAt: string;
}
