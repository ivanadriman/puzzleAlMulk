import { AppLanguage } from '../types';
import { store } from '../core/store';
import { setLanguage, t } from '../i18n';

const LANGUAGE_KEY = 'puzzle_al_mulk_language';

export class LanguageGateComponent {
  private container: HTMLElement;
  private onComplete: () => void;

  constructor(container: HTMLElement, onComplete: () => void) {
    this.container = container;
    this.onComplete = onComplete;
  }

  public static hasSelectedLanguage(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      return !!localStorage.getItem(LANGUAGE_KEY);
    } catch {
      return false;
    }
  }

  public static getSavedLanguage(): AppLanguage {
    try {
      if (typeof localStorage === 'undefined') return 'en';
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return saved === 'id' ? 'id' : 'en';
    } catch {
      return 'en';
    }
  }

  public render() {
    const html = `
      <div id="language-gate-backdrop" class="fixed inset-0 z-50 bg-[#0a1412] bg-islamic-pattern flex items-center justify-center p-3 sm:p-4 selection:bg-quran-gold selection:text-black overflow-y-auto max-h-[100dvh]">
        <div class="glass-panel w-full max-w-xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-quran-gold/50 shadow-glow-gold flex flex-col gap-3.5 sm:gap-5 text-center relative max-h-[94dvh] overflow-y-auto my-auto animate-fadeIn">
          
          <!-- Decorative Background Glow -->
          <div class="absolute -top-16 -right-16 w-48 h-48 bg-quran-gold/15 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-quran-emerald/20 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Header Icon & Welcome -->
          <div class="flex flex-col items-center gap-1.5 sm:gap-2">
            <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-quran-gold to-amber-700 flex items-center justify-center shadow-glow-gold text-xl sm:text-2xl mb-0.5 sm:mb-1">
              <span>📖</span>
            </div>
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Puzzle Al-Mulk • سورة الملك
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Please choose your language before proceeding to the memorization app:
            </p>
            <p class="text-[11px] sm:text-xs text-quran-gold font-arabic" dir="rtl">
              اختر لغتك للبدء في حفظ سورة الملك
            </p>
          </div>

          <!-- Three Language Title Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 my-1 sm:my-2 text-left">
            
            <!-- 1. English Card -->
            <button
              id="btn-choose-en"
              class="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#162e29] to-[#0f211d] hover:from-[#1e3f38] hover:to-[#142c26] border border-quran-border hover:border-quran-gold shadow-md hover:shadow-glow-gold transition-all active:scale-95 flex flex-col justify-between min-h-[96px] md:min-h-[140px]"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span class="text-xl sm:text-2xl">🇬🇧</span>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Active</span>
                </div>
                <div class="font-bold text-slate-100 text-sm md:text-base group-hover:text-quran-gold transition-colors">
                  English
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                  Sahih International Translation
                </div>
              </div>
              <div class="mt-2.5 sm:mt-4 text-[11px] font-semibold text-quran-gold flex items-center gap-1">
                <span>Select ➔</span>
              </div>
            </button>

            <!-- 2. Bahasa Indonesia Card -->
            <button
              id="btn-choose-id"
              class="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#162e29] to-[#0f211d] hover:from-[#1e3f38] hover:to-[#142c26] border border-quran-border hover:border-quran-gold shadow-md hover:shadow-glow-gold transition-all active:scale-95 flex flex-col justify-between min-h-[96px] md:min-h-[140px]"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span class="text-xl sm:text-2xl">🇮🇩</span>
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Aktif</span>
                </div>
                <div class="font-bold text-slate-100 text-sm md:text-base group-hover:text-quran-gold transition-colors">
                  Bahasa Indonesia
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                  Terjemahan Resmi Kemenag RI
                </div>
              </div>
              <div class="mt-2.5 sm:mt-4 text-[11px] font-semibold text-quran-gold flex items-center gap-1">
                <span>Pilih ➔</span>
              </div>
            </button>

            <!-- 3. Deutsch Card (Under Review / Coming Soon) -->
            <button
              id="btn-choose-de"
              class="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#12221e] to-[#0d1815] border border-quran-border/50 hover:border-amber-500/50 transition-all opacity-85 hover:opacity-100 flex flex-col justify-between text-left min-h-[96px] md:min-h-[140px]"
            >
              <div>
                <div class="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span class="text-xl sm:text-2xl">🇩🇪</span>
                  <span class="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Soon</span>
                </div>
                <div class="font-bold text-slate-200 text-sm md:text-base group-hover:text-amber-300 transition-colors">
                  Deutsch
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 sm:mt-1 leading-snug">
                  German Translation (Bubenheim & Elyas)
                </div>
              </div>
              <div class="mt-2.5 sm:mt-4 text-[10px] font-medium text-amber-400">
                <span>In Vorbereitung • Review</span>
              </div>
            </button>

          </div>

          <div id="language-gate-notice" class="hidden text-xs text-amber-300 bg-amber-950/60 p-3 rounded-xl border border-amber-500/40 text-center animate-fadeIn"></div>

          <div class="text-[11px] text-slate-400 pt-1.5 sm:pt-2 border-t border-quran-border/40">
            <span>You can change the language anytime in Settings (⚙️).</span>
          </div>

        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const btnEn = this.container.querySelector('#btn-choose-en');
    const btnId = this.container.querySelector('#btn-choose-id');
    const btnDe = this.container.querySelector('#btn-choose-de');
    const noticeEl = this.container.querySelector('#language-gate-notice');

    const selectLanguage = (lang: AppLanguage) => {
      try {
        localStorage.setItem(LANGUAGE_KEY, lang);
      } catch {}
      setLanguage(lang);
      store.updateLanguage(lang);
      this.container.innerHTML = '';
      this.onComplete();
    };

    if (btnEn) {
      btnEn.addEventListener('click', () => selectLanguage('en'));
    }

    if (btnId) {
      btnId.addEventListener('click', () => selectLanguage('id'));
    }

    if (btnDe) {
      btnDe.addEventListener('click', () => {
        if (noticeEl) {
          noticeEl.textContent = t('germanNotice');
          noticeEl.classList.remove('hidden');
        }
      });
    }
  }
}
