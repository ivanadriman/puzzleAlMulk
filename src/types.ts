export type AppLanguage = 'en' | 'id';

export interface Word {
  index: number;
  text: string;
  translation: string;
  translations?: {
    en: string;
    id: string;
  };
  transliteration: string;
  audio: string | null;
}

export interface Ayah {
  id: number;
  surah: number;
  number: number;
  verseKey: string;
  textUthmani: string;
  endMarker: string;
  translation: string;
  translations?: {
    en: string;
    id: string;
  };
  words: Word[];
  audioUrl: string;
}

export interface SurahMeta {
  id: number;
  nameSimple: string;
  nameArabic: string;
  versesCount: number;
  revelationPlace: string;
  file: string;
}

export interface SurahData {
  id: number;
  nameSimple: string;
  nameArabic: string;
  revelationPlace: string;
  versesCount: number;
  ayahs: Ayah[];
}

export interface PuzzlePiece {
  id: string; // unique piece id
  targetIndex: number; // 0-based position in target sentence
  words: Word[]; // 1 word for word mode, 2-3 words for phrase mode
  text: string; // combined text
  translation: string; // combined translation
  translations?: {
    en: string;
    id: string;
  };
  transliteration: string;
}

export type DifficultyMode = 'word' | 'phrase';

export interface CheckStatus {
  hasChecked: boolean;
  isAllCorrect: boolean;
  wrongCount: number;
  wrongIndices: number[]; // 0-based indices of slots in wrong position
}

export interface AyahProgress {
  solved: boolean;
  revealed: boolean;
  attempts: number;
  hintsUsed: number;
  solvedAt?: number;
}

export interface AppSettings {
  language: AppLanguage;
  gameLevel: 1 | 2; // 1 = Guided Repetition, 2 = Full Puzzle Assembly
  difficulty: DifficultyMode;
  showTranslation: boolean;
  showTransliteration: boolean;
  autoPlayAudio: boolean;
  soundEffects: boolean;
  playbackSpeed: number;
  arabicFontSize: 'normal' | 'large' | 'xlarge';
}
