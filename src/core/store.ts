import type {
  AppLanguage,
  AppSettings,
  AudioSnatchState,
  Ayah,
  AyahProgress,
  BridgeState,
  CheckStatus,
  DifficultyMode,
  GameModeId,
  PuzzlePiece,
  SprintState,
  SurahData,
  SurahMeta,
  VanishingState,
  Word
} from '../types';
import { audioService } from '../services/audio';
import { dataService } from '../services/data';
import { soundService } from '../services/sound';
import { setLanguage, t } from '../i18n';
import { evaluateSlots, generatePieces, shufflePieces } from './puzzle';
import {
  generateAudioSnatchOptions,
  generateBridgeOptions,
  generateSprintOptions,
  selectHiddenIndices
} from './modeGenerators';

const SETTINGS_KEY = 'puzzle_al_mulk_settings_v1';
const PROGRESS_KEY = 'puzzle_al_mulk_progress_v1';

const defaultSettings: AppSettings = {
  language: 'en',
  activeGameMode: 'puzzle',
  gameLevel: 1, // Default to Level 1 Guided Repetition
  difficulty: 'word',
  showTranslation: true,
  showTransliteration: false,
  autoPlayAudio: true,
  soundEffects: true,
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

  // Instant feedback tracking
  public lastMistakePieceId: string | null = null;
  public lastMistakeSlotIndex: number | null = null;
  public mistakeMessage: string | null = null;

  public progress: Record<string, AyahProgress> = {};
  public settings: AppSettings = { ...defaultSettings };

  // 4 Additional Tahfiz Game Mode States
  public vanishingState: VanishingState | null = null;
  public audioSnatchState: AudioSnatchState | null = null;
  public bridgeState: BridgeState | null = null;
  public sprintState: SprintState | null = null;
  private audioSnatchTimer: any = null;
  private autoAdvanceTimer: any = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadPersistedState();
    soundService.enabled = this.settings.soundEffects;
    setLanguage(this.settings.language);
  }

  // Backwards compatibility helper
  public get placedPieces(): PuzzlePiece[] {
    return this.slots.filter((s): s is PuzzlePiece => s !== null);
  }

  public get activeSlotIndex(): number {
    return this.slots.findIndex((s) => s === null);
  }

  private loadPersistedState() {
    try {
      if (typeof localStorage === 'undefined') return;
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
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Failed saving progress:', e);
    }
  }

  public saveSettings() {
    try {
      if (typeof localStorage === 'undefined') return;
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
    this.setupModeForCurrentAyah();
    this.notify();
  }

  public getCurrentAyah(): Ayah | null {
    if (!this.currentSurah) return null;
    return this.currentSurah.ayahs[this.currentAyahIndex] || null;
  }

  public getCurrentAyahTranslation(): string {
    const ayah = this.getCurrentAyah();
    if (!ayah) return '';
    return ayah.translations?.[this.settings.language] || ayah.translation || '';
  }

  public getPieceTranslation(piece: PuzzlePiece): string {
    return piece.translations?.[this.settings.language] || piece.translation || '';
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

    this.clearAutoAdvanceTimer();
    audioService.pause();
    this.currentAyahIndex = index;
    this.setupModeForCurrentAyah();
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

  public getAllWordsInSurah(): Word[] {
    if (!this.currentSurah) return [];
    const words: Word[] = [];
    for (const a of this.currentSurah.ayahs) {
      words.push(...a.words);
    }
    return words;
  }

  public setGameMode(mode: GameModeId) {
    this.clearModeTimers();
    audioService.pause();
    this.settings.activeGameMode = mode;
    this.saveSettings();
    this.setupModeForCurrentAyah();
    this.notify();
  }

  public clearAutoAdvanceTimer() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  private clearModeTimers() {
    this.clearAutoAdvanceTimer();
    if (this.audioSnatchTimer) {
      clearInterval(this.audioSnatchTimer);
      this.audioSnatchTimer = null;
    }
  }

  public setupModeForCurrentAyah() {
    this.clearModeTimers();
    const mode = this.settings.activeGameMode || 'puzzle';
    switch (mode) {
      case 'puzzle':
        this.setupPuzzleForCurrentAyah();
        break;
      case 'vanishing':
        this.setupVanishingForCurrentAyah();
        break;
      case 'audio_snatch':
        this.setupAudioSnatchForCurrentAyah();
        break;
      case 'bridge':
        this.setupBridgeForCurrentAyah();
        break;
      case 'sprint':
        this.setupSprintForCurrentAyah();
        break;
      default:
        this.setupPuzzleForCurrentAyah();
        break;
    }
  }

  public setupVanishingForCurrentAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    audioService.preload(ayah.audioUrl);
    this.vanishingState = {
      stage: 1,
      hiddenIndices: [],
      solvedIndices: [],
      options: [],
      currentMissingTargetIdx: null,
      mistakeWordIdx: null,
      isStageComplete: false
    };
  }

  public advanceVanishingStage() {
    const ayah = this.getCurrentAyah();
    if (!ayah || !this.vanishingState) return;

    const nextStage = (this.vanishingState.stage + 1) as 1 | 2 | 3 | 4;
    if (nextStage > 4) {
      const key = `${ayah.surah}:${ayah.number}`;
      this.progress[key] = { solved: true, revealed: false, attempts: 1, hintsUsed: 0 };
      this.saveProgress();
      soundService.playSuccess();
      this.nextAyah();
      return;
    }

    let hiddenIndices: number[] = [];
    if (nextStage === 2) {
      hiddenIndices = selectHiddenIndices(ayah.words.length, 0.25);
    } else if (nextStage === 3) {
      hiddenIndices = selectHiddenIndices(ayah.words.length, 0.5);
    } else if (nextStage === 4) {
      hiddenIndices = selectHiddenIndices(ayah.words.length, 1.0);
    }

    const lang = this.settings.language;
    const options =
      nextStage === 4
        ? []
        : hiddenIndices
            .map((idx) => ({
              wordIdx: idx,
              text: ayah.words[idx].text,
              gloss: ayah.words[idx].translations?.[lang] || ayah.words[idx].translation || ''
            }))
            .sort(() => Math.random() - 0.5);

    this.vanishingState = {
      stage: nextStage,
      hiddenIndices,
      solvedIndices: [],
      options,
      currentMissingTargetIdx: hiddenIndices.length > 0 ? hiddenIndices[0] : null,
      mistakeWordIdx: null,
      isStageComplete: false
    };
    this.notify();
  }

  public selectVanishingOption(wordIdx: number) {
    if (!this.vanishingState || this.vanishingState.isStageComplete) return;
    const currentTarget = this.vanishingState.currentMissingTargetIdx;

    if (wordIdx === currentTarget) {
      soundService.playCorrect();
      this.vanishingState.solvedIndices.push(wordIdx);
      this.vanishingState.mistakeWordIdx = null;

      const remaining = this.vanishingState.hiddenIndices.filter(
        (i) => !this.vanishingState!.solvedIndices.includes(i)
      );

      if (remaining.length === 0) {
        this.vanishingState.isStageComplete = true;
        this.vanishingState.currentMissingTargetIdx = null;
        soundService.playSuccess();
      } else {
        this.vanishingState.currentMissingTargetIdx = remaining[0];
      }
    } else {
      soundService.playMistake();
      this.vanishingState.mistakeWordIdx = wordIdx;
      setTimeout(() => {
        if (this.vanishingState && this.vanishingState.mistakeWordIdx === wordIdx) {
          this.vanishingState.mistakeWordIdx = null;
          this.notify();
        }
      }, 700);
    }
    this.notify();
  }

  public revealVanishingAyah() {
    if (!this.vanishingState) return;
    this.vanishingState.solvedIndices = [...this.vanishingState.hiddenIndices];
    this.vanishingState.isStageComplete = true;
    soundService.playSuccess();
    this.notify();
  }

  public setupAudioSnatchForCurrentAyah() {
    this.clearModeTimers();
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const len = ayah.words.length;
    const splitIndex = len <= 2 ? 1 : Math.max(1, Math.min(len - 1, Math.floor(len / 2)));
    const targetWord = ayah.words[splitIndex];
    const allWords = this.getAllWordsInSurah();
    const options = generateAudioSnatchOptions(targetWord, allWords, this.settings.language);

    this.audioSnatchState = {
      splitWordIndex: splitIndex,
      options,
      isWaitingAnswer: true,
      timeLeft: 5,
      streak: this.audioSnatchState?.streak || 0,
      selectedOptionText: null,
      isCorrect: null
    };

    audioService.preload(ayah.audioUrl);
  }

  public startAudioSnatchCountdown() {
    this.clearModeTimers();
    if (!this.audioSnatchState) return;
    this.audioSnatchState.timeLeft = 5;
    this.audioSnatchState.isWaitingAnswer = true;
    this.notify();

    this.audioSnatchTimer = setInterval(() => {
      if (!this.audioSnatchState || !this.audioSnatchState.isWaitingAnswer) {
        this.clearModeTimers();
        return;
      }
      if (this.audioSnatchState.timeLeft <= 1) {
        this.clearModeTimers();
        this.audioSnatchState.timeLeft = 0;
        this.audioSnatchState.isWaitingAnswer = false;
        this.audioSnatchState.isCorrect = false;
        this.audioSnatchState.streak = 0;
        soundService.playMistake();
        this.notify();
      } else {
        this.audioSnatchState.timeLeft -= 1;
        this.notify();
      }
    }, 1000);
  }

  public selectAudioSnatchOption(text: string) {
    if (!this.audioSnatchState || !this.audioSnatchState.isWaitingAnswer) return;
    this.clearModeTimers();

    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const correctWord = ayah.words[this.audioSnatchState.splitWordIndex];
    const isCorrect = text === correctWord.text;

    this.audioSnatchState.selectedOptionText = text;
    this.audioSnatchState.isCorrect = isCorrect;
    this.audioSnatchState.isWaitingAnswer = false;

    if (isCorrect) {
      soundService.playCorrect();
      this.audioSnatchState.streak += 1;
      audioService.play(ayah.audioUrl).catch(console.warn);
    } else {
      soundService.playMistake();
      this.audioSnatchState.streak = 0;
    }
    this.notify();
  }

  public setupBridgeForCurrentAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah || !this.currentSurah) return;

    const fromNum = ayah.number;
    const totalAyahs = this.currentSurah.ayahs.length;
    const toNum = fromNum < totalAyahs ? fromNum + 1 : 1;
    const nextAyah =
      this.currentSurah.ayahs.find((a) => a.number === toNum) || this.currentSurah.ayahs[0];

    const options = generateBridgeOptions(nextAyah, this.currentSurah.ayahs, this.settings.language);

    this.bridgeState = {
      fromAyahNumber: fromNum,
      toAyahNumber: toNum,
      options,
      selectedAyahNumber: null,
      isCorrect: null,
      streak: this.bridgeState?.streak || 0,
      bestStreak: this.bridgeState?.bestStreak || 0
    };
  }

  public selectBridgeOption(chosenAyahNumber: number) {
    if (!this.bridgeState || this.bridgeState.isCorrect !== null) return;

    const isCorrect = chosenAyahNumber === this.bridgeState.toAyahNumber;
    this.bridgeState.selectedAyahNumber = chosenAyahNumber;
    this.bridgeState.isCorrect = isCorrect;

    if (isCorrect) {
      soundService.playCorrect();
      this.bridgeState.streak += 1;
      this.bridgeState.bestStreak = Math.max(this.bridgeState.bestStreak, this.bridgeState.streak);
    } else {
      soundService.playMistake();
      this.bridgeState.streak = 0;
    }
    this.notify();
  }

  public advanceBridgeToNext() {
    if (!this.bridgeState || !this.currentSurah) return;
    const targetIdx = this.bridgeState.toAyahNumber - 1;
    if (targetIdx >= 0 && targetIdx < this.currentSurah.ayahs.length) {
      this.setAyahIndex(targetIdx);
    }
  }

  public setupSprintForCurrentAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const firstWord = ayah.words[0];
    const allWords = this.getAllWordsInSurah();
    const options = generateSprintOptions(firstWord, allWords, this.settings.language);

    this.sprintState = {
      currentWordIndex: 0,
      options,
      startTime: null,
      elapsedMs: 0,
      combo: 0,
      bestCombo: 0,
      mistakes: 0,
      isFinished: false
    };
  }

  public selectSprintWord(text: string) {
    const ayah = this.getCurrentAyah();
    if (!ayah || !this.sprintState || this.sprintState.isFinished) return;

    if (this.sprintState.startTime === null) {
      this.sprintState.startTime = Date.now();
    }

    const expectedWord = ayah.words[this.sprintState.currentWordIndex];
    if (text === expectedWord.text) {
      soundService.playCorrect();
      this.sprintState.combo += 1;
      this.sprintState.bestCombo = Math.max(this.sprintState.bestCombo, this.sprintState.combo);
      this.sprintState.currentWordIndex += 1;

      if (this.sprintState.currentWordIndex >= ayah.words.length) {
        this.sprintState.isFinished = true;
        this.sprintState.elapsedMs = Date.now() - (this.sprintState.startTime || Date.now());
        soundService.playSuccess();
        const key = `${ayah.surah}:${ayah.number}`;
        this.progress[key] = { solved: true, revealed: false, attempts: 1, hintsUsed: 0 };
        this.saveProgress();
      } else {
        const nextWord = ayah.words[this.sprintState.currentWordIndex];
        const allWords = this.getAllWordsInSurah();
        this.sprintState.options = generateSprintOptions(nextWord, allWords, this.settings.language);
      }
    } else {
      soundService.playMistake();
      this.sprintState.combo = 0;
      this.sprintState.mistakes += 1;
    }
    this.notify();
  }

  public setupPuzzleForCurrentAyah() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    audioService.preload(ayah.audioUrl);
    if (this.currentSurah && this.currentAyahIndex + 1 < this.currentSurah.ayahs.length) {
      audioService.preload(this.currentSurah.ayahs[this.currentAyahIndex + 1].audioUrl);
    }

    const allPieces = generatePieces(ayah, this.settings.difficulty);
    this.slots = new Array(allPieces.length).fill(null);
    this.availablePieces = shufflePieces(allPieces);
    this.status = 'solving';
    this.checkStatus = null;
    this.shakeError = false;
    this.lastMistakePieceId = null;
    this.lastMistakeSlotIndex = null;
    this.mistakeMessage = null;

    const key = `${ayah.surah}:${ayah.number}`;
    if (!this.progress[key]) {
      this.progress[key] = { solved: false, revealed: false, attempts: 1, hintsUsed: 0 };
    } else {
      this.progress[key].attempts += 1;
    }
    this.saveProgress();
  }

  public selectPieceFromTray(pieceId: string, targetSlotIdx?: number) {
    if (this.status !== 'solving') return;

    const trayIdx = this.availablePieces.findIndex((p) => p.id === pieceId);
    if (trayIdx === -1) return;
    const piece = this.availablePieces[trayIdx];

    if (this.settings.gameLevel === 1) {
      // LEVEL 1: Sequential Guided Repetition
      const currentTargetSlot = this.activeSlotIndex;
      if (currentTargetSlot === -1) return;

      if (piece.targetIndex === currentTargetSlot) {
        soundService.playCorrect();
        this.availablePieces.splice(trayIdx, 1);
        this.slots[currentTargetSlot] = piece;
        this.lastMistakePieceId = null;
        this.mistakeMessage = null;

        if (this.isAllSlotsFilled()) {
          this.completeSolved();
        } else {
          this.notify();
        }
      } else {
        soundService.playMistake();
        this.lastMistakePieceId = piece.id;
        this.mistakeMessage = t('mistakeSequential');
        this.notify();

        setTimeout(() => {
          if (this.lastMistakePieceId === piece.id) {
            this.lastMistakePieceId = null;
            this.notify();
          }
        }, 750);
      }
    } else {
      // LEVEL 2: Free Puzzle Assembly
      const slotIndex = targetSlotIdx !== undefined ? targetSlotIdx : this.activeSlotIndex;
      if (slotIndex < 0 || slotIndex >= this.slots.length) return;

      const [newPiece] = this.availablePieces.splice(trayIdx, 1);
      const existingInSlot = this.slots[slotIndex];
      if (existingInSlot) {
        this.availablePieces.push(existingInSlot);
      }
      this.slots[slotIndex] = newPiece;

      if (newPiece.targetIndex === slotIndex) {
        soundService.playCorrect();
      } else {
        soundService.playMistake();
        this.lastMistakeSlotIndex = slotIndex;
        setTimeout(() => {
          if (this.lastMistakeSlotIndex === slotIndex) {
            this.lastMistakeSlotIndex = null;
            this.notify();
          }
        }, 750);
      }

      this.updateDiagnostics();
      if (this.isAllSlotsFilled()) {
        this.checkCombination();
      } else {
        this.notify();
      }
    }
  }

  public placePieceInSlot(pieceId: string, targetSlotIndex: number, fromSlotIndex?: number) {
    if (this.status !== 'solving') return;

    if (fromSlotIndex !== undefined) {
      if (fromSlotIndex === targetSlotIndex) return;

      const sourcePiece = this.slots[fromSlotIndex];
      const targetPiece = this.slots[targetSlotIndex];

      this.slots[targetSlotIndex] = sourcePiece;
      this.slots[fromSlotIndex] = targetPiece;

      if (sourcePiece && sourcePiece.targetIndex === targetSlotIndex) {
        soundService.playCorrect();
      } else {
        soundService.playMistake();
      }

      this.updateDiagnostics();
      if (this.isAllSlotsFilled()) {
        this.checkCombination();
      } else {
        this.notify();
      }
    } else {
      this.selectPieceFromTray(pieceId, targetSlotIndex);
    }
  }

  public removePieceFromSlot(slotIndex: number) {
    if (this.status !== 'solving') return;
    if (slotIndex < 0 || slotIndex >= this.slots.length) return;

    const piece = this.slots[slotIndex];
    if (!piece) return;

    this.slots[slotIndex] = null;
    this.availablePieces.push(piece);
    this.checkStatus = null;
    this.lastMistakePieceId = null;
    this.lastMistakeSlotIndex = null;
    this.mistakeMessage = null;
    this.notify();
  }

  public isAllSlotsFilled(): boolean {
    return this.slots.length > 0 && this.slots.every((s) => s !== null);
  }

  private updateDiagnostics() {
    this.checkStatus = evaluateSlots(this.slots);
  }

  public checkCombination() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    const evaluation = evaluateSlots(this.slots);
    this.checkStatus = evaluation;

    if (evaluation.isAllCorrect) {
      this.completeSolved();
    } else {
      soundService.playMistake();
      this.shakeError = true;
      setTimeout(() => {
        this.shakeError = false;
        this.notify();
      }, 700);
      this.notify();
    }
  }

  private completeSolved() {
    const ayah = this.getCurrentAyah();
    if (!ayah) return;

    this.status = 'solved';
    this.checkStatus = {
      hasChecked: true,
      isAllCorrect: true,
      wrongCount: 0,
      wrongIndices: []
    };

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
    this.notify();

    // 1-second delay after finishing puzzle, then automatically advance to the next ayah
    this.clearAutoAdvanceTimer();
    if (this.currentSurah && this.currentAyahIndex < this.currentSurah.ayahs.length - 1) {
      this.autoAdvanceTimer = setTimeout(() => {
        this.nextAyah();
      }, 1000);
    }
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

    const targetIdx = this.slots.findIndex((piece, idx) => !piece || piece.targetIndex !== idx);
    if (targetIdx === -1) return;

    const currentMisplaced = this.slots[targetIdx];
    if (currentMisplaced) {
      this.availablePieces.push(currentMisplaced);
      this.slots[targetIdx] = null;
    }

    let correctPiece: PuzzlePiece | null = null;
    const trayIdx = this.availablePieces.findIndex((p) => p.targetIndex === targetIdx);
    if (trayIdx !== -1) {
      [correctPiece] = this.availablePieces.splice(trayIdx, 1);
    } else {
      const otherSlotIdx = this.slots.findIndex((p) => p?.targetIndex === targetIdx);
      if (otherSlotIdx !== -1) {
        correctPiece = this.slots[otherSlotIdx];
        this.slots[otherSlotIdx] = null;
      }
    }

    if (correctPiece) {
      this.slots[targetIdx] = correctPiece;
      soundService.playCorrect();
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
    this.setupModeForCurrentAyah();
    this.notify();
  }

  public updateLanguage(lang: AppLanguage) {
    this.settings.language = lang;
    setLanguage(lang);
    this.saveSettings();
    this.notify();
  }

  public setGameLevel(level: 1 | 2) {
    if (this.settings.gameLevel === level) return;
    this.settings.gameLevel = level;
    this.saveSettings();
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
    if (partial.language !== undefined) {
      setLanguage(partial.language);
    }
    if (partial.soundEffects !== undefined) {
      soundService.enabled = partial.soundEffects;
    }
    this.saveSettings();
    if (partial.playbackSpeed !== undefined) {
      audioService.setSpeed(partial.playbackSpeed);
    }
    this.notify();
  }
}

export const store = new AppStore();
