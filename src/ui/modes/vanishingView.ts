import { store } from '../../core/store';
import { audioService } from '../../services/audio';
import { t } from '../../i18n';

export class VanishingView {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const ayah = store.getCurrentAyah();
    const state = store.vanishingState;

    if (!ayah || !state) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Vanishing Mode...</div>`;
      return;
    }

    const { stage, hiddenIndices, solvedIndices, options, currentMissingTargetIdx, mistakeWordIdx, isStageComplete } = state;
    const settings = store.settings;

    const fontSizeClass =
      settings.arabicFontSize === 'xlarge'
        ? 'text-2xl sm:text-3xl md:text-4xl'
        : settings.arabicFontSize === 'large'
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-lg sm:text-xl md:text-2xl';

    const stageTitles = [
      '',
      t('vanishingStage1'),
      t('vanishingStage2'),
      t('vanishingStage3'),
      t('vanishingStage4')
    ];

    const currentTranslation = store.getCurrentAyahTranslation();

    let stageInstruction = '';
    if (stage === 1) {
      stageInstruction = t('vanishingInstruction1');
    } else if (stage === 2 || stage === 3) {
      stageInstruction = t('vanishingInstruction2');
    } else {
      stageInstruction = t('vanishingInstruction4');
    }

    // Render verse tokens
    const wordsHtml = ayah.words
      .map((word, idx) => {
        const isHidden = hiddenIndices.includes(idx);
        const isSolved = solvedIndices.includes(idx);
        const isCurrentTarget = idx === currentMissingTargetIdx;

        if (!isHidden || (stage === 4 && isStageComplete) || isSolved) {
          // Word is visible
          return `
            <span class="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg ${
              isSolved ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40' : 'text-amber-100'
            } transition-all">
              ${word.text}
            </span>
          `;
        }

        // Word is hidden / blank slot
        return `
          <span class="inline-block min-w-[50px] sm:min-w-[65px] px-2 py-0.5 sm:py-1 text-center rounded-lg border-2 ${
            isCurrentTarget
              ? 'border-quran-gold bg-quran-gold/20 text-quran-gold animate-pulse font-bold'
              : 'border-dashed border-slate-600 bg-black/40 text-slate-500'
          } text-xs sm:text-sm select-none transition-all">
            ${isCurrentTarget ? '• • •' : '...'}
          </span>
        `;
      })
      .join(' ');

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4 md:gap-5 animate-fadeIn">
        
        <!-- Mode Header & Stage Progress -->
        <div class="glass-panel rounded-2xl p-3 sm:p-4 border border-quran-gold/40 shadow-glow-gold">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-quran-border/50 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl sm:text-2xl">🌫️</span>
              <div>
                <div class="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <span>${t('modeVanishingTitle')}</span>
                  <span class="text-xs text-quran-gold font-normal">(${t('ayahOf', { current: ayah.number, total: store.currentSurah?.versesCount || 30 })})</span>
                </div>
                <div class="text-[11px] text-quran-textMuted">${stageTitles[stage]}</div>
              </div>
            </div>

            <!-- 4 Stage Progress Dots -->
            <div class="flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full border border-quran-border/40">
              ${[1, 2, 3, 4]
                .map((s) => `
                  <div class="w-2.5 h-2.5 rounded-full transition-all ${
                    s === stage
                      ? 'bg-quran-gold scale-125 shadow-glow-gold'
                      : s < stage
                      ? 'bg-emerald-400'
                      : 'bg-slate-700'
                  }" title="Stage ${s}"></div>
                `)
                .join('')}
            </div>
          </div>

          <!-- Instruction caption -->
          <div class="mt-2 text-xs sm:text-sm text-slate-300 leading-snug">
            ${stageInstruction}
          </div>
        </div>

        <!-- Verse Reading & Cloze Board -->
        <div class="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 border border-quran-border/70 relative">
          <div class="text-center my-3 sm:my-6">
            <p class="font-quran ${fontSizeClass} leading-loose tracking-wide flex flex-wrap items-center justify-center gap-1 sm:gap-1.5" dir="rtl">
              ${wordsHtml}
              <span class="text-quran-gold select-none inline-block font-sans text-xl align-middle mx-1">۝${ayah.number}</span>
            </p>
          </div>

          ${
            settings.showTranslation && currentTranslation
              ? `
            <div class="mt-3 pt-3 border-t border-quran-border/40 text-center">
              <p class="text-xs sm:text-sm text-slate-300 italic font-light max-w-2xl mx-auto">
                "${currentTranslation}"
              </p>
            </div>
          `
              : ''
          }

          <!-- Audio button in Stage 1 -->
          ${
            stage === 1
              ? `
            <div class="mt-4 pt-3 border-t border-quran-border/40 flex justify-center">
              <button id="btn-vanishing-audio" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-quran-card hover:bg-quran-border text-xs sm:text-sm text-quran-gold transition-all active:scale-95 shadow-sm">
                <span>🔊</span>
                <span>${t('listenRecitation')}</span>
              </button>
            </div>
          `
              : ''
          }
        </div>

        <!-- Action / Options Area -->
        ${
          stage === 1
            ? `
          <div class="flex justify-center">
            <button id="btn-advance-stage" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
              <span>${t('vanishingStartStage')}</span>
            </button>
          </div>
        `
            : stage === 4
            ? `
          <div class="flex flex-col items-center gap-3">
            ${
              isStageComplete
                ? `
              <div class="text-xs sm:text-sm text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-500/50 px-4 py-2 rounded-xl text-center">
                ${t('vanishingComplete')}
              </div>
              <button id="btn-advance-stage" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                <span>${t('nextAyahButton')} ➔</span>
              </button>
            `
                : `
              <button id="btn-reveal-vanishing" class="px-6 py-3 rounded-xl bg-quran-gold hover:bg-quran-goldLight text-black font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                <span>👁️ ${t('revealAyah')}</span>
              </button>
            `
            }
          </div>
        `
            : `
          <!-- Option Tray for Stage 2 & 3 -->
          <div class="glass-card rounded-2xl p-3 sm:p-4 border border-quran-border/60">
            ${
              isStageComplete
                ? `
              <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div class="text-xs sm:text-sm text-emerald-300 font-semibold flex items-center gap-2">
                  <span>✓</span>
                  <span>MashaAllah! Tahap ${stage} selesai!</span>
                </div>
                <button id="btn-advance-stage" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2">
                  <span>${t('vanishingNextStage')}</span>
                </button>
              </div>
            `
                : `
              <div class="text-[11px] sm:text-xs text-quran-textMuted mb-2 text-center">
                Pilih kata yang hilang untuk mengisi kotak yang aktif:
              </div>
              <div class="flex flex-wrap items-center justify-center gap-2" dir="rtl">
                ${options
                  .map((opt) => {
                    const isMistake = mistakeWordIdx === opt.wordIdx;
                    const isAlreadySolved = solvedIndices.includes(opt.wordIdx);

                    if (isAlreadySolved) return '';

                    return `
                    <button
                      type="button"
                      data-word-idx="${opt.wordIdx}"
                      class="btn-vanishing-opt px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-center transition-all select-none active:scale-95 ${
                        isMistake
                          ? 'border-red-500 bg-red-950/80 text-red-200 animate-shake'
                          : 'border-quran-border hover:border-quran-gold bg-[#142e27] hover:bg-[#1a3d34] text-slate-100 shadow-md'
                      }"
                    >
                      <div class="font-quran text-lg sm:text-xl text-amber-100">${opt.text}</div>
                      ${
                        settings.showTranslation && opt.gloss
                          ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${opt.gloss}</div>`
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
        `
        }

      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const btnAdvance = this.container.querySelector('#btn-advance-stage');
    if (btnAdvance) {
      btnAdvance.addEventListener('click', () => {
        store.advanceVanishingStage();
      });
    }

    const btnReveal = this.container.querySelector('#btn-reveal-vanishing');
    if (btnReveal) {
      btnReveal.addEventListener('click', () => {
        store.revealVanishingAyah();
      });
    }

    const btnAudio = this.container.querySelector('#btn-vanishing-audio');
    if (btnAudio) {
      const ayah = store.getCurrentAyah();
      btnAudio.addEventListener('click', () => {
        if (ayah) audioService.toggle(ayah.audioUrl);
      });
    }

    const optButtons = this.container.querySelectorAll<HTMLButtonElement>('.btn-vanishing-opt');
    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const wordIdx = parseInt(btn.dataset.wordIdx || '-1', 10);
        if (wordIdx >= 0) {
          store.selectVanishingOption(wordIdx);
        }
      });
    });
  }
}
