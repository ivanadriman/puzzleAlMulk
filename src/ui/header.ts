import { store } from '../core/store';
import { t } from '../i18n';

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
              <h1 class="text-base md:text-lg font-bold text-slate-100 tracking-tight">${t('appTitle')}</h1>
              <span class="font-quran text-lg md:text-xl text-quran-gold" dir="rtl">${t('surahArabicTitle')}</span>
            </div>
            <p class="text-[11px] text-quran-textMuted flex items-center gap-1.5">
              <span>${t('reciterInfo')}</span>
            </p>
          </div>
        </div>

        <!-- Controls: Level Selector, Language, Mode & Settings -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          
          <!-- Level 1 vs Level 2 Switcher -->
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs shadow-inner">
            <button
              id="btn-level-1"
              class="px-2.5 md:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.gameLevel === 1
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="${t('level1Tooltip')}"
            >
              <span>🎯</span>
              <span>${t('level1Title')}</span>
            </button>
            <button
              id="btn-level-2"
              class="px-2.5 md:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                settings.gameLevel === 2
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="${t('level2Tooltip')}"
            >
              <span>🧩</span>
              <span>${t('level2Title')}</span>
            </button>
          </div>

          <!-- Quick Language Switcher Pill -->
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs shadow-inner">
            <button
              id="btn-lang-en"
              class="px-2 py-1.5 rounded-lg font-medium transition-all ${
                settings.language === 'en'
                  ? 'bg-quran-gold text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="Switch to English"
            >
              EN
            </button>
            <button
              id="btn-lang-id"
              class="px-2 py-1.5 rounded-lg font-medium transition-all ${
                settings.language === 'id'
                  ? 'bg-quran-gold text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="Ganti ke Bahasa Indonesia"
            >
              ID
            </button>
          </div>

          <!-- Difficulty Pill: Words vs Phrases -->
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs">
            <button
              id="btn-diff-word"
              class="px-2 py-1.5 rounded-lg font-medium transition-all ${
                settings.difficulty === 'word'
                  ? 'bg-quran-gold text-black shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="${t('wordsTooltip')}"
            >
              ${t('words')}
            </button>
            <button
              id="btn-diff-phrase"
              class="px-2 py-1.5 rounded-lg font-medium transition-all ${
                settings.difficulty === 'phrase'
                  ? 'bg-quran-gold text-black shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }"
              title="${t('phrasesTooltip')}"
            >
              ${t('phrases')}
            </button>
          </div>

          ${
            surahList.length > 1
              ? `
            <select
              id="select-surah"
              class="bg-quran-card text-xs text-slate-200 border border-quran-border rounded-xl px-2 py-1.5 focus:outline-none focus:border-quran-gold cursor-pointer"
            >
              ${surahList
                .map(
                  (s) => `
                <option value="${s.id}" ${currentSurah?.id === s.id ? 'selected' : ''}>
                  ${s.id}. ${s.nameSimple}
                </option>
              `
                )
                .join('')}
            </select>
          `
              : ''
          }

          <!-- Settings Button -->
          <button
            id="btn-open-settings"
            class="p-2 rounded-xl bg-quran-card hover:bg-quran-border text-slate-300 hover:text-quran-gold border border-quran-border transition-colors active:scale-95"
            title="${t('settingsTitle')}"
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
    const btnLevel1 = this.container.querySelector('#btn-level-1');
    if (btnLevel1) {
      btnLevel1.addEventListener('click', () => store.setGameLevel(1));
    }

    const btnLevel2 = this.container.querySelector('#btn-level-2');
    if (btnLevel2) {
      btnLevel2.addEventListener('click', () => store.setGameLevel(2));
    }

    const btnLangEn = this.container.querySelector('#btn-lang-en');
    if (btnLangEn) {
      btnLangEn.addEventListener('click', () => store.updateLanguage('en'));
    }

    const btnLangId = this.container.querySelector('#btn-lang-id');
    if (btnLangId) {
      btnLangId.addEventListener('click', () => store.updateLanguage('id'));
    }

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
