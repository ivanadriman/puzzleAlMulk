import Sortable from 'sortablejs';
import { store } from '../core/store';
import { audioService } from '../services/audio';
import { triggerConfetti } from './celebration';

export class BoardComponent {
  private container: HTMLElement;
  private sortablePlaced: Sortable | null = null;
  private sortableTray: Sortable | null = null;
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

    const { status, placedPieces, availablePieces, settings, shakeError } = store;
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
                      Masha'Allah! Completed
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

          <!-- Complete Arabic Text -->
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
                <span class="text-[11px] text-quran-textMuted">Audio auto-playing</span>
              </div>
            </div>

            <!-- Audio Speed & Next Controls -->
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
      // Interactive Puzzle Game Mode
      const totalPiecesCount = placedPieces.length + availablePieces.length;

      html += `
        <!-- Target Sentence Slot Bar -->
        <div class="glass-panel rounded-2xl p-5 md:p-6 border ${
          shakeError ? 'border-red-500/80 animate-shake shadow-lg shadow-red-500/20' : 'border-quran-border/80'
        } transition-all">
          <div class="flex items-center justify-between mb-3 text-xs text-quran-textMuted">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-quran-gold animate-pulse"></span>
              <span class="font-medium text-slate-300">Assemble Ayah (Right to Left):</span>
            </div>
            <div class="text-right">
              <span>${placedPieces.length} / ${totalPiecesCount} pieces</span>
            </div>
          </div>

          <!-- Placed Pieces Container (RTL) -->
          <div
            id="placed-container"
            dir="rtl"
            class="min-h-[100px] p-3 md:p-4 rounded-xl bg-quran-bg/70 border-2 border-dashed border-quran-border/60 flex flex-wrap items-center gap-2.5 transition-colors ${
              placedPieces.length === 0 ? 'justify-center items-center' : ''
            }"
          >
            ${
              placedPieces.length === 0
                ? `<div class="text-quran-textMuted text-xs md:text-sm pointer-events-none text-center py-4 select-none">
                    Drag pieces here or tap them below in order
                  </div>`
                : placedPieces
                    .map(
                      (piece) => `
                  <div
                    data-id="${piece.id}"
                    class="placed-piece-item group cursor-pointer bg-gradient-to-b from-quran-card to-[#122521] border border-quran-gold/40 hover:border-red-400/80 rounded-xl px-3 py-2 text-center transition-all shadow-sm active:scale-95 hover:shadow-md flex flex-col items-center"
                    title="Tap to remove"
                  >
                    <span class="font-quran ${fontSizeClass} text-amber-100 select-none leading-relaxed">${piece.text}</span>
                    ${
                      settings.showTranslation && piece.translation
                        ? `<span class="text-[11px] text-slate-400 mt-0.5 select-none font-light tracking-wide">${piece.translation}</span>`
                        : ''
                    }
                  </div>
                `
                    )
                    .join('')
            }
          </div>

          ${
            shakeError
              ? `<div class="mt-2 text-xs text-red-400 text-center font-medium animate-pulse">
                  Order is incorrect. Drag to rearrange pieces or tap to remove!
                </div>`
              : ''
          }
        </div>

        <!-- Available Pieces Tray -->
        <div class="glass-card rounded-2xl p-5 md:p-6 border border-quran-border/60">
          <div class="flex items-center justify-between mb-3 text-xs text-quran-textMuted">
            <span class="font-medium text-slate-300">Available Pieces (Tap or Drag):</span>
            <span class="text-[11px] text-quran-gold">${settings.difficulty === 'word' ? 'Word by Word' : 'Phrase Chunks'}</span>
          </div>

          <!-- Tray Container (RTL) -->
          <div
            id="tray-container"
            dir="rtl"
            class="min-h-[110px] p-3 md:p-4 rounded-xl bg-black/20 flex flex-wrap items-center justify-center gap-3"
          >
            ${
              availablePieces.length === 0
                ? `<div class="text-xs text-slate-500 py-3">All pieces placed! Check your order above.</div>`
                : availablePieces
                    .map(
                      (piece) => `
                  <div
                    data-id="${piece.id}"
                    class="tray-piece-item cursor-pointer bg-gradient-to-b from-[#1b3832] to-[#122521] hover:from-[#21443d] hover:to-[#172f2a] border border-quran-border hover:border-quran-gold rounded-xl px-4 py-2.5 text-center transition-all shadow-md hover:-translate-y-0.5 active:scale-95 hover:shadow-glow-gold flex flex-col items-center select-none"
                    title="Tap to place"
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
    this.initSortable();
  }

  private attachEvents() {
    // Tap to remove placed piece
    this.container.querySelectorAll('.placed-piece-item').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (id) store.removePiece(id);
      });
    });

    // Tap to place available piece
    this.container.querySelectorAll('.tray-piece-item').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        if (id) store.placePiece(id);
      });
    });

    // Solved mode buttons
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
  }

  private initSortable() {
    // Only init sortable if in solving mode
    if (store.status !== 'solving') {
      if (this.sortablePlaced) this.sortablePlaced.destroy();
      if (this.sortableTray) this.sortableTray.destroy();
      return;
    }

    const placedEl = this.container.querySelector('#placed-container') as HTMLElement | null;
    const trayEl = this.container.querySelector('#tray-container') as HTMLElement | null;

    if (!placedEl || !trayEl) return;

    if (this.sortablePlaced) this.sortablePlaced.destroy();
    if (this.sortableTray) this.sortableTray.destroy();

    this.sortablePlaced = new Sortable(placedEl, {
      group: 'puzzle-pieces',
      animation: 150,
      direction: 'horizontal',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      filter: '.text-quran-textMuted',
      onEnd: () => {
        this.syncFromDOM();
      }
    });

    this.sortableTray = new Sortable(trayEl, {
      group: 'puzzle-pieces',
      animation: 150,
      direction: 'horizontal',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: () => {
        this.syncFromDOM();
      }
    });
  }

  private syncFromDOM() {
    const placedEl = this.container.querySelector('#placed-container');
    const trayEl = this.container.querySelector('#tray-container');
    if (!placedEl || !trayEl) return;

    const allMap = new Map();
    [...store.placedPieces, ...store.availablePieces].forEach((p) => allMap.set(p.id, p));

    const newPlaced: any[] = [];
    placedEl.querySelectorAll('.placed-piece-item, .tray-piece-item').forEach((el) => {
      const id = el.getAttribute('data-id');
      if (id && allMap.has(id)) newPlaced.push(allMap.get(id));
    });

    const newTray: any[] = [];
    trayEl.querySelectorAll('.tray-piece-item, .placed-piece-item').forEach((el) => {
      const id = el.getAttribute('data-id');
      if (id && allMap.has(id)) newTray.push(allMap.get(id));
    });

    store.updatePlacedPieces(newPlaced);
    store.updateAvailablePieces(newTray);
  }
}
