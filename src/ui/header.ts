import { store } from '../core/store';
import { t } from '../i18n';
import { GAME_MODES } from './modeGate';

export class HeaderComponent {
  private container: HTMLElement;
  private onOpenSettings: () => void;
  private onOpenModeGate: () => void;

  constructor(
    container: HTMLElement,
    onOpenSettings: () => void,
    onOpenModeGate: () => void
  ) {
    this.container = container;
    this.onOpenSettings = onOpenSettings;
    this.onOpenModeGate = onOpenModeGate;
  }

  public render() {
    const { currentSurah, surahList, settings } = store;
    const activeModeId = settings.activeGameMode || 'puzzle';
    const activeModeMeta = GAME_MODES.find((m) => m.id === activeModeId) || GAME_MODES[0];
    const activeModeTitle = t(activeModeMeta.titleKey as any);

    const html = `
      <header class="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2.5 sm:pb-4 px-2 sm:px-3 border-b border-quran-border/60">
        
        <!-- Brand & Surah Title -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-quran-gold to-amber-700 flex items-center justify-center shadow-glow-gold text-base sm:text-lg select-none">
            <span>📖</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-sm sm:text-base md:text-lg font-bold text-slate-100 tracking-tight">${t('appTitle')}</h1>
              <span class="font-quran text-base sm:text-lg md:text-xl text-quran-gold" dir="rtl">${t('surahArabicTitle')}</span>
            </div>
            <p class="text-[10px] sm:text-[11px] text-quran-textMuted flex items-center gap-1.5">
              <span>${t('reciterInfo')}</span>
            </p>
          </div>
        </div>

        <!-- Controls: Mode Selector, Level, Language, Difficulty & Settings -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          
          <!-- Game Mode Selector Button -->
          <button
            id="btn-open-mode-gate"
            class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#173830] to-[#11241f] hover:from-[#1f4a3f] hover:to-[#16312a] text-slate-200 hover:text-quran-gold border border-quran-border hover:border-quran-gold/60 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-medium shadow-sm min-h-[38px]"
            title="${t('changeMode')}"
          >
            <span class="text-sm sm:text-base">${activeModeMeta.icon}</span>
            <span class="font-semibold text-slate-100 text-[11px] sm:text-xs">${activeModeTitle}</span>
            <span class="text-[10px] text-quran-gold opacity-80">▾</span>
          </button>

          <!-- Level 1 vs Level 2 Switcher (visible in Puzzle mode) -->
          ${
            activeModeId === 'puzzle'
              ? `
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs shadow-inner">
            <button
              id="btn-level-1"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all flex items-center gap-1 text-xs min-h-[38px] ${
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
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all flex items-center gap-1 text-xs min-h-[38px] ${
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
          `
              : ''
          }

          <!-- Quick Language Switcher Pill -->
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs shadow-inner">
            <button
              id="btn-lang-en"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs min-h-[38px] ${
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
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs min-h-[38px] ${
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
          <div class="bg-quran-card p-0.5 rounded-xl border border-quran-border flex text-xs shadow-inner">
            <button
              id="btn-diff-word"
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs min-h-[38px] ${
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
              class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs min-h-[38px] ${
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
              class="bg-quran-card text-xs text-slate-200 border border-quran-border rounded-xl px-2.5 py-2 min-h-[38px] focus:outline-none focus:border-quran-gold cursor-pointer"
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
            class="w-10 h-10 min-w-[38px] min-h-[38px] rounded-xl bg-quran-card hover:bg-quran-border text-slate-300 hover:text-quran-gold border border-quran-border transition-colors active:scale-95 flex items-center justify-center"
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
    const btnModeGate = this.container.querySelector('#btn-open-mode-gate');
    if (btnModeGate) {
      btnModeGate.addEventListener('click', () => this.onOpenModeGate());
    }

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
