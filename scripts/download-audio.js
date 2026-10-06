import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAudio(surahId = 67) {
  const pad3 = (n) => String(n).padStart(3, '0');
  const surahPad = pad3(surahId);

  const surahPath = path.join(__dirname, `../public/data/surah-${surahPad}.json`);
  if (!fs.existsSync(surahPath)) {
    console.error(`Data file not found: ${surahPath}`);
    process.exit(1);
  }

  const surahData = JSON.parse(fs.readFileSync(surahPath, 'utf-8'));
  const audioDir = path.join(__dirname, `../public/audio/${surahPad}`);

  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  console.log(`Downloading audio for Surah ${surahId} (${surahData.ayahs.length} ayahs)...`);

  for (const ayah of surahData.ayahs) {
    const ayahPad = pad3(ayah.number);
    const destFile = path.join(audioDir, `${ayahPad}.mp3`);

    if (fs.existsSync(destFile)) {
      console.log(`Ayah ${ayah.number}: already downloaded`);
      continue;
    }

    process.stdout.write(`Downloading Ayah ${ayah.number}... `);
    try {
      const res = await fetch(ayah.audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destFile, buffer);
      console.log(`Done (${Math.round(buffer.length / 1024)} KB)`);
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
  }

  console.log(`All audio downloaded to public/audio/${surahPad}/`);
}

const targetSurah = parseInt(process.argv[2] || '67', 10);
downloadAudio(targetSurah).catch(console.error);
