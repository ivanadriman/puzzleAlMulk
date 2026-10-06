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

export type GameModeId = 'puzzle' | 'vanishing' | 'audio_snatch' | 'bridge' | 'sprint';

export interface GameModeMeta {
  id: GameModeId;
  icon: string;
  badge?: string;
  titleKey: string;
  descKey: string;
}

// 1. Vanishing Words State
export interface VanishingState {
  stage: 1 | 2 | 3 | 4; // 1: 100% visible, 2: 25% hidden, 3: 50% hidden, 4: 100% hidden
  hiddenIndices: number[]; // 0-based word indices that are blanked out
  solvedIndices: number[]; // indices of words correctly guessed in this stage
  options: { wordIdx: number; text: string; gloss: string }[];
  currentMissingTargetIdx: number | null;
  mistakeWordIdx: number | null;
  isStageComplete: boolean;
}

// 2. Audio Snatch State
export interface AudioSnatchState {
  splitWordIndex: number;
  options: { text: string; isCorrect: boolean; gloss: string }[];
  isWaitingAnswer: boolean;
  timeLeft: number; // 5-second countdown
  streak: number;
  selectedOptionText: string | null;
  isCorrect: boolean | null;
}

// 3. Ayah Bridge State
export interface BridgeOption {
  ayahNumber: number;
  textSnippet: string;
  translation: string;
  isCorrect: boolean;
}

export interface BridgeState {
  fromAyahNumber: number;
  toAyahNumber: number;
  options: BridgeOption[];
  selectedAyahNumber: number | null;
  isCorrect: boolean | null;
  streak: number;
  bestStreak: number;
}

// 4. Word Sprint State
export interface SprintOption {
  text: string;
  isCorrect: boolean;
  gloss: string;
}

export interface SprintState {
  currentWordIndex: number;
  options: SprintOption[];
  startTime: number | null;
  elapsedMs: number;
  combo: number;
  bestCombo: number;
  mistakes: number;
  isFinished: boolean;
}

export interface AppSettings {
  language: AppLanguage;
  activeGameMode: GameModeId;
  gameLevel: 1 | 2; // 1 = Guided Repetition, 2 = Full Puzzle Assembly (used in Puzzle mode)
  difficulty: DifficultyMode;
  showTranslation: boolean;
  showTransliteration: boolean;
  autoPlayAudio: boolean;
  soundEffects: boolean;
  playbackSpeed: number;
  arabicFontSize: 'normal' | 'large' | 'xlarge';
}
