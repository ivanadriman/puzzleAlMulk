import { store } from '../core/store';
import { audioService } from '../services/audio';
import { t } from '../i18n';

export class ActionsComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const isSolving = store.status === 'solving';
    const isPlaying = audioService.isPlaying();

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 md:gap-3 py-2">
        
        ${
          isSolving
            ? `
          <!-- Check Ayah Button -->
          <button
            id="btn-check-ayah"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald transition-all active:scale-95"
            title="${t('checkShortcut')}"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>${t('checkCombination')}</span>
          </button>
        `
            : ''
        }

        <!-- Recite / Listen Button -->
        <button
          id="btn-recite-ayah"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold ${
            isPlaying
              ? 'bg-quran-gold text-black shadow-glow-gold'
              : 'bg-quran-card hover:bg-quran-border text-slate-200 border border-quran-border/80'
          } transition-all active:scale-95 shadow-sm"
          title="${t('playPauseShortcut')}"
        >
          <svg class="w-4 h-4 text-quran-gold ${isPlaying ? 'text-black' : ''}" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>${isPlaying ? t('playing') : t('recite')}</span>
        </button>

        ${
          isSolving
            ? `
          <!-- Hint Button -->
          <button
            id="btn-hint-ayah"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-quran-card hover:bg-quran-border text-amber-300 border border-amber-500/30 transition-all active:scale-95 shadow-sm"
            title="${t('hintShortcut')}"
          >
            <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            <span>${t('hint')}</span>
          </button>

          <!-- Reveal Button -->
          <button
            id="btn-reveal-ayah"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/40 hover:to-yellow-600/40 text-amber-200 border border-quran-gold/40 transition-all active:scale-95 shadow-sm hover:shadow-glow-gold"
            title="${t('revealShortcut')}"
          >
            <svg class="w-4 h-4 text-quran-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span>${t('revealAyah')}</span>
          </button>

          <!-- Reset Button -->
          <button
            id="btn-reset-ayah"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-quran-card hover:bg-quran-border text-slate-300 border border-quran-border/80 transition-all active:scale-95 shadow-sm"
            title="${t('reset')}"
          >
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>${t('reset')}</span>
          </button>
        `
            : `
          <!-- Practice Again Button -->
          <button
            id="btn-retry-ayah"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-quran-card hover:bg-quran-border text-slate-200 border border-quran-border/80 transition-all active:scale-95 shadow-sm"
            title="${t('practiceAgain')}"
          >
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>${t('practiceAgain')}</span>
          </button>
        `
        }

      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const btnCheck = this.container.querySelector('#btn-check-ayah');
    if (btnCheck) {
      btnCheck.addEventListener('click', () => store.checkCombination());
    }

    const btnRecite = this.container.querySelector('#btn-recite-ayah');
    if (btnRecite) {
      const ayah = store.getCurrentAyah();
      btnRecite.addEventListener('click', () => {
        if (ayah) audioService.toggle(ayah.audioUrl);
      });
    }

    const btnHint = this.container.querySelector('#btn-hint-ayah');
    if (btnHint) {
      btnHint.addEventListener('click', () => store.useHint());
    }

    const btnReveal = this.container.querySelector('#btn-reveal-ayah');
    if (btnReveal) {
      btnReveal.addEventListener('click', () => store.revealAyah());
    }

    const btnReset = this.container.querySelector('#btn-reset-ayah');
    if (btnReset) {
      btnReset.addEventListener('click', () => store.resetCurrentAyah());
    }

    const btnRetry = this.container.querySelector('#btn-retry-ayah');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => store.resetCurrentAyah());
    }
  }
}
