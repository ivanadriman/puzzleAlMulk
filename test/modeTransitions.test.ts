import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../src/core/store';
import { SurahData } from '../src/types';

const mockSurah: SurahData = {
  id: 67,
  nameSimple: 'Al-Mulk',
  nameArabic: 'الملك',
  revelationPlace: 'makkah',
  versesCount: 2,
  ayahs: [
    {
      id: 1,
      surah: 67,
      number: 1,
      verseKey: '67:1',
      textUthmani: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ',
      endMarker: '١',
      translation: 'Blessed is He in whose hand is dominion',
      audioUrl: '',
      words: [
        { index: 0, text: 'تَبَـٰرَكَ', translation: 'Blessed', transliteration: 'tabaraka', audio: null },
        { index: 1, text: 'ٱلَّذِى', translation: 'who', transliteration: 'alladhi', audio: null },
        { index: 2, text: 'بِيَدِهِ', translation: 'in hand', transliteration: 'biyadihi', audio: null },
        { index: 3, text: 'ٱلْمُلْكُ', translation: 'dominion', transliteration: 'al-mulk', audio: null }
      ]
    },
    {
      id: 2,
      surah: 67,
      number: 2,
      verseKey: '67:2',
      textUthmani: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ',
      endMarker: '٢',
      translation: 'Who created death and life',
      audioUrl: '',
      words: [
        { index: 0, text: 'ٱلَّذِى', translation: 'Who', transliteration: 'alladhi', audio: null },
        { index: 1, text: 'خَلَقَ', translation: 'created', transliteration: 'khalaqa', audio: null },
        { index: 2, text: 'ٱلْمَوْتَ', translation: 'death', transliteration: 'al-mawt', audio: null },
        { index: 3, text: 'وَٱلْحَيَوٰةَ', translation: 'and life', transliteration: 'wal-hayah', audio: null }
      ]
    }
  ]
};

describe('Store Mode Switching & State Transitions', () => {
  beforeEach(() => {
    store.currentSurah = mockSurah;
    store.currentAyahIndex = 0;
  });

  it('switches between all 5 game modes cleanly', () => {
    store.setGameMode('puzzle');
    expect(store.settings.activeGameMode).toBe('puzzle');
    expect(store.slots.length).toBe(4);

    store.setGameMode('vanishing');
    expect(store.settings.activeGameMode).toBe('vanishing');
    expect(store.vanishingState?.stage).toBe(1);

    store.setGameMode('audio_snatch');
    expect(store.settings.activeGameMode).toBe('audio_snatch');
    expect(store.audioSnatchState?.options.length).toBe(3);

    store.setGameMode('bridge');
    expect(store.settings.activeGameMode).toBe('bridge');
    expect(store.bridgeState?.fromAyahNumber).toBe(1);
    expect(store.bridgeState?.toAyahNumber).toBe(2);

    store.setGameMode('sprint');
    expect(store.settings.activeGameMode).toBe('sprint');
    expect(store.sprintState?.currentWordIndex).toBe(0);
    expect(store.sprintState?.options.length).toBe(3);
  });

  it('handles vanishing mode stages (1 -> 2 -> 3 -> 4)', () => {
    store.setGameMode('vanishing');
    expect(store.vanishingState?.stage).toBe(1);

    store.advanceVanishingStage();
    expect(store.vanishingState?.stage).toBe(2);
    expect(store.vanishingState?.hiddenIndices.length).toBeGreaterThan(0);

    store.advanceVanishingStage();
    expect(store.vanishingState?.stage).toBe(3);

    store.advanceVanishingStage();
    expect(store.vanishingState?.stage).toBe(4);
    expect(store.vanishingState?.hiddenIndices.length).toBe(4);
  });

  it('handles word sprint taps and combo tracking', () => {
    store.setGameMode('sprint');
    expect(store.sprintState?.currentWordIndex).toBe(0);

    // Tap correct word 0
    store.selectSprintWord('تَبَـٰرَكَ');
    expect(store.sprintState?.currentWordIndex).toBe(1);
    expect(store.sprintState?.combo).toBe(1);

    // Tap mistake
    store.selectSprintWord('wrong_word');
    expect(store.sprintState?.currentWordIndex).toBe(1);
    expect(store.sprintState?.combo).toBe(0);
    expect(store.sprintState?.mistakes).toBe(1);
  });

  it('handles bridge mode correct selection', () => {
    store.setGameMode('bridge');
    expect(store.bridgeState?.toAyahNumber).toBe(2);

    store.selectBridgeOption(2);
    expect(store.bridgeState?.isCorrect).toBe(true);
    expect(store.bridgeState?.streak).toBe(1);
  });
});
