import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchSurah(surahId = 67) {
  console.log(`Fetching Surah ${surahId}...`);

  // 1. Fetch Surah chapter info
  const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
  if (!chapterRes.ok) throw new Error(`Failed to fetch chapter: ${chapterRes.statusText}`);
  const chapterData = await chapterRes.json();
  const chapter = chapterData.chapter;

  // 2. Fetch Verses with words from Quran.com
  const versesRes = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?words=true&word_fields=text_uthmani,translation,transliteration&per_page=300`
  );
  if (!versesRes.ok) throw new Error(`Failed to fetch verses: ${versesRes.statusText}`);
  const versesData = await versesRes.json();

  // 3. Fetch verified English translation (Sahih International)
  const transRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.sahih`);
  const transData = await transRes.json();
  const translationsMap = new Map();
  if (transData.data?.ayahs) {
    transData.data.ayahs.forEach((a) => {
      translationsMap.set(a.numberInSurah, a.text);
    });
  }

  const pad3 = (num) => String(num).padStart(3, '0');

  const ayahs = versesData.verses.map((v) => {
    const translationText = translationsMap.get(v.verse_number) || '';

    // Filter out 'end' marker glyph from draggable words, but capture it
    const endMarker = v.words.find((w) => w.char_type_name === 'end')?.text_uthmani || `\u06DD${v.verse_number}`;
    const wordList = v.words
      .filter((w) => w.char_type_name === 'word')
      .map((w, idx) => ({
        index: idx,
        text: w.text_uthmani || w.text,
        translation: w.translation?.text || '',
        transliteration: w.transliteration?.text || '',
        audio: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : null
      }));

    const surahPad = pad3(surahId);
    const ayahPad = pad3(v.verse_number);

    return {
      id: v.id,
      surah: surahId,
      number: v.verse_number,
      verseKey: v.verse_key,
      textUthmani: wordList.map((w) => w.text).join(' '),
      endMarker,
      translation: translationText,
      words: wordList,
      audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`
    };
  });

  const surahOutput = {
    id: chapter.id,
    nameSimple: chapter.name_simple,
    nameArabic: chapter.name_arabic,
    revelationPlace: chapter.revelation_place,
    versesCount: chapter.verses_count,
    ayahs
  };

  const outputDir = path.join(__dirname, '../public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `surah-${pad3(surahId)}.json`;
  fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(surahOutput, null, 2), 'utf-8');
  console.log(`Saved ${fileName} (${ayahs.length} ayahs)`);

  // Update or create registry surahs.json
  const registryPath = path.join(outputDir, 'surahs.json');
  let registry = [];
  if (fs.existsSync(registryPath)) {
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    } catch {
      registry = [];
    }
  }

  const existingIdx = registry.findIndex((s) => s.id === surahId);
  const entry = {
    id: chapter.id,
    nameSimple: chapter.name_simple,
    nameArabic: chapter.name_arabic,
    versesCount: chapter.verses_count,
    revelationPlace: chapter.revelation_place,
    file: fileName
  };

  if (existingIdx >= 0) {
    registry[existingIdx] = entry;
  } else {
    registry.push(entry);
  }
  // Sort by surah id
  registry.sort((a, b) => a.id - b.id);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Updated surahs.json registry`);
}

const targetSurah = parseInt(process.argv[2] || '67', 10);
fetchSurah(targetSurah).catch((err) => {
  console.error('Error fetching surah:', err);
  process.exit(1);
});
