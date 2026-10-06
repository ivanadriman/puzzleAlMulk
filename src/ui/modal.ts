import { store } from '../core/store';

export class SettingsModalComponent {
  private container: HTMLElement;
  private isOpen: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public open() {
    this.isOpen = true;
    this.render();
  }

  public close() {
    this.isOpen = false;
    this.render();
  }

  public render() {
    if (!this.isOpen) {
      this.container.innerHTML = '';
      return;
    }

    const { settings } = store;

    const html = `
      <div id="modal-backdrop" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="glass-panel w-full max-w-lg rounded-2xl p-6 border border-quran-gold/40 shadow-glow-gold flex flex-col gap-5 text-slate-200">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-quran-border/60">
            <h2 class="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>⚙️</span> Settings & Shortcuts
            </h2>
            <button id="btn-close-modal" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-quran-border transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Options -->
          <div class="flex flex-col gap-4 text-xs md:text-sm">
            
            <!-- Show Translation -->
            <label class="flex items-center justify-between cursor-pointer py-1">
              <span>Show English translation on puzzle pieces</span>
              <input type="checkbox" id="chk-show-translation" ${settings.showTranslation ? 'checked' : ''} class="w-4 h-4 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Show Transliteration -->
            <label class="flex items-center justify-between cursor-pointer py-1">
              <span>Show English transliteration on puzzle pieces</span>
              <input type="checkbox" id="chk-show-translit" ${settings.showTransliteration ? 'checked' : ''} class="w-4 h-4 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Autoplay Audio -->
            <label class="flex items-center justify-between cursor-pointer py-1">
              <span>Auto-play recitation when ayah is solved</span>
              <input type="checkbox" id="chk-auto-audio" ${settings.autoPlayAudio ? 'checked' : ''} class="w-4 h-4 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Font Size -->
            <div class="flex items-center justify-between py-1">
              <span>Arabic Script Font Size</span>
              <select id="sel-font-size" class="bg-quran-card border border-quran-border rounded-lg px-2.5 py-1 text-xs text-slate-200">
                <option value="normal" ${settings.arabicFontSize === 'normal' ? 'selected' : ''}>Medium</option>
                <option value="large" ${settings.arabicFontSize === 'large' ? 'selected' : ''}>Large (Default)</option>
                <option value="xlarge" ${settings.arabicFontSize === 'xlarge' ? 'selected' : ''}>Extra Large</option>
              </select>
            </div>

            <!-- Reciter Information -->
            <div class="p-3 rounded-xl bg-quran-bg/60 border border-quran-border/60 text-xs">
              <div class="font-semibold text-quran-gold mb-1">Reciter Audio:</div>
              <p class="text-slate-400">Mishary Rashid Alafasy (EveryAyah CDN). Per-ayah MP3 streaming with automatic offline browser caching.</p>
            </div>

            <!-- Keyboard Shortcuts -->
            <div class="p-3 rounded-xl bg-quran-bg/60 border border-quran-border/60 text-xs">
              <div class="font-semibold text-slate-300 mb-2">Keyboard Shortcuts:</div>
              <div class="grid grid-cols-2 gap-2 text-slate-400">
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">◀</kbd> Prev Ayah</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">▶</kbd> Next Ayah</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">Space</kbd> Play / Pause Recite</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">H</kbd> Hint</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">R</kbd> Reveal Ayah</div>
              </div>
            </div>

            <!-- Reset Progress -->
            <div class="pt-2 border-t border-quran-border/40 flex justify-between items-center">
              <button id="btn-reset-progress" class="text-xs text-red-400 hover:text-red-300 hover:underline">
                Reset My Learning Progress
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const backdrop = this.container.querySelector('#modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }

    const btnClose = this.container.querySelector('#btn-close-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    const chkTrans = this.container.querySelector('#chk-show-translation') as HTMLInputElement | null;
    if (chkTrans) {
      chkTrans.addEventListener('change', () => {
        store.updateSettings({ showTranslation: chkTrans.checked });
      });
    }

    const chkTranslit = this.container.querySelector('#chk-show-translit') as HTMLInputElement | null;
    if (chkTranslit) {
      chkTranslit.addEventListener('change', () => {
        store.updateSettings({ showTransliteration: chkTranslit.checked });
      });
    }

    const chkAudio = this.container.querySelector('#chk-auto-audio') as HTMLInputElement | null;
    if (chkAudio) {
      chkAudio.addEventListener('change', () => {
        store.updateSettings({ autoPlayAudio: chkAudio.checked });
      });
    }

    const selFont = this.container.querySelector('#sel-font-size') as HTMLSelectElement | null;
    if (selFont) {
      selFont.addEventListener('change', () => {
        store.updateSettings({ arabicFontSize: selFont.value as any });
      });
    }

    const btnResetProg = this.container.querySelector('#btn-reset-progress');
    if (btnResetProg) {
      btnResetProg.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all saved stars and progress for this surah?')) {
          store.progress = {};
          store.saveProgress();
          this.close();
        }
      });
    }
  }
}
