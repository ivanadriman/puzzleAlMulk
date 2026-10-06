import { store } from '../core/store';
import { audioService } from '../services/audio';
import { triggerConfetti } from './celebration';
import { DragController } from './dragController';

export class BoardComponent {
  private container: HTMLElement;
  private dragController: DragController | null = null;
  private hasTriggeredConfetti: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const ayah = store.getCurrentAyah();
    if (!ayah) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Ayah...</div>`;
      return;
    }

    if (!this.dragController) {
      this.dragController = new DragController(this.container);
    }

    const { status, slots, availablePieces, settings, checkStatus, shakeError } = store;
    const isCompleted = status === 'solved' || status === 'revealed';

    // Trigger celebration once on solve
    if (status === 'solved' && !this.hasTriggeredConfetti) {
      triggerConfetti();
      this.hasTriggeredConfetti = true;
    } else if (status === 'solving') {
      this.hasTriggeredConfetti = false;
    }

    // Font size classes
    const fontSizeClass =
      settings.arabicFontSize === 'xlarge'
        ? 'text-3xl md:text-4xl'
        : settings.arabicFontSize === 'large'
        ? 'text-2xl md:text-3xl'
        : 'text-xl md:text-2xl';

    let html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-6">
    `;

    if (isCompleted) {
      // Completed / Revealed View
      html += `
        <div class="glass-panel rounded-2xl p-6 md:p-8 border border-quran-gold/40 shadow-glow-gold relative overflow-hidden transition-all duration-500">
          <!-- Background decoration -->
          <div class="absolute -top-12 -right-12 w-40 h-40 bg-quran-gold/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-quran-emerald/15 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Status Header Badge -->
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-quran-border/60">
            <div class="flex items-center gap-2">
              ${
                status === 'solved'
                  ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                      Masha'Allah! Correct Combination ✓
                    </span>`
                  : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      Ayah Revealed
                    </span>`
              }
              <span class="text-xs text-quran-textMuted">Ayah ${ayah.number} of ${store.currentSurah?.versesCount || 30}</span>
            </div>

            <button id="btn-replay-audio" class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-quran-card hover:bg-quran-border text-xs text-quran-gold transition-colors" title="Listen again">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
              Replay Audio
            </button>
          </div>

          <!-- Complete Arabic Text (RTL) -->
          <div class="my-6 text-center">
            <p class="font-quran ${fontSizeClass} text-amber-100 leading-loose selection:bg-quran-gold/40 tracking-wide" dir="rtl">
              ${ayah.textUthmani} <span class="text-quran-gold select-none inline-block font-sans text-xl md:text-2xl align-middle mx-1">۝${ayah.number}</span>
            </p>
          </div>

          <!-- Translation -->
          ${
            settings.showTranslation
              ? `
              <div class="mt-4 pt-4 border-t border-quran-border/40 text-center">
                <p class="text-sm md:text-base text-slate-300 leading-relaxed font-light italic max-w-2xl mx-auto">
                  "${ayah.translation}"
                </p>
              </div>
            `
              : ''
          }

          <!-- Audio Player Bar -->
          <div class="mt-6 pt-4 border-t border-quran-border/40 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <button id="btn-toggle-audio-solved" class="w-10 h-10 rounded-full bg-quran-gold text-black flex items-center justify-center hover:bg-quran-goldLight transition-transform active:scale-95 shadow-md">
                <svg id="icon-audio-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div class="flex flex-col">
                <span class="text-xs font-medium text-slate-200">Reciter: Mishary Alafasy</span>
                <span class="text-[11px] text-quran-textMuted">Recitation playing</span>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-2">
              <select id="select-audio-speed" class="bg-quran-card border border-quran-border text-xs rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none">
                <option value="0.75" ${settings.playbackSpeed === 0.75 ? 'selected' : ''}>0.75x</option>
                <option value="1.0" ${settings.playbackSpeed === 1.0 ? 'selected' : ''}>1.0x Normal</option>
                <option value="1.25" ${settings.playbackSpeed === 1.25 ? 'selected' : ''}>1.25x</option>
              </select>

              <button id="btn-next-ayah-prompt" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95">
                <span>Next Ayah</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // Interactive Puzzle Game Mode with Discrete Quranic RTL Slots
      const arabicNumerals = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥'];
      const totalSlots = slots.length;
      const filledSlotsCount = slots.filter((s) => s !== null).length;

      // Diagnostic message if checked
      let diagnosisBanner = '';
      if (checkStatus && !checkStatus.isAllCorrect) {
        diagnosisBanner = `
          <div class="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/70 text-red-200 shadow-md flex items-start gap-3">
            <span class="text-lg">❌</span>
            <div class="flex-1">
              <div class="font-bold text-xs md:text-sm text-red-100 flex items-center gap-2">
                <span>Combination is Incorrect</span>
                <span class="text-[11px] font-normal px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-200">
                  ${checkStatus.wrongCount} part(s) in wrong position
                </span>
              </div>
              <p class="text-[11px] md:text-xs text-red-300 mt-1">
                The parts highlighted in <span class="font-bold text-red-200">RED</span> are in the wrong positions. Drag or swap them into their correct spots!
              </p>
            </div>
          </div>
        `;
      }

      html += `
        <!-- Target Sentence Slot Bar (Quranic RTL) -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 border ${
          shakeError ? 'border-red-500 animate-shake shadow-lg shadow-red-500/20' : 'border-quran-border/80'
        } transition-all">
          
          ${diagnosisBanner}

          <div class="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-quran-textMuted border-b border-quran-border/40 pb-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-quran-gold animate-pulse"></span>
              <span class="font-medium text-slate-200">Ayah Sentence:</span>
              <span class="text-[11px] text-quran-gold flex items-center gap-1 font-arabic" dir="rtl">
                بداية الآية ◀ قراءة من اليمين إلى اليسار
              </span>
            </div>
            <div class="text-right flex items-center gap-2">
              <span class="text-slate-300 font-medium">${filledSlotsCount} / ${totalSlots} assembled</span>
              ${
                filledSlotsCount === totalSlots
                  ? `<button id="btn-recheck" class="px-2 py-0.5 rounded bg-quran-gold text-black font-semibold text-[11px] hover:bg-quran-goldLight active:scale-95 transition-all">Check Now</button>`
                  : ''
              }
            </div>
          </div>

          <!-- Slots Container (RTL Quranic Order: Slot 0 on Far Right, Slot N on Far Left) -->
          <div
            id="slots-container"
            dir="rtl"
            class="min-h-[110px] p-3 md:p-4 rounded-xl bg-quran-bg/80 border-2 border-dashed border-quran-border/60 flex flex-wrap items-center justify-start gap-3 transition-colors"
          >
            <!-- Decorative Ayah Start Indicator on Far Right -->
            <div class="select-none flex items-center px-2 py-1 rounded-lg bg-quran-card/60 border border-quran-border/40 text-[11px] text-quran-gold font-medium">
              <span>بداية ◀</span>
            </div>

            ${slots
              .map((piece, slotIdx) => {
                const numeral = arabicNumerals[slotIdx] || `${slotIdx + 1}`;
                const isWrong = checkStatus && checkStatus.wrongIndices.includes(slotIdx);
                const isCorrect = checkStatus && checkStatus.hasChecked && !isWrong && piece !== null;

                if (piece === null) {
                  // Empty Slot
                  return `
                    <div
                      data-slot-index="${slotIdx}"
                      class="puzzle-slot min-w-[70px] md:min-w-[90px] h-[72px] md:h-[84px] p-2 rounded-xl border-2 border-dashed border-slate-700/80 bg-black/30 hover:border-quran-gold/60 flex flex-col items-center justify-center transition-all cursor-pointer relative group"
                      title="Slot ${slotIdx + 1} (Drop or tap piece to place here)"
                    >
                      <span class="text-slate-600 group-hover:text-quran-gold text-xs font-semibold select-none">${numeral}</span>
                      <span class="text-[10px] text-slate-600 group-hover:text-slate-400 select-none mt-1">Empty</span>
                    </div>
                  `;
                }

                // Filled Slot
                return `
                  <div
                    data-slot-index="${slotIdx}"
                    class="puzzle-slot relative p-0.5 rounded-xl transition-all"
                  >
                    <!-- Slotted Piece Element -->
                    <div
                      data-piece-id="${piece.id}"
                      data-slot-index="${slotIdx}"
                      class="slotted-piece-item cursor-grab active:cursor-grabbing px-3.5 py-2 rounded-xl text-center flex flex-col items-center justify-center transition-all select-none shadow-md ${
                        isWrong
                          ? 'border-2 border-red-500 bg-red-950/60 shadow-lg shadow-red-500/30'
                          : isCorrect
                          ? 'border-2 border-emerald-500 bg-emerald-950/50 shadow-lg shadow-emerald-500/20'
                          : 'border border-quran-gold/60 bg-gradient-to-b from-quran-card to-[#122521] hover:border-quran-gold hover:shadow-glow-gold'
                      }"
                      title="Drag to swap/move, or tap to remove"
                    >
                      <!-- Status Pill Badge -->
                      <div class="w-full flex items-center justify-between gap-1 mb-0.5">
                        <span class="text-[10px] font-mono text-slate-400 font-semibold">${numeral}</span>
                        ${
                          isWrong
                            ? `<span class="px-1 py-0.2 rounded text-[9px] font-bold bg-red-500 text-white">✗ Wrong Position</span>`
                            : isCorrect
                            ? `<span class="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-black">✓ Correct</span>`
                            : ''
                        }
                      </div>

                      <span class="font-quran ${fontSizeClass} ${
                        isWrong ? 'text-red-100' : isCorrect ? 'text-emerald-100' : 'text-amber-100'
                      } leading-relaxed">${piece.text}</span>
                      
                      ${
                        settings.showTranslation && piece.translation
                          ? `<span class="text-[11px] text-slate-400 mt-0.5 font-light">${piece.translation}</span>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}

            <!-- Decorative Ayah End Indicator on Far Left -->
            <div class="select-none flex items-center px-2 py-1 rounded-lg bg-quran-card/60 border border-quran-border/40 text-xs text-quran-gold font-bold">
              <span>۝${ayah.number}</span>
            </div>
          </div>
        </div>

        <!-- Available Pieces Tray -->
        <div class="glass-card rounded-2xl p-5 md:p-6 border border-quran-border/60">
          <div class="flex items-center justify-between mb-3 text-xs text-quran-textMuted">
            <span class="font-medium text-slate-300">Available Parts Tray (Drag into slots or Tap):</span>
            <span class="text-[11px] text-quran-gold">${settings.difficulty === 'word' ? 'Word by Word' : 'Phrase Chunks'}</span>
          </div>

          <!-- Tray Container (RTL) -->
          <div
            id="tray-container"
            dir="rtl"
            class="min-h-[110px] p-3 md:p-4 rounded-xl bg-black/20 flex flex-wrap items-center justify-center gap-3 transition-colors"
          >
            ${
              availablePieces.length === 0
                ? `<div class="text-xs text-slate-400 py-3 font-medium">All parts are placed in the slots above!</div>`
                : availablePieces
                    .map(
                      (piece) => `
                  <div
                    data-piece-id="${piece.id}"
                    class="tray-piece-item cursor-grab active:cursor-grabbing bg-gradient-to-b from-[#1b3832] to-[#122521] hover:from-[#21443d] hover:to-[#172f2a] border border-quran-border hover:border-quran-gold rounded-xl px-4 py-2.5 text-center transition-all shadow-md hover:-translate-y-0.5 active:scale-95 hover:shadow-glow-gold flex flex-col items-center select-none"
                    title="Drag to a slot or tap to place"
                  >
                    <span class="font-quran ${fontSizeClass} text-slate-100 leading-relaxed">${piece.text}</span>
                    ${
                      settings.showTranslation && piece.translation
                        ? `<span class="text-[11px] text-slate-400 mt-0.5 font-light">${piece.translation}</span>`
                        : ''
                    }
                  </div>
                `
                    )
                    .join('')
            }
          </div>
        </div>
      `;
    }

    html += `</div>`;
    this.container.innerHTML = html;

    this.attachEvents();
  }

  private attachEvents() {
    if (store.status !== 'solving') {
      // Completed mode events
      const btnReplay = this.container.querySelector('#btn-replay-audio');
      if (btnReplay) {
        btnReplay.addEventListener('click', () => audioService.replay());
      }

      const btnToggleAudio = this.container.querySelector('#btn-toggle-audio-solved');
      if (btnToggleAudio) {
        const ayah = store.getCurrentAyah();
        btnToggleAudio.addEventListener('click', () => {
          if (ayah) audioService.toggle(ayah.audioUrl);
        });
      }

      const speedSelect = this.container.querySelector('#select-audio-speed') as HTMLSelectElement | null;
      if (speedSelect) {
        speedSelect.addEventListener('change', () => {
          const rate = parseFloat(speedSelect.value);
          store.updateSettings({ playbackSpeed: rate });
        });
      }

      const btnNext = this.container.querySelector('#btn-next-ayah-prompt');
      if (btnNext) {
        btnNext.addEventListener('click', () => store.nextAyah());
      }
      return;
    }

    // Manual Recheck button
    const btnRecheck = this.container.querySelector('#btn-recheck');
    if (btnRecheck) {
      btnRecheck.addEventListener('click', () => store.checkCombination());
    }

    // Bind Tray pieces to DragController
    if (this.dragController) {
      this.container.querySelectorAll('.tray-piece-item').forEach((el) => {
        const pieceId = el.getAttribute('data-piece-id');
        if (pieceId) {
          this.dragController?.bindItem(el as HTMLElement, pieceId, 'tray');
        }
      });

      // Bind Slotted pieces to DragController
      this.container.querySelectorAll('.slotted-piece-item').forEach((el) => {
        const pieceId = el.getAttribute('data-piece-id');
        const slotIdx = parseInt(el.getAttribute('data-slot-index') || '-1', 10);
        if (pieceId && slotIdx >= 0) {
          this.dragController?.bindItem(el as HTMLElement, pieceId, 'slot', slotIdx);
        }
      });
    }
  }
}
