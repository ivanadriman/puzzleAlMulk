# Puzzle Al-Mulk (سورة الملك) 📖✨

An interactive drag-and-drop Quran ayah puzzle web app built to help learners and memorizers memorize **Surah Al-Mulk** (Surah 67, 30 Ayahs) ayah by ayah.

Equipped with authentic Uthmani script typography, English translations (Sahih International), tap-to-place and drag-and-drop gameplay, and crystal-clear per-ayah recitations by **Mishary Rashid Alafasy**.

---

## 🌟 Features

- **Drag-and-Drop & Tap-to-Place**: Drag scrambled word pieces into correct RTL order, or tap pieces for effortless one-handed mobile memorization.
- **Auto-Recitation**: Upon correctly completing an ayah, the full verse is displayed with celebratory confetti, and the audio recitation by **Mishary Rashid Alafasy** plays automatically.
- **Reveal Ayah**: Option to reveal the complete verse at any time with its recitation to review before practicing.
- **Ayah Dropdown Picker & Manual Navigation**: Seamlessly switch between all 30 ayahs using the dropdown (with progress indicators) or the previous/next buttons.
- **Keyboard Shortcuts**:
  - `◀` Left Arrow: Previous Ayah
  - `▶` Right Arrow: Next Ayah
  - `Space`: Play / Pause recitation
  - `H`: Use Hint (places the next correct word)
  - `R`: Reveal complete Ayah
- **Difficulty Modes**:
  - **Word by Word**: Scrambles individual words (ideal for beginners and kids).
  - **Phrase Chunks**: Scrambles 2–3 word chunks (for intermediate learners).
- **Lightweight on Mobile**: Each ayah audio file is only ~100–180 KB, streamed from EveryAyah CDN and cached locally in the browser. Zero mobile lag.
- **Extensible Multi-Surah Architecture**: Add any other surah in seconds via `node scripts/fetch-surah.js <surah_id>`.

---

## 🚀 Getting Started

### 1. Install & Run Locally

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Open in browser: http://localhost:5173
```

### 2. Run Tests

```bash
npm test
```

### 3. Build for Production

```bash
npm run build
```

---

## 🌐 Deploy to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated deployment to GitHub Pages.

### Setup Instructions:

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Quran Ayah Puzzle for Surah Al-Mulk"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/puzzleAlMulk.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub: `https://github.com/<YOUR_GITHUB_USERNAME>/puzzleAlMulk`
   - Click on **Settings** ➔ **Pages** (in the left sidebar).
   - Under **Build and deployment** ➔ **Source**, select **GitHub Actions**.
   - Push any commit to `main`, and your site will be live at:
     ```
     https://<YOUR_GITHUB_USERNAME>.github.io/puzzleAlMulk/
     ```

---

## ➕ How to Add More Surahs

The app is built data-driven. To add another Surah (e.g., Surah Ya-Sin #36, or Surah Ar-Rahman #55):

```bash
# Fetch Surah 55 (Ar-Rahman)
node scripts/fetch-surah.js 55

# Or fetch Surah 36 (Ya-Sin)
node scripts/fetch-surah.js 36
```

This automatically:
1. Downloads the verified Uthmani script and word tokens from Quran.com.
2. Fetches the Sahih International translation from Al-Quran Cloud.
3. Configures EveryAyah audio URLs for Mishary Alafasy.
4. Updates `public/data/surahs.json` registry.
5. Displays the Surah selector dropdown in the app header automatically!

---

## 📜 License
MIT
