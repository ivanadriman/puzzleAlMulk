import { store } from '../../core/store';
import { audioService } from '../../services/audio';
import { t } from '../../i18n';

export class AudioSnatchView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const ayah = store.getCurrentAyah();
    const state = store.audioSnatchState;

    if (!ayah || !state) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Audio Snatch...</div>`;
      return;
    }

    const { splitWordIndex, options, isWaitingAnswer, timeLeft, streak, isCorrect } = state;
    const settings = store.settings;

    const fontSizeClass =
      settings.arabicFontSize === 'xlarge'
        ? 'text-2xl sm:text-3xl md:text-4xl'
        : settings.arabicFontSize === 'large'
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-lg sm:text-xl md:text-2xl';

    // Words up to splitWordIndex
    const precedingWords = ayah.words.slice(0, splitWordIndex).map((w) => w.text).join(' ');
    const correctWord = ayah.words[splitWordIndex]?.text || '';

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fadeIn">
        
        <!-- Mode Header -->
        <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-quran-gold/40 shadow-glow-gold flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🎧</span>
            <div>
              <div class="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>${t('modeAudioSnatchTitle')}</span>
                <span class="text-xs text-quran-gold font-normal">(${t('ayahOf', { current: ayah.number, total: store.currentSurah?.versesCount || 30 })})</span>
              </div>
              <div class="text-[11px] text-quran-textMuted">${t('audioSnatchPausedPrompt')}</div>
            </div>
          </div>

          <!-- Streak Badge & Timer -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
              <span>🔥</span>
              <span>${t('audioSnatchStreak', { n: streak })}</span>
            </div>

            <div class="px-3 py-1 rounded-full ${
              timeLeft <= 2 ? 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse font-bold' : 'bg-quran-gold/20 text-quran-gold border border-quran-gold/40'
            } text-xs font-mono">
              ⏱️ ${timeLeft}s
            </div>
          </div>
        </div>

        <!-- Suspense Verse Container -->
        <div class="glass-panel rounded-2xl p-5 sm:p-7 md:p-8 border border-quran-border/80 text-center relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-36 h-36 bg-quran-gold/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Verse snippet with question box -->
          <div class="my-3 sm:my-5" dir="rtl">
            <p class="font-quran ${fontSizeClass} text-amber-100 leading-loose flex flex-wrap items-center justify-center gap-2">
              <span class="text-slate-200">${precedingWords}</span>
              <span class="inline-flex items-center justify-center px-3 py-1 rounded-xl border-2 ${
                isCorrect === true
                  ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200'
                  : isCorrect === false
                  ? 'border-red-500 bg-red-950/70 text-red-200'
                  : 'border-dashed border-quran-gold bg-quran-gold/20 text-quran-gold animate-pulse'
              } text-base sm:text-lg min-w-[70px]">
                ${isCorrect !== null ? correctWord : '❓ [ ? ]'}
              </span>
            </p>
          </div>

          <!-- Audio replay prompt -->
          <div class="mt-4 pt-3 border-t border-quran-border/40 flex justify-center">
            <button id="btn-replay-snatch-audio" class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-quran-card hover:bg-quran-border text-xs text-quran-gold transition-all active:scale-95 shadow-sm">
              <span>🔊</span>
              <span>${t('replayAudio')}</span>
            </button>
          </div>
        </div>

        <!-- Feedback & 3 Choice Buttons -->
        ${
          isCorrect !== null
            ? `
          <div class="glass-card rounded-2xl p-4 border ${
            isCorrect ? 'border-emerald-500/50 bg-emerald-950/30' : 'border-red-500/50 bg-red-950/30'
          } text-center flex flex-col items-center gap-3">
            <div class="text-sm sm:text-base font-bold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}">
              ${isCorrect ? t('audioSnatchCorrect') : `${t('audioSnatchWrong')} « ${correctWord} »`}
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-retry-snatch" class="px-4 py-2 rounded-xl bg-quran-card hover:bg-quran-border text-xs sm:text-sm text-slate-200 transition-all">
                ${t('tryAgain')}
              </button>
              <button id="btn-next-snatch" class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95">
                ${t('nextAyahButton')} ➔
              </button>
            </div>
          </div>
        `
            : `
          <!-- 3 Options -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3" dir="rtl">
            ${options
              .map((opt) => {
                return `
                <button
                  type="button"
                  data-snatch-text="${opt.text}"
                  ${!isWaitingAnswer ? 'disabled' : ''}
                  class="btn-snatch-option p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#18342e] to-[#10231f] hover:from-[#21473e] hover:to-[#16302b] border border-quran-border hover:border-quran-gold shadow-md hover:shadow-glow-gold transition-all active:scale-95 flex flex-col items-center justify-center min-h-[72px] sm:min-h-[85px]"
                >
                  <span class="font-quran text-xl sm:text-2xl text-amber-100 leading-snug">${opt.text}</span>
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
    const replayBtn = this.container.querySelector('#btn-replay-snatch-audio');
    if (replayBtn) {
      const ayah = store.getCurrentAyah();
      replayBtn.addEventListener('click', () => {
        if (ayah) audioService.play(ayah.audioUrl);
      });
    }

    const nextBtn = this.container.querySelector('#btn-next-snatch');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        store.nextAyah();
      });
    }

    const retryBtn = this.container.querySelector('#btn-retry-snatch');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        store.setupAudioSnatchForCurrentAyah();
      });
    }

    const optButtons = this.container.querySelectorAll<HTMLButtonElement>('.btn-snatch-option');
    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.snatchText;
        if (text) {
          store.selectAudioSnatchOption(text);
        }
      });
    });
  }
}
