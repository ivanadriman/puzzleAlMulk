import { Ayah, CheckStatus, DifficultyMode, PuzzlePiece, Word } from '../types';

/**
 * Split an ayah into puzzle pieces based on difficulty mode
 */
export function generatePieces(ayah: Ayah, mode: DifficultyMode): PuzzlePiece[] {
  const words = ayah.words;
  if (words.length === 0) return [];

  if (mode === 'word' || words.length <= 3) {
    // 1 word per piece
    return words.map((w, idx) => ({
      id: `w-${ayah.number}-${idx}`,
      targetIndex: idx,
      words: [w],
      text: w.text,
      translation: w.translation,
      transliteration: w.transliteration
    }));
  }

  // Phrase mode: chunk into 2-3 words per piece
  const chunks: Word[][] = [];
  let i = 0;
  while (i < words.length) {
    const remaining = words.length - i;
    // Determine chunk size (prefer 2 or 3)
    let chunkSize = 2;
    if (remaining === 3 || remaining === 6 || remaining === 9) {
      chunkSize = 3;
    } else if (remaining === 4) {
      chunkSize = 2;
    } else if (remaining > 4) {
      chunkSize = (chunks.length % 2 === 0) ? 2 : 3;
    } else {
      chunkSize = remaining;
    }

    chunks.push(words.slice(i, i + chunkSize));
    i += chunkSize;
  }

  return chunks.map((chunk, idx) => ({
    id: `chunk-${ayah.number}-${idx}`,
    targetIndex: idx,
    words: chunk,
    text: chunk.map((w) => w.text).join(' '),
    translation: chunk.map((w) => w.translation).filter(Boolean).join(' '),
    transliteration: chunk.map((w) => w.transliteration).filter(Boolean).join(' ')
  }));
}

/**
 * Fisher-Yates shuffle guaranteed to not match the original order (if length > 1)
 */
export function shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  if (pieces.length <= 1) return [...pieces];

  let shuffled: PuzzlePiece[] = [];
  let attempts = 0;

  do {
    shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempts++;
  } while (
    attempts < 20 &&
    shuffled.every((piece, idx) => piece.targetIndex === idx)
  );

  return shuffled;
}

/**
 * Check if current placed pieces form the full correct ayah
 */
export function isAyahSolved(placedPieces: PuzzlePiece[], totalCount: number): boolean {
  if (placedPieces.length !== totalCount) return false;
  return placedPieces.every((piece, idx) => piece.targetIndex === idx);
}

/**
 * Evaluate all slots and return detailed diagnostic status
 */
export function evaluateSlots(slots: (PuzzlePiece | null)[]): CheckStatus {
  const wrongIndices: number[] = [];
  const isAllFilled = slots.length > 0 && slots.every((s) => s !== null);

  slots.forEach((piece, idx) => {
    if (!piece || piece.targetIndex !== idx) {
      wrongIndices.push(idx);
    }
  });

  const isAllCorrect = isAllFilled && wrongIndices.length === 0;

  return {
    hasChecked: true,
    isAllCorrect,
    wrongCount: wrongIndices.length,
    wrongIndices
  };
}

/**
 * Find the next correct piece needed for the sentence
 */
export function getNextPiece(placedPieces: PuzzlePiece[], availablePieces: PuzzlePiece[]): PuzzlePiece | null {
  const nextTargetIndex = placedPieces.length;
  return availablePieces.find((p) => p.targetIndex === nextTargetIndex) || null;
}
