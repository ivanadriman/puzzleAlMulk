import { store } from '../core/store';

export class HeaderComponent {
  private container: HTMLElement;
  private onOpenSettings: () => void;

  constructor(container: HTMLElement, onOpenSettings: () => void) {
    this.container = container;
    this.onOpenSettings = onOpenSettings;
  }

  public render() {
    const { currentSurah, surahList, settings } = store;

    const html = `
      <header class="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 border-b border-quran-border/60">
        
        <!-- Brand & Surah Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-quran-gold to-amber-700 flex items-center justify-center shadow-glow-gold text-black font-bold text-lg">
            <span>📖</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base md:text-lg font-bold text-slate-100 tracking-tight">Puzzle Al-Mulk</h1>
              <span class="font-quran text-lg md:text-xl text-quran-gold" dir="rtl">سُورَةُ المُلْكِ</span>
            </div>
            <p class="text-[11px] text-quran-textMuted flex items-center gap-1.5">
              <span>Reciter: Mishary Alafasy</span>
              <span>•</span>
              <span>30 Ayahs</span>
            </p>
          </div>
        </div>

        <!-- Controls: Multi-Surah (if >1), Difficulty & Settings -->
        <div class="flex items-center gap-2">
          
          ${
            surahList.length > 1
              ? `
            <!-- Surah Picker (Data-driven for multi-surahs) -->
            <select
              id="select-surah"
              class="bg-quran-card text-xs text-slate-200 border border-quran-border rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-quran-gold cursor-pointer"
            >
              ${surahList
                .map(
                  (s) => `
                <option value="${s.id}" ${currentSurah?.id === s.id ? 'selected' : ''}>
                  ${s.id}. ${s.nameSimple} (${s.nameArabic})
                </option>
              `
                )
                .join('')}
            </select>
          `
              : ''
          }

          <!-- Difficulty Pill Selector -->
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs">
            <button
              id="btn-diff-word"
              class="px-2.5 py-1 rounded-lg font-medium transition-all ${
                settings.difficulty === 'word'
                  ? 'bg-quran-gold text-black shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="Split into single words"
            >
              Words
            </button>
            <button
              id="btn-diff-phrase"
              class="px-2.5 py-1 rounded-lg font-medium transition-all ${
                settings.difficulty === 'phrase'
                  ? 'bg-quran-gold text-black shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="Split into 2-3 word phrase chunks"
            >
              Phrases
            </button>
          </div>

          <!-- Settings Button -->
          <button
            id="btn-open-settings"
            class="p-2 rounded-xl bg-quran-card hover:bg-quran-border text-slate-300 hover:text-quran-gold border border-quran-border transition-colors active:scale-95"
            title="App Settings"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
        </div>
      </header>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const btnWord = this.container.querySelector('#btn-diff-word');
    if (btnWord) {
      btnWord.addEventListener('click', () => store.updateDifficulty('word'));
    }

    const btnPhrase = this.container.querySelector('#btn-diff-phrase');
    if (btnPhrase) {
      btnPhrase.addEventListener('click', () => store.updateDifficulty('phrase'));
    }

    const btnSettings = this.container.querySelector('#btn-open-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => this.onOpenSettings());
    }

    const selectSurah = this.container.querySelector('#select-surah') as HTMLSelectElement | null;
    if (selectSurah) {
      selectSurah.addEventListener('change', () => {
        const id = parseInt(selectSurah.value, 10);
        store.loadSurah(id);
      });
    }
  }
}
