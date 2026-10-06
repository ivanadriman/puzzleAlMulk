import { describe, expect, it } from 'vitest';
import { generateBridgeOptions, generateSprintOptions, selectHiddenIndices } from '../src/core/modeGenerators';
import { Ayah, Word } from '../src/types';

describe('Mode Generators', () => {
  const mockWords: Word[] = [
    { index: 0, text: 'تَبَـٰرَكَ', translation: 'Blessed', transliteration: 'tabāraka', audio: null },
    { index: 1, text: 'ٱلَّذِى', translation: 'who', transliteration: 'alladhī', audio: null },
    { index: 2, text: 'بِيَدِهِ', translation: 'in Whose Hand', transliteration: 'biyadihi', audio: null },
    { index: 3, text: 'ٱلْمُلْكُ', translation: 'dominion', transliteration: 'al-mulku', audio: null },
    { index: 4, text: 'وَهُوَ', translation: 'and He', transliteration: 'wahuwa', audio: null },
    { index: 5, text: 'عَلَىٰ', translation: 'over', transliteration: 'ala', audio: null },
    { index: 6, text: 'كُلِّ', translation: 'all', transliteration: 'kulli', audio: null },
    { index: 7, text: 'شَىْءٍۢ', translation: 'things', transliteration: 'shayin', audio: null },
    { index: 8, text: 'قَدِيرٌ', translation: 'competent', transliteration: 'qadir', audio: null }
  ];

  it('selects correct count of hidden indices', () => {
    const hidden25 = selectHiddenIndices(mockWords.length, 0.25);
    expect(hidden25.length).toBe(2);

    const hidden50 = selectHiddenIndices(mockWords.length, 0.5);
    expect(hidden50.length).toBe(5);

    const hidden100 = selectHiddenIndices(mockWords.length, 1.0);
    expect(hidden100.length).toBe(9);
  });

  it('generates 3 options for Word Sprint including correct word', () => {
    const options = generateSprintOptions(mockWords[0], mockWords, 'en');
    expect(options.length).toBe(3);
    expect(options.some((o) => o.isCorrect && o.text === 'تَبَـٰرَكَ')).toBe(true);
    expect(options.filter((o) => o.isCorrect).length).toBe(1);
  });

  it('generates 4 options for Ayah Bridge', () => {
    const ayahs: Ayah[] = [
      {
        id: 1,
        surah: 67,
        number: 1,
        verseKey: '67:1',
        textUthmani: 'تَبَـٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ',
        endMarker: '١',
        translation: 'Blessed is He',
        words: mockWords.slice(0, 4),
        audioUrl: ''
      },
      {
        id: 2,
        surah: 67,
        number: 2,
        verseKey: '67:2',
        textUthmani: 'ٱلَّذِى خَلَقَ ٱلْمَوْتَ',
        endMarker: '٢',
        translation: 'Who created death',
        words: [
          { index: 0, text: 'ٱلَّذِى', translation: 'Who', transliteration: '', audio: null },
          { index: 1, text: 'خَلَقَ', translation: 'created', transliteration: '', audio: null },
          { index: 2, text: 'ٱلْمَوْتَ', translation: 'death', transliteration: '', audio: null }
        ],
        audioUrl: ''
      },
      {
        id: 3,
        surah: 67,
        number: 3,
        verseKey: '67:3',
        textUthmani: 'ٱلَّذِى خَلَقَ سَبْعَ',
        endMarker: '٣',
        translation: 'Who created seven',
        words: [
          { index: 0, text: 'ٱلَّذِى', translation: 'Who', transliteration: '', audio: null },
          { index: 1, text: 'خَلَقَ', translation: 'created', transliteration: '', audio: null },
          { index: 2, text: 'سَبْعَ', translation: 'seven', transliteration: '', audio: null }
        ],
        audioUrl: ''
      },
      {
        id: 4,
        surah: 67,
        number: 4,
        verseKey: '67:4',
        textUthmani: 'ثُمَّ ٱرْجِعِ ٱلْبَصَرَ',
        endMarker: '٤',
        translation: 'Then return your vision',
        words: [
          { index: 0, text: 'ثُمَّ', translation: 'Then', transliteration: '', audio: null },
          { index: 1, text: 'ٱرْجِعِ', translation: 'return', transliteration: '', audio: null },
          { index: 2, text: 'ٱلْبَصَرَ', translation: 'vision', transliteration: '', audio: null }
        ],
        audioUrl: ''
      }
    ];

    const bridgeOpts = generateBridgeOptions(ayahs[1], ayahs, 'en');
    expect(bridgeOpts.length).toBe(4);
    expect(bridgeOpts.some((o) => o.isCorrect && o.ayahNumber === 2)).toBe(true);
    expect(bridgeOpts.filter((o) => o.isCorrect).length).toBe(1);
  });
});
