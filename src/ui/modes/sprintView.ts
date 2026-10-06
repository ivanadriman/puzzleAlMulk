import { store } from '../../core/store';
import { t } from '../../i18n';

export class SprintView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const ayah = store.getCurrentAyah();
    const state = store.sprintState;

    if (!ayah || !state) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Word Sprint...</div>`;
      return;
    }

    const { currentWordIndex, options, elapsedMs, combo, mistakes, isFinished } = state;
    const settings = store.settings;

    const fontSizeClass =
      settings.arabicFontSize === 'xlarge'
        ? 'text-2xl sm:text-3xl md:text-4xl'
        : settings.arabicFontSize === 'large'
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-lg sm:text-xl md:text-2xl';

    const totalWords = ayah.words.length;
    const progressPercent = Math.round((currentWordIndex / totalWords) * 100);

    // Assembled words so far
    const completedWords = ayah.words.slice(0, currentWordIndex);

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fadeIn">
        
        <!-- Mode Header & Combo / Stats -->
        <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-quran-gold/40 shadow-glow-gold flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">⚡</span>
            <div>
              <div class="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>${t('modeSprintTitle')}</span>
                <span class="text-xs text-quran-gold font-normal">(${t('ayahOf', { current: ayah.number, total: store.currentSurah?.versesCount || 30 })})</span>
              </div>
              <div class="text-[11px] text-quran-textMuted">${t('sprintInstruction')}</div>
            </div>
          </div>

          <!-- Combo & Progress -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="px-2.5 py-1 rounded-full ${
              combo >= 3
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow-gold animate-bounce'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            } text-xs font-bold flex items-center gap-1">
              <span>${combo >= 3 ? '🔥' : '⚡'}</span>
              <span>${t('sprintCombo', { n: combo })}</span>
            </div>

            <div class="px-2.5 py-1 rounded-full bg-black/40 text-slate-300 border border-quran-border/50 text-xs font-mono">
              ${currentWordIndex}/${totalWords}
            </div>
          </div>
        </div>

        <!-- Assembled Sentence View (Live Assembly) -->
        <div class="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 border border-quran-border/80 text-center relative overflow-hidden">
          
          <!-- Progress Bar Line -->
          <div class="w-full bg-black/30 h-1.5 rounded-full mb-4 overflow-hidden border border-quran-border/30">
            <div class="bg-gradient-to-r from-emerald-500 to-quran-gold h-full transition-all duration-300 rounded-full" style="width: ${progressPercent}%;"></div>
          </div>

          <div class="min-h-[70px] sm:min-h-[90px] flex items-center justify-center my-2" dir="rtl">
            <p class="font-quran ${fontSizeClass} text-amber-100 leading-loose flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              ${
                completedWords.length === 0
                  ? `<span class="text-slate-500 text-sm font-sans tracking-normal select-none italic">${t('sprintInstruction')}</span>`
                  : completedWords
                      .map(
                        (w) => `
                    <span class="inline-block px-1.5 sm:px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 animate-fadeIn">
                      ${w.text}
                    </span>
                  `
                      )
                      .join(' ')
              }
              ${
                !isFinished
                  ? `
                <span class="inline-flex items-center justify-center px-3 py-1 rounded-xl border-2 border-dashed border-quran-gold bg-quran-gold/20 text-quran-gold animate-pulse text-base sm:text-lg min-w-[60px]">
                  • • •
                </span>
              `
                  : `<span class="text-quran-gold select-none inline-block font-sans text-xl align-middle mx-1">۝${ayah.number}</span>`
              }
            </p>
          </div>
        </div>

        <!-- Action / 3 Reflex Tap Buttons -->
        ${
          isFinished
            ? `
          <!-- Result Card -->
          <div class="glass-card rounded-2xl p-5 sm:p-7 border border-emerald-500/50 bg-emerald-950/40 text-center flex flex-col items-center gap-3 animate-fadeIn">
            <div class="text-2xl sm:text-3xl">🎉</div>
            <div class="text-base sm:text-lg font-bold text-emerald-200">
              ${t('mashaAllahCompleted')}
            </div>
            <div class="text-xs sm:text-sm text-slate-300">
              ${t('sprintRecord', {
                s: (elapsedMs / 1000).toFixed(1),
                acc: Math.max(0, Math.round((totalWords / (totalWords + mistakes)) * 100))
              })}
            </div>
            <div class="flex items-center gap-2 mt-2">
              <button id="btn-restart-sprint" class="px-4 py-2 rounded-xl bg-quran-card hover:bg-quran-border text-xs sm:text-sm text-slate-200 transition-all">
                ${t('sprintRestart')}
              </button>
              <button id="btn-next-sprint" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95">
                ${t('nextAyahButton')} ➔
              </button>
            </div>
          </div>
        `
            : `
          <!-- 3 Rapid Tap Buttons (Large Thumb Targets) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3" dir="rtl">
            ${options
              .map((opt) => {
                return `
                <button
                  type="button"
                  data-sprint-text="${opt.text}"
                  class="btn-sprint-option p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#18342e] to-[#10231f] hover:from-[#224b41] hover:to-[#17332c] border border-quran-border hover:border-quran-gold shadow-md hover:shadow-glow-gold transition-all active:scale-95 flex flex-col items-center justify-center min-h-[76px] sm:min-h-[90px]"
                >
                  <span class="font-quran text-2xl sm:text-3xl text-amber-100 leading-snug">${opt.text}</span>
                  ${
                    settings.showTranslation && opt.gloss
                      ? `<span class="text-[10px] sm:text-xs text-slate-400 font-light mt-1">${opt.gloss}</span>`
                      : ''
                  }
                </button>
              `;
              })
              .join('')}
          </div>
        `
        }

      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const nextBtn = this.container.querySelector('#btn-next-sprint');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        store.nextAyah();
      });
    }

    const restartBtn = this.container.querySelector('#btn-restart-sprint');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        store.setupSprintForCurrentAyah();
      });
    }

    const optButtons = this.container.querySelectorAll<HTMLButtonElement>('.btn-sprint-option');
    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.sprintText;
        if (text) {
          store.selectSprintWord(text);
        }
      });
    });
  }
}
