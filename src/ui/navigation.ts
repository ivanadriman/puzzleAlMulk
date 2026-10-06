import { store } from '../core/store';

export class NavigationComponent {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render() {
    const { currentSurah, currentAyahIndex, progress } = store;
    if (!currentSurah) {
      this.container.innerHTML = '';
      return;
    }

    const totalAyahs = currentSurah.versesCount;
    const isFirst = currentAyahIndex === 0;
    const isLast = currentAyahIndex === totalAyahs - 1;

    // Calculate overall surah progress
    let solvedCount = 0;
    currentSurah.ayahs.forEach((a) => {
      const key = `${currentSurah.id}:${a.number}`;
      if (progress[key]?.solved) solvedCount++;
    });
    const percentSolved = Math.round((solvedCount / totalAyahs) * 100);

    const html = `
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-3">
        <!-- Navigation Bar -->
        <div class="glass-card rounded-2xl p-2.5 md:p-3.5 flex items-center justify-between gap-2 border border-quran-border/60 shadow-md">
          
          <!-- Prev Button -->
          <button
            id="btn-prev-ayah"
            ${isFirst ? 'disabled' : ''}
            class="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              isFirst
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-quran-card hover:bg-quran-border text-slate-200 hover:text-quran-gold active:scale-95'
            }"
            title="Previous Ayah (Left Arrow)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            <span class="hidden sm:inline">Prev</span>
          </button>

          <!-- Ayah Dropdown Selector -->
          <div class="flex-1 max-w-md mx-auto relative flex items-center justify-center">
            <select
              id="select-ayah-dropdown"
              class="w-full bg-quran-bg/90 hover:bg-quran-bg text-slate-100 border border-quran-gold/40 hover:border-quran-gold focus:border-quran-gold focus:ring-1 focus:ring-quran-gold text-xs md:text-sm rounded-xl px-3 py-2 cursor-pointer font-medium appearance-none text-center transition-colors shadow-inner"
            >
              ${currentSurah.ayahs
                .map((a, idx) => {
                  const key = `${currentSurah.id}:${a.number}`;
                  const prog = progress[key];
                  let statusBadge = '';
                  if (prog?.solved) statusBadge = '✓ Solved';
                  else if (prog?.revealed) statusBadge = '👁 Revealed';

                  // Truncate start of ayah for dropdown
                  const snippet = a.words.slice(0, 3).map((w) => w.text).join(' ');

                  return `
                  <option value="${idx}" ${idx === currentAyahIndex ? 'selected' : ''}>
                    Ayah ${a.number} of ${totalAyahs} — ${snippet}... ${statusBadge ? `[${statusBadge}]` : ''}
                  </option>
                `;
                })
                .join('')}
            </select>
            <div class="absolute right-3 pointer-events-none text-quran-gold">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <!-- Next Button -->
          <button
            id="btn-next-ayah"
            ${isLast ? 'disabled' : ''}
            class="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              isLast
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'bg-quran-card hover:bg-quran-border text-slate-200 hover:text-quran-gold active:scale-95'
            }"
            title="Next Ayah (Right Arrow)"
          >
            <span class="hidden sm:inline">Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <!-- Surah Progress Tracker Bar -->
        <div class="flex items-center justify-between text-[11px] text-quran-textMuted px-1">
          <div class="flex items-center gap-1.5">
            <span>Progress:</span>
            <span class="font-semibold text-emerald-400">${solvedCount}/${totalAyahs} Ayahs</span>
            <span>(${percentSolved}%)</span>
          </div>
          <div class="w-32 md:w-48 bg-quran-card h-1.5 rounded-full overflow-hidden border border-quran-border/50">
            <div class="bg-gradient-to-r from-emerald-500 to-quran-gold h-full rounded-full transition-all duration-500" style="width: ${percentSolved}%"></div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const btnPrev = this.container.querySelector('#btn-prev-ayah');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => store.prevAyah());
    }

    const btnNext = this.container.querySelector('#btn-next-ayah');
    if (btnNext) {
      btnNext.addEventListener('click', () => store.nextAyah());
    }

    const select = this.container.querySelector('#select-ayah-dropdown') as HTMLSelectElement | null;
    if (select) {
      select.addEventListener('change', () => {
        const idx = parseInt(select.value, 10);
        store.setAyahIndex(idx);
      });
    }
  }
}
