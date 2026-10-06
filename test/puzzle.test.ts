import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePieces, shufflePieces, isAyahSolved, getNextPiece, evaluateSlots } from '../src/core/puzzle';
import { en } from '../src/i18n/en';
import { id } from '../src/i18n/id';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const surahDataRaw = fs.readFileSync(path.join(__dirname, '../public/data/surah-067.json'), 'utf-8');
const surah67 = JSON.parse(surahDataRaw);

describe('Surah 67 Bilingual Data Integrity', () => {
  it('has valid metadata and 30 ayahs', () => {
    expect(surah67.id).toBe(67);
    expect(surah67.nameSimple).toBe('Al-Mulk');
    expect(surah67.ayahs.length).toBe(30);

    surah67.ayahs.forEach((ayah: any, idx: number) => {
      expect(ayah.number).toBe(idx + 1);
      expect(ayah.textUthmani.length).toBeGreaterThan(0);
      expect(ayah.words.length).toBeGreaterThan(0);
      expect(ayah.audioUrl).toContain('everyayah.com');
      
      // Verified English & Indonesian verse translations
      expect(ayah.translations).toBeDefined();
      expect(ayah.translations.en).toBeDefined();
      expect(ayah.translations.en.length).toBeGreaterThan(0);
      expect(ayah.translations.id).toBeDefined();
      expect(ayah.translations.id.length).toBeGreaterThan(0);

      // Verified English & Indonesian word glosses
      ayah.words.forEach((w: any) => {
        expect(w.translations).toBeDefined();
        expect(w.translations.en.length).toBeGreaterThan(0);
        expect(w.translations.id.length).toBeGreaterThan(0);
      });
    });
  });

  it('registry contains Surah 67', () => {
    const registryRaw = fs.readFileSync(path.join(__dirname, '../public/data/surahs.json'), 'utf-8');
    const registry = JSON.parse(registryRaw);
    const found = registry.find((s: any) => s.id === 67);
    expect(found).toBeDefined();
    expect(found.versesCount).toBe(30);
  });
});

describe('i18n Dictionary Parity', () => {
  it('has identical keys in English and Indonesian', () => {
    const enKeys = Object.keys(en).sort();
    const idKeys = Object.keys(id).sort();
    expect(enKeys).toEqual(idKeys);

    enKeys.forEach((key) => {
      const enVal = (en as any)[key];
      const idVal = (id as any)[key];
      expect(typeof enVal).toBe('string');
      expect(typeof idVal).toBe('string');
      expect(enVal.length).toBeGreaterThan(0);
      expect(idVal.length).toBeGreaterThan(0);
    });
  });
});

describe('Puzzle Engine Logic', () => {
  it('generates pieces in Word mode with bilingual translations', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'word');
    expect(pieces.length).toBe(ayah1.words.length);
    pieces.forEach((p, idx) => {
      expect(p.targetIndex).toBe(idx);
      expect(p.text).toBe(ayah1.words[idx].text);
      expect(p.translations?.en).toBe(ayah1.words[idx].translations.en);
      expect(p.translations?.id).toBe(ayah1.words[idx].translations.id);
    });
  });

  it('generates pieces in Phrase mode with bilingual translations', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'phrase');
    expect(pieces.length).toBeLessThan(ayah1.words.length);
    expect(pieces.length).toBeGreaterThan(1);

    const combinedText = pieces.map((p) => p.text).join(' ');
    const originalText = ayah1.words.map((w: any) => w.text).join(' ');
    expect(combinedText).toBe(originalText);

    pieces.forEach((p) => {
      expect(p.translations?.en.length).toBeGreaterThan(0);
      expect(p.translations?.id.length).toBeGreaterThan(0);
    });
  });

  it('shuffles pieces so they do not start in solved state', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'word');
    const shuffled = shufflePieces(pieces);

    expect(shuffled.length).toBe(pieces.length);
    const isOriginalOrder = shuffled.every((p, i) => p.targetIndex === i);
    expect(isOriginalOrder).toBe(false);
  });

  it('validates isAyahSolved correctly', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'word');

    expect(isAyahSolved(pieces.slice(0, 3), pieces.length)).toBe(false);
    expect(isAyahSolved(pieces, pieces.length)).toBe(true);

    const reversed = [...pieces].reverse();
    expect(isAyahSolved(reversed, pieces.length)).toBe(false);
  });

  it('finds next hint piece', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'word');

    const placed = [pieces[0], pieces[1]];
    const available = [pieces[3], pieces[2], pieces[4]];

    const hint = getNextPiece(placed, available);
    expect(hint).toBeDefined();
    expect(hint?.targetIndex).toBe(2);
    expect(hint?.text).toBe(pieces[2].text);
  });

  it('evaluateSlots correctly diagnoses wrong positions', () => {
    const ayah1 = surah67.ayahs[0];
    const pieces = generatePieces(ayah1, 'word');

    // All correct
    const correctSlots = [...pieces];
    const resCorrect = evaluateSlots(correctSlots);
    expect(resCorrect.isAllCorrect).toBe(true);
    expect(resCorrect.wrongCount).toBe(0);
    expect(resCorrect.wrongIndices).toEqual([]);

    // Swapped position 1 and 2
    const swappedSlots = [...pieces];
    swappedSlots[1] = pieces[2];
    swappedSlots[2] = pieces[1];
    const resSwapped = evaluateSlots(swappedSlots);
    expect(resSwapped.isAllCorrect).toBe(false);
    expect(resSwapped.wrongCount).toBe(2);
    expect(resSwapped.wrongIndices).toContain(1);
    expect(resSwapped.wrongIndices).toContain(2);

    // Incomplete slot
    const incompleteSlots = [...pieces];
    incompleteSlots[0] = null;
    const resIncomplete = evaluateSlots(incompleteSlots);
    expect(resIncomplete.isAllCorrect).toBe(false);
    expect(resIncomplete.wrongIndices).toContain(0);
  });
});
