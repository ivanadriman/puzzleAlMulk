import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchSurah(surahId = 67) {
  console.log(`Fetching Surah ${surahId} with English & Indonesian translations...`);

  // 1. Fetch Surah chapter info
  const chapterRes = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
  if (!chapterRes.ok) throw new Error(`Failed to fetch chapter: ${chapterRes.statusText}`);
  const chapterData = await chapterRes.json();
  const chapter = chapterData.chapter;

  // 2. Fetch Verses with words in English from Quran.com
  const versesEnRes = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?words=true&word_fields=text_uthmani,translation,transliteration&per_page=300`
  );
  if (!versesEnRes.ok) throw new Error(`Failed to fetch English verses: ${versesEnRes.statusText}`);
  const versesEnData = await versesEnRes.json();

  // 3. Fetch Verses with words in Indonesian from Quran.com
  const versesIdRes = await fetch(
    `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?words=true&word_fields=text_uthmani,translation&language=id&per_page=300`
  );
  if (!versesIdRes.ok) throw new Error(`Failed to fetch Indonesian verses: ${versesIdRes.statusText}`);
  const versesIdData = await versesIdRes.json();

  // Map Indonesian words by verse_number and position
  const idWordMap = new Map();
  versesIdData.verses?.forEach((v) => {
    v.words?.forEach((w) => {
      const key = `${v.verse_number}:${w.position}`;
      idWordMap.set(key, w.translation?.text || '');
    });
  });

  // 4. Fetch full verse translations:
  // - English: Sahih International
  const transEnRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.sahih`);
  const transEnData = await transEnRes.json();
  const transEnMap = new Map();
  transEnData.data?.ayahs?.forEach((a) => {
    transEnMap.set(a.numberInSurah, a.text);
  });

  // - Indonesian: Kementerian Agama RI
  const transIdRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/id.indonesian`);
  const transIdData = await transIdRes.json();
  const transIdMap = new Map();
  transIdData.data?.ayahs?.forEach((a) => {
    transIdMap.set(a.numberInSurah, a.text);
  });

  const pad3 = (num) => String(num).padStart(3, '0');

  const ayahs = versesEnData.verses.map((v) => {
    const endMarker = v.words.find((w) => w.char_type_name === 'end')?.text_uthmani || `\u06DD${v.verse_number}`;

    const wordList = v.words
      .filter((w) => w.char_type_name === 'word')
      .map((w, idx) => {
        const enGloss = w.translation?.text || '';
        const idGloss = idWordMap.get(`${v.verse_number}:${w.position}`) || enGloss;

        return {
          index: idx,
          text: w.text_uthmani || w.text,
          translation: enGloss, // default fallback
          translations: {
            en: enGloss,
            id: idGloss
          },
          transliteration: w.transliteration?.text || '',
          audio: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : null
        };
      });

    const enText = transEnMap.get(v.verse_number) || '';
    const idText = transIdMap.get(v.verse_number) || '';

    const surahPad = pad3(surahId);
    const ayahPad = pad3(v.verse_number);

    return {
      id: v.id,
      surah: surahId,
      number: v.verse_number,
      verseKey: v.verse_key,
      textUthmani: wordList.map((w) => w.text).join(' '),
      endMarker,
      translation: enText, // default fallback
      translations: {
        en: enText,
        id: idText
      },
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
  console.log(`Saved ${fileName} (${ayahs.length} ayahs) with bilingual EN & ID translations`);

  // Update registry surahs.json
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
  registry.sort((a, b) => a.id - b.id);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
  console.log(`Updated surahs.json registry`);
}

const targetSurah = parseInt(process.argv[2] || '67', 10);
fetchSurah(targetSurah).catch((err) => {
  console.error('Error fetching surah:', err);
  process.exit(1);
});
