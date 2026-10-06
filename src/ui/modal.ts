import { store } from '../core/store';
import { t } from '../i18n';
import { AppLanguage, GameModeId } from '../types';

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
      <div id="modal-backdrop" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto max-h-[100dvh]">
        <div class="glass-panel w-full max-w-lg rounded-2xl p-4 sm:p-6 border border-quran-gold/40 shadow-glow-gold flex flex-col gap-4 sm:gap-5 text-slate-200 max-h-[92dvh] overflow-y-auto my-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-3 border-b border-quran-border/60">
            <h2 class="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>⚙️</span> ${t('settingsTitle')}
            </h2>
            <button id="btn-close-modal" class="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-quran-border transition-colors active:scale-95" title="Close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Options -->
          <div class="flex flex-col gap-3.5 text-xs md:text-sm">
            
            <!-- Game Mode Selector -->
            <div class="flex items-center justify-between py-1.5 border-b border-quran-border/40 pb-3 min-h-[44px]">
              <span class="font-medium text-slate-100">${t('modeSelectorTitle')}</span>
              <select id="sel-app-gamemode" class="bg-quran-card border border-quran-gold/50 rounded-lg px-2.5 py-2 text-xs text-slate-100 font-semibold focus:outline-none min-h-[40px]">
                <option value="puzzle" ${settings.activeGameMode === 'puzzle' ? 'selected' : ''}>🧩 ${t('modePuzzleTitle')}</option>
                <option value="vanishing" ${settings.activeGameMode === 'vanishing' ? 'selected' : ''}>🌫️ ${t('modeVanishingTitle')}</option>
                <option value="audio_snatch" ${settings.activeGameMode === 'audio_snatch' ? 'selected' : ''}>🎧 ${t('modeAudioSnatchTitle')}</option>
                <option value="bridge" ${settings.activeGameMode === 'bridge' ? 'selected' : ''}>🌉 ${t('modeBridgeTitle')}</option>
                <option value="sprint" ${settings.activeGameMode === 'sprint' ? 'selected' : ''}>⚡ ${t('modeSprintTitle')}</option>
              </select>
            </div>

            <!-- Language Selector -->
            <div class="flex items-center justify-between py-1.5 border-b border-quran-border/40 pb-3 min-h-[44px]">
              <span class="font-medium text-slate-100">${t('languageLabel')}</span>
              <select id="sel-app-language" class="bg-quran-card border border-quran-gold/50 rounded-lg px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none min-h-[40px]">
                <option value="en" ${settings.language === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                <option value="id" ${settings.language === 'id' ? 'selected' : ''}>🇮🇩 Bahasa Indonesia</option>
                <option value="de" disabled>🇩🇪 Deutsch (Soon)</option>
              </select>
            </div>

            <!-- Show Translation -->
            <label class="flex items-center justify-between cursor-pointer py-1.5 min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-white/5 transition-colors">
              <span>${t('showTranslation')}</span>
              <input type="checkbox" id="chk-show-translation" ${settings.showTranslation ? 'checked' : ''} class="w-5 h-5 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Show Transliteration -->
            <label class="flex items-center justify-between cursor-pointer py-1.5 min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-white/5 transition-colors">
              <span>${t('showTransliteration')}</span>
              <input type="checkbox" id="chk-show-translit" ${settings.showTransliteration ? 'checked' : ''} class="w-5 h-5 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Autoplay Audio -->
            <label class="flex items-center justify-between cursor-pointer py-1.5 min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-white/5 transition-colors">
              <span>${t('autoplayAudio')}</span>
              <input type="checkbox" id="chk-auto-audio" ${settings.autoPlayAudio ? 'checked' : ''} class="w-5 h-5 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Sound Effects -->
            <label class="flex items-center justify-between cursor-pointer py-1.5 min-h-[44px] -mx-1 px-1 rounded-lg hover:bg-white/5 transition-colors">
              <span>${t('soundEffects')}</span>
              <input type="checkbox" id="chk-sound-effects" ${settings.soundEffects ? 'checked' : ''} class="w-5 h-5 rounded text-quran-gold focus:ring-0 accent-amber-500 cursor-pointer">
            </label>

            <!-- Font Size -->
            <div class="flex items-center justify-between py-1.5 min-h-[44px]">
              <span>${t('fontSize')}</span>
              <select id="sel-font-size" class="bg-quran-card border border-quran-border rounded-lg px-3 py-2 text-xs text-slate-200 min-h-[40px]">
                <option value="normal" ${settings.arabicFontSize === 'normal' ? 'selected' : ''}>${t('fontMedium')}</option>
                <option value="large" ${settings.arabicFontSize === 'large' ? 'selected' : ''}>${t('fontLarge')}</option>
                <option value="xlarge" ${settings.arabicFontSize === 'xlarge' ? 'selected' : ''}>${t('fontExtraLarge')}</option>
              </select>
            </div>

            <!-- Offline Audio Pre-caching -->
            <div class="p-3 sm:p-3.5 rounded-xl bg-quran-bg/60 border border-quran-border/60 text-xs flex flex-col gap-2">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <div class="font-semibold text-quran-gold">${t('offlineAudioTitle')}</div>
                  <div class="text-[11px] text-slate-400">${t('offlineAudioDesc')}</div>
                </div>
                <button
                  id="btn-download-offline"
                  class="px-3.5 py-2 rounded-lg bg-quran-card hover:bg-quran-border text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95 min-h-[40px] flex items-center justify-center"
                >
                  ${t('downloadAudio')}
                </button>
              </div>
              <div id="offline-download-status" class="text-[11px] text-slate-300 hidden"></div>
            </div>

            <!-- Reciter Information -->
            <div class="p-3 sm:p-3.5 rounded-xl bg-quran-bg/60 border border-quran-border/60 text-xs">
              <div class="font-semibold text-quran-gold mb-1">${t('reciterTitle')}</div>
              <p class="text-slate-400">${t('reciterDescription')}</p>
            </div>

            <!-- Keyboard Shortcuts (Hidden on Mobile/Touch Devices) -->
            <div class="hidden md:block p-3 rounded-xl bg-quran-bg/60 border border-quran-border/60 text-xs">
              <div class="font-semibold text-slate-300 mb-2">${t('shortcutsTitle')}</div>
              <div class="grid grid-cols-2 gap-2 text-slate-400">
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">◀</kbd> ${t('prevAyahShortcut')}</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">▶</kbd> ${t('nextAyahShortcut')}</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">C</kbd> ${t('checkShortcut')}</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">Space</kbd> ${t('playPauseShortcut')}</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">H</kbd> ${t('hintShortcut')}</div>
                <div><kbd class="px-1.5 py-0.5 rounded bg-quran-card border border-quran-border text-slate-200">R</kbd> ${t('revealShortcut')}</div>
              </div>
            </div>

            <!-- Reset Progress -->
            <div class="pt-2 border-t border-quran-border/40 flex justify-between items-center min-h-[44px]">
              <button id="btn-reset-progress" class="py-2 text-xs text-red-400 hover:text-red-300 hover:underline min-h-[40px] flex items-center">
                ${t('resetProgressButton')}
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

    const selGameMode = this.container.querySelector('#sel-app-gamemode') as HTMLSelectElement | null;
    if (selGameMode) {
      selGameMode.addEventListener('change', () => {
        store.setGameMode(selGameMode.value as GameModeId);
      });
    }

    const selLang = this.container.querySelector('#sel-app-language') as HTMLSelectElement | null;
    if (selLang) {
      selLang.addEventListener('change', () => {
        const lang = selLang.value as AppLanguage;
        localStorage.setItem('puzzle_al_mulk_language', lang);
        store.updateLanguage(lang);
        this.render(); // Re-render modal in chosen language
      });
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

    const chkSound = this.container.querySelector('#chk-sound-effects') as HTMLInputElement | null;
    if (chkSound) {
      chkSound.addEventListener('change', () => {
        store.updateSettings({ soundEffects: chkSound.checked });
      });
    }

    const selFont = this.container.querySelector('#sel-font-size') as HTMLSelectElement | null;
    if (selFont) {
      selFont.addEventListener('change', () => {
        store.updateSettings({ arabicFontSize: selFont.value as any });
      });
    }

    const btnDownloadOffline = this.container.querySelector('#btn-download-offline') as HTMLButtonElement | null;
    const statusDiv = this.container.querySelector('#offline-download-status') as HTMLElement | null;

    if (btnDownloadOffline && statusDiv) {
      btnDownloadOffline.addEventListener('click', async () => {
        if (!('caches' in window)) {
          alert('Offline Cache is not supported in this browser.');
          return;
        }

        const ayahs = store.currentSurah?.ayahs || [];
        if (ayahs.length === 0) return;

        btnDownloadOffline.disabled = true;
        btnDownloadOffline.textContent = '...';
        statusDiv.classList.remove('hidden');

        try {
          const cache = await caches.open('puzzle-al-mulk-audio-v1');
          let completed = 0;

          for (const a of ayahs) {
            statusDiv.textContent = t('downloadingAudio', { current: a.number, total: ayahs.length });
            try {
              const res = await fetch(a.audioUrl);
              if (res.ok) {
                await cache.put(a.audioUrl, res.clone());
              }
            } catch (err) {
              console.warn(`Failed caching audio for ayah ${a.number}:`, err);
            }
            completed++;
          }

          statusDiv.innerHTML = `<span class="text-emerald-400 font-semibold">${t('downloadedSuccess', { total: completed })}</span>`;
          btnDownloadOffline.textContent = '✓';
        } catch (err) {
          statusDiv.innerHTML = `<span class="text-red-400">${t('downloadFailed', { err: String(err) })}</span>`;
          btnDownloadOffline.disabled = false;
          btnDownloadOffline.textContent = t('retryDownload');
        }
      });
    }

    const btnResetProg = this.container.querySelector('#btn-reset-progress');
    if (btnResetProg) {
      btnResetProg.addEventListener('click', () => {
        if (confirm(t('resetProgressConfirm'))) {
          store.progress = {};
          store.saveProgress();
          this.close();
        }
      });
    }
  }
}
