import { AppSettings, Ayah, AyahProgress, CheckStatus, DifficultyMode, PuzzlePiece, SurahData, SurahMeta } from '../types';
import { audioService } from '../services/audio';
import { dataService } from '../services/data';
import { evaluateSlots, generatePieces, shufflePieces } from './puzzle';

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

  // Discrete slots for RTL Quranic sentence layout
  public slots: (PuzzlePiece | null)[] = [];
  public availablePieces: PuzzlePiece[] = [];
  public status: 'solving' | 'solved' | 'revealed' = 'solving';
  public checkStatus: CheckStatus | null = null;
  public shakeError: boolean = false;

  public progress: Record<string, AyahProgress> = {};
  public settings: AppSettings = { ...defaultSettings };

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadPersistedState();
  }

  // Backwards compatibility helper
  public get placedPieces(): PuzzlePiece[] {
    return this.slots.filter((s): s is PuzzlePiece => s !== null);
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

  public notify() {
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

    // Preload audio for active and next ayah
    audioService.preload(ayah.audioUrl);
    if (this.currentSurah && this.currentAyahIndex + 1 < this.currentSurah.ayahs.length) {
      audioService.preload(this.currentSurah.ayahs[this.currentAyahIndex + 1].audioUrl);
    }

    const allPieces = generatePieces(ayah, this.settings.difficulty);
    // Initialize discrete empty slots (size = total pieces)
    this.slots = new Array(allPieces.length).fill(null);
    this.availablePieces = shufflePieces(allPieces);
    this.status = 'solving';
    this.checkStatus = null;
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
   * Place a piece into the first available empty slot (e.g. on tap from tray)
   */
  public placePieceInFirstSlot(pieceId: string) {
    if (this.status !== 'solving') return;

    const firstEmptyIdx = this.slots.findIndex((s) => s === null);
    if (firstEmptyIdx === -1) return; // All slots full

    const pieceIdx = this.availablePieces.findIndex((p) => p.id === pieceId);
    if (pieceIdx === -1) return;

    const [piece] = this.availablePieces.splice(pieceIdx, 1);
    this.slots[firstEmptyIdx] = piece;
    this.checkStatus = null;

    // Fire check automatically when all parts are assembled
    if (this.isAllSlotsFilled()) {
      this.checkCombination();
    } else {
      this.notify();
    }
  }

  /**
   * Place or swap a piece into a specific slot (via drag or direct slot tap)
   */
  public placePieceInSlot(pieceId: string, targetSlotIndex: number, fromSlotIndex?: number) {
    if (this.status !== 'solving') return;
    if (targetSlotIndex < 0 || targetSlotIndex >= this.slots.length) return;

    if (fromSlotIndex !== undefined) {
      // Dragged from another slot: swap or move
      if (fromSlotIndex === targetSlotIndex) return;

      const sourcePiece = this.slots[fromSlotIndex];
      const targetPiece = this.slots[targetSlotIndex];

      this.slots[targetSlotIndex] = sourcePiece;
      this.slots[fromSlotIndex] = targetPiece;
    } else {
      // Dragged from tray
      const trayIdx = this.availablePieces.findIndex((p) => p.id === pieceId);
      if (trayIdx === -1) return;

      const [newPiece] = this.availablePieces.splice(trayIdx, 1);
      const existingInSlot = this.slots[targetSlotIndex];

      if (existingInSlot) {
        // Return existing piece to tray
        this.availablePieces.push(existingInSlot);
      }

      this.slots[targetSlotIndex] = newPiece;
    }

    this.checkStatus = null;

    // Fire check automatically when all parts are assembled
    if (this.isAllSlotsFilled()) {
      this.checkCombination();
    } else {
      this.notify();
    }
  }

  /**
   * Remove a piece from a slot and return it to the tray
   */
  public removePieceFromSlot(slotIndex: number) {
    if (this.status !== 'solving') return;
    if (slotIndex < 0 || slotIndex >= this.slots.length) return;

    const piece = this.slots[slotIndex];
    if (!piece) return;

    this.slots[slotIndex] = null;
    this.availablePieces.push(piece);
    this.checkStatus = null;
    this.notify();
  }

  public isAllSlotsFilled(): boolean {
    return this.slots.length > 0 && this.slots.every((s) => s !== null);
  }

  /**
   * Evaluates the current combination.
   * Tells whether the combination is RIGHT or WRONG, and identifies wrong positions.
   */
  public checkCombination() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const evaluation = evaluateSlots(this.slots);
    this.checkStatus = evaluation;

    if (evaluation.isAllCorrect) {
      // 100% Correct
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
      // Incorrect combination - highlight wrong positions with shake
      this.shakeError = true;
      setTimeout(() => {
        this.shakeError = false;
        this.notify();
      }, 700);
    }

    this.notify();
  }

  public revealAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const allPieces = generatePieces(ayah, this.settings.difficulty);
    allPieces.sort((a, b) => a.targetIndex - b.targetIndex);

    this.slots = allPieces;
    this.availablePieces = [];
    this.status = 'revealed';
    this.checkStatus = {
      hasChecked: true,
      isAllCorrect: true,
      wrongCount: 0,
      wrongIndices: []
    };

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

    // Find first slot that is empty or incorrect
    const targetIdx = this.slots.findIndex((piece, idx) => !piece || piece.targetIndex !== idx);
    if (targetIdx === -1) return;

    // If current slot has a misplaced piece, return it to tray
    const currentMisplaced = this.slots[targetIdx];
    if (currentMisplaced) {
      this.availablePieces.push(currentMisplaced);
      this.slots[targetIdx] = null;
    }

    // Find the piece that belongs in targetIdx
    let correctPiece: PuzzlePiece | null = null;
    const trayIdx = this.availablePieces.findIndex((p) => p.targetIndex === targetIdx);
    if (trayIdx !== -1) {
      [correctPiece] = this.availablePieces.splice(trayIdx, 1);
    } else {
      // Piece might be in another slot
      const otherSlotIdx = this.slots.findIndex((p) => p?.targetIndex === targetIdx);
      if (otherSlotIdx !== -1) {
        correctPiece = this.slots[otherSlotIdx];
        this.slots[otherSlotIdx] = null;
      }
    }

    if (correctPiece) {
      this.slots[targetIdx] = correctPiece;
      this.checkStatus = null;

      const key = `${ayah.surah}:${ayah.number}`;
      const prog = this.getAyahProgress(ayah.number);
      prog.hintsUsed = (prog.hintsUsed || 0) + 1;
      this.progress[key] = prog;
      this.saveProgress();

      if (this.isAllSlotsFilled()) {
        this.checkCombination();
      } else {
        this.notify();
      }
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
