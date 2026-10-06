import { AppSettings, Ayah, AyahProgress, DifficultyMode, PuzzlePiece, SurahData, SurahMeta } from '../types';
import { audioService } from '../services/audio';
import { dataService } from '../services/data';
import { generatePieces, getNextPiece, isAyahSolved, shufflePieces } from './puzzle';

const SETTINGS_KEY = 'puzzle_al_mulk_settings_v1';
const PROGRESS_KEY = 'puzzle_al_mulk_progress_v1';

const defaultSettings: AppSettings = {
  difficulty: 'word',
  showTranslation: true,
  showTransliteration: false,
  autoPlayAudio: true,
  playbackSpeed: 1.0,
  arabicFontSize: 'large'
};

export class AppStore {
  public surahList: SurahMeta[] = [];
  public currentSurah: SurahData | null = null;
  public currentAyahIndex: number = 0;

  public placedPieces: PuzzlePiece[] = [];
  public availablePieces: PuzzlePiece[] = [];
  public status: 'solving' | 'solved' | 'revealed' = 'solving';
  public shakeError: boolean = false;

  public progress: Record<string, AyahProgress> = {};
  public settings: AppSettings = { ...defaultSettings };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        this.progress = JSON.parse(savedProgress);
      }
    } catch (e) {
      console.warn('Failed reading localStorage:', e);
    }
  }

  public saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Failed saving progress:', e);
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed saving settings:', e);
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public async initialize(defaultSurahId = 67) {
    this.surahList = await dataService.getSurahs();
    await this.loadSurah(defaultSurahId);
  }

  public async loadSurah(surahId: number, startAyahIdx = 0) {
    this.currentSurah = await dataService.getSurah(surahId);
    this.currentAyahIndex = Math.min(Math.max(0, startAyahIdx), this.currentSurah.ayahs.length - 1);
    this.setupPuzzleForCurrentAyah();
    this.notify();
  }

  public getCurrentAyah(): Ayah | null {
    if (!this.currentSurah) return null;
    return this.currentSurah.ayahs[this.currentAyahIndex] || null;
  }

  public getAyahProgress(ayahNumber: number): AyahProgress {
    if (!this.currentSurah) return { solved: false, revealed: false, attempts: 0, hintsUsed: 0 };
    const key = `${this.currentSurah.id}:${ayahNumber}`;
    return this.progress[key] || { solved: false, revealed: false, attempts: 0, hintsUsed: 0 };
  }

  public setAyahIndex(index: number) {
    if (!this.currentSurah) return;
    if (index < 0 || index >= this.currentSurah.ayahs.length) return;
    if (this.currentAyahIndex === index) return;

    audioService.pause();
    this.currentAyahIndex = index;
    this.setupPuzzleForCurrentAyah();
    this.notify();
  }

  public nextAyah() {
    if (!this.currentSurah) return;
    if (this.currentAyahIndex < this.currentSurah.ayahs.length - 1) {
      this.setAyahIndex(this.currentAyahIndex + 1);
    }
  }

  public prevAyah() {
    if (this.currentAyahIndex > 0) {
      this.setAyahIndex(this.currentAyahIndex - 1);
    }
  }

  public setupPuzzleForCurrentAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    // Preload current and next ayah audio
    audioService.preload(ayah.audioUrl);
    if (this.currentSurah && this.currentAyahIndex + 1 < this.currentSurah.ayahs.length) {
      audioService.preload(this.currentSurah.ayahs[this.currentAyahIndex + 1].audioUrl);
    }

    const allPieces = generatePieces(ayah, this.settings.difficulty);
    this.placedPieces = [];
    this.availablePieces = shufflePieces(allPieces);
    this.status = 'solving';
    this.shakeError = false;

    // Track attempt in progress
    const key = `${ayah.surah}:${ayah.number}`;
    if (!this.progress[key]) {
      this.progress[key] = { solved: false, revealed: false, attempts: 1, hintsUsed: 0 };
    } else {
      this.progress[key].attempts += 1;
    }
    this.saveProgress();
  }

  /**
   * Tap piece to place it from available into placed
   */
  public placePiece(pieceId: string) {
    if (this.status !== 'solving') return;

    const pieceIdx = this.availablePieces.findIndex((p) => p.id === pieceId);
    if (pieceIdx === -1) return;

    const piece = this.availablePieces[pieceIdx];
    this.availablePieces.splice(pieceIdx, 1);
    this.placedPieces.push(piece);

    this.checkCompletion();
    this.notify();
  }

  /**
   * Tap piece in placed bar to return it to available tray
   */
  public removePiece(pieceId: string) {
    if (this.status !== 'solving') return;

    const pieceIdx = this.placedPieces.findIndex((p) => p.id === pieceId);
    if (pieceIdx === -1) return;

    const piece = this.placedPieces[pieceIdx];
    this.placedPieces.splice(pieceIdx, 1);
    this.availablePieces.push(piece);

    this.notify();
  }

  /**
   * Drag & drop reorder placed pieces
   */
  public updatePlacedPieces(newPlaced: PuzzlePiece[]) {
    this.placedPieces = newPlaced;
    this.checkCompletion();
    this.notify();
  }

  /**
   * Drag & drop reorder available pieces
   */
  public updateAvailablePieces(newAvailable: PuzzlePiece[]) {
    this.availablePieces = newAvailable;
    this.notify();
  }

  private checkCompletion() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const totalCount = this.placedPieces.length + this.availablePieces.length;
    if (this.placedPieces.length === totalCount) {
      if (isAyahSolved(this.placedPieces, totalCount)) {
        this.status = 'solved';
        const key = `${ayah.surah}:${ayah.number}`;
        this.progress[key] = {
          ...this.getAyahProgress(ayah.number),
          solved: true,
          solvedAt: Date.now()
        };
        this.saveProgress();

        if (this.settings.autoPlayAudio) {
          audioService.play(ayah.audioUrl);
        }
      } else {
        // Placed all pieces but order is incorrect - trigger subtle shake feedback
        this.shakeError = true;
        setTimeout(() => {
          this.shakeError = false;
          this.notify();
        }, 800);
      }
    }
  }

  public revealAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const allPieces = generatePieces(ayah, this.settings.difficulty);
    // Sort in correct target order
    allPieces.sort((a, b) => a.targetIndex - b.targetIndex);

    this.placedPieces = allPieces;
    this.availablePieces = [];
    this.status = 'revealed';

    const key = `${ayah.surah}:${ayah.number}`;
    this.progress[key] = {
      ...this.getAyahProgress(ayah.number),
      revealed: true
    };
    this.saveProgress();

    audioService.play(ayah.audioUrl);
    this.notify();
  }

  public useHint() {
    if (this.status !== 'solving') return;
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const nextPiece = getNextPiece(this.placedPieces, this.availablePieces);
    if (nextPiece) {
      // Move next correct piece to placed
      this.placePiece(nextPiece.id);

      const key = `${ayah.surah}:${ayah.number}`;
      const prog = this.getAyahProgress(ayah.number);
      prog.hintsUsed = (prog.hintsUsed || 0) + 1;
      this.progress[key] = prog;
      this.saveProgress();
    }
  }

  public resetCurrentAyah() {
    audioService.pause();
    this.setupPuzzleForCurrentAyah();
    this.notify();
  }

  public updateDifficulty(mode: DifficultyMode) {
    if (this.settings.difficulty === mode) return;
    this.settings.difficulty = mode;
    this.saveSettings();
    this.setupPuzzleForCurrentAyah();
    this.notify();
  }

  public updateSettings(partial: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    if (partial.playbackSpeed !== undefined) {
      audioService.setSpeed(partial.playbackSpeed);
    }
    this.notify();
  }
}

export const store = new AppStore();
