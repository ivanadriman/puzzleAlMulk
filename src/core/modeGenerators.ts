import { Ayah, BridgeOption, SprintOption, Word } from '../types';

/**
 * Deterministic & randomized generator helpers for Tahfiz game modes
 */

/**
 * Select indices of words to hide based on percentage (e.g. 0.25, 0.50, 1.00)
 */
export function selectHiddenIndices(totalWords: number, percentage: number): number[] {
  if (totalWords <= 0) return [];
  if (percentage >= 1.0) {
    return Array.from({ length: totalWords }, (_, i) => i);
  }

  const count = Math.max(1, Math.round(totalWords * percentage));
  // Distribute hidden words evenly across the sentence for balanced difficulty
  const step = totalWords / count;
  const indices: number[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.min(totalWords - 1, Math.floor(i * step + step / 2));
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }

  return indices.sort((a, b) => a - b);
}

/**
 * Generate 3 options for Word Sprint (1 correct word, 2 distractors from surrounding words)
 */
export function generateSprintOptions(
  correctWord: Word,
  allWords: Word[],
  lang: 'en' | 'id' = 'id'
): SprintOption[] {
  const correctGloss = correctWord.translations?.[lang] || correctWord.translation || '';
  const options: SprintOption[] = [
    {
      text: correctWord.text,
      isCorrect: true,
      gloss: correctGloss
    }
  ];

  // Pick 2 unique distractors
  const candidates = allWords.filter(
    (w) => w.text !== correctWord.text && w.index !== correctWord.index
  );

  // Shuffle candidates
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);

  const seen = new Set<string>([correctWord.text]);
  for (const c of shuffledCandidates) {
    if (!seen.has(c.text)) {
      seen.add(c.text);
      options.push({
        text: c.text,
        isCorrect: false,
        gloss: c.translations?.[lang] || c.translation || ''
      });
    }
    if (options.length >= 3) break;
  }

  // Shuffle final 3 options
  return options.sort(() => Math.random() - 0.5);
}

/**
 * Generate 3 options for Audio Snatch (1 correct word, 2 distractors)
 */
export function generateAudioSnatchOptions(
  correctWord: Word,
  allWords: Word[],
  lang: 'en' | 'id' = 'id'
): { text: string; isCorrect: boolean; gloss: string }[] {
  return generateSprintOptions(correctWord, allWords, lang);
}

/**
 * Generate 4 options for Ayah Bridge (1 correct opening snippet, 3 distractors from other ayahs)
 */
export function generateBridgeOptions(
  nextAyah: Ayah,
  allAyahs: Ayah[],
  lang: 'en' | 'id' = 'id'
): BridgeOption[] {
  const getSnippet = (a: Ayah) => a.words.slice(0, 3).map((w) => w.text).join(' ');
  const getTrans = (a: Ayah) => a.translations?.[lang] || a.translation || '';

  const correctSnippet = getSnippet(nextAyah);
  const options: BridgeOption[] = [
    {
      ayahNumber: nextAyah.number,
      textSnippet: correctSnippet,
      translation: getTrans(nextAyah),
      isCorrect: true
    }
  ];

  // Candidates from other ayahs
  const otherAyahs = allAyahs.filter((a) => a.number !== nextAyah.number);
  const shuffledOthers = [...otherAyahs].sort(() => Math.random() - 0.5);

  for (const a of shuffledOthers) {
    const snip = getSnippet(a);
    if (!options.some((o) => o.textSnippet === snip)) {
      options.push({
        ayahNumber: a.number,
        textSnippet: snip,
        translation: getTrans(a),
        isCorrect: false
      });
    }
    if (options.length >= 4) break;
  }

  // Shuffle final 4 options
  return options.sort(() => Math.random() - 0.5);
}
