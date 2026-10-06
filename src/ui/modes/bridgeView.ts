import { store } from '../../core/store';
import { t } from '../../i18n';

export class BridgeView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const state = store.bridgeState;
    const currentAyah = store.getCurrentAyah();

    if (!state || !currentAyah) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Ayah Bridge...</div>`;
      return;
    }

    const { fromAyahNumber, toAyahNumber, options, selectedAyahNumber, isCorrect, streak, bestStreak } = state;
    const settings = store.settings;

    // Tail of fromAyah (last 4 words)
    const tailWords = currentAyah.words.slice(-4).map((w) => w.text).join(' ');

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fadeIn">
        
        <!-- Mode Header & Streaks -->
        <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-quran-gold/40 shadow-glow-gold flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🌉</span>
            <div>
              <div class="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>${t('modeBridgeTitle')}</span>
                <span class="text-xs text-quran-gold font-normal">(${t('bridgeHeading', { from: fromAyahNumber, to: toAyahNumber })})</span>
              </div>
              <div class="text-[11px] text-quran-textMuted">${t('bridgePrompt', { to: toAyahNumber })}</div>
            </div>
          </div>

          <!-- Streak Counters -->
          <div class="flex items-center gap-2">
            <div class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <span>🔗</span>
              <span>${t('bridgeStreak', { n: streak })}</span>
            </div>
            ${
              bestStreak > 0
                ? `<div class="px-2 py-1 rounded-full bg-quran-gold/15 text-quran-gold border border-quran-gold/30 text-[11px] font-semibold hidden sm:flex items-center gap-1">
                    <span>🏆</span>
                    <span>${t('bridgeBestStreak', { n: bestStreak })}</span>
                  </div>`
                : ''
            }
          </div>
        </div>

        <!-- End of Previous Ayah Card -->
        <div class="glass-panel rounded-2xl p-4 sm:p-6 border border-quran-border/80 text-center relative">
          <div class="text-xs text-quran-textMuted mb-2">
            ${t('bridgeEndOfAyah', { n: fromAyahNumber })}
          </div>
          <div class="my-2" dir="rtl">
            <p class="font-quran text-xl sm:text-2xl md:text-3xl text-amber-100 leading-relaxed flex items-center justify-center gap-2">
              <span class="text-slate-400 text-lg">...</span>
              <span>${tailWords}</span>
              <span class="text-quran-gold select-none inline-block font-sans text-xl align-middle mx-1">۝${fromAyahNumber}</span>
            </p>
          </div>
          <div class="mt-3 text-xs sm:text-sm text-quran-gold font-medium">
            ⬇️ ${t('bridgePrompt', { to: toAyahNumber })} ⬇️
          </div>
        </div>

        <!-- 4 Cards Options for Opening of Next Ayah -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
          ${options
            .map((opt) => {
              const isSelected = selectedAyahNumber === opt.ayahNumber;
              const isRevealedAnswer = isCorrect !== null;
              const isThisCorrect = opt.ayahNumber === toAyahNumber;

              let cardClasses = 'border-quran-border hover:border-quran-gold bg-[#152e27] hover:bg-[#1a3d34] text-slate-100';
              if (isRevealedAnswer) {
                if (isThisCorrect) {
                  cardClasses = 'border-emerald-500 bg-emerald-950/80 text-emerald-100 shadow-glow-gold';
                } else if (isSelected && !isThisCorrect) {
                  cardClasses = 'border-red-500 bg-red-950/80 text-red-200 animate-shake';
                } else {
                  cardClasses = 'border-slate-800 bg-black/30 text-slate-500 opacity-60';
                }
              }

              return `
              <button
                type="button"
                data-bridge-ayah="${opt.ayahNumber}"
                ${isRevealedAnswer ? 'disabled' : ''}
                class="btn-bridge-opt p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border ${cardClasses} shadow-md transition-all active:scale-[0.98] flex flex-col justify-between text-right min-h-[90px] sm:min-h-[105px]"
                dir="rtl"
              >
                <div>
                  <div class="flex items-center justify-between mb-1.5" dir="ltr">
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isRevealedAnswer && isThisCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-black/30 text-slate-400'
                    }">Ayat ${opt.ayahNumber}</span>
                    ${
                      isRevealedAnswer && isThisCorrect
                        ? '<span class="text-xs text-emerald-400 font-bold">✓ Benar</span>'
                        : isSelected && !isThisCorrect
                        ? '<span class="text-xs text-red-400 font-bold">✗ Salah</span>'
                        : ''
                    }
                  </div>
                  <div class="font-quran text-lg sm:text-xl text-amber-100 leading-snug">
                    ${opt.textSnippet} ...
                  </div>
                </div>
                ${
                  settings.showTranslation && opt.translation
                    ? `
                  <div class="text-[11px] text-slate-400 font-light mt-1.5 text-left line-clamp-1" dir="ltr">
                    "${opt.translation}"
                  </div>
                `
                    : ''
                }
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- Post Answer Action -->
        ${
          isCorrect !== null
            ? `
          <div class="glass-card rounded-2xl p-4 border ${
            isCorrect ? 'border-emerald-500/50 bg-emerald-950/40' : 'border-red-500/50 bg-red-950/40'
          } text-center flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div class="text-xs sm:text-sm font-semibold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}">
              ${isCorrect ? t('bridgeCorrect') : t('bridgeWrong')}
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-advance-bridge" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                <span>${t('bridgeNext')}</span>
              </button>
            </div>
          </div>
        `
            : ''
        }

      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const advanceBtn = this.container.querySelector('#btn-advance-bridge');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        store.advanceBridgeToNext();
      });
    }

    const optButtons = this.container.querySelectorAll<HTMLButtonElement>('.btn-bridge-opt');
    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const ayahNum = parseInt(btn.dataset.bridgeAyah || '-1', 10);
        if (ayahNum > 0) {
          store.selectBridgeOption(ayahNum);
        }
      });
    });
  }
}
