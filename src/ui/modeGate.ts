import { GameModeId, GameModeMeta } from '../types';
import { store } from '../core/store';
import { t } from '../i18n';

const MODE_GATE_KEY = 'puzzle_al_mulk_mode_selected';

export const GAME_MODES: GameModeMeta[] = [
  {
    id: 'puzzle',
    icon: '🧩',
    badge: 'Classic • Lvl 1 & 2',
    titleKey: 'modePuzzleTitle',
    descKey: 'modePuzzleDesc'
  },
  {
    id: 'vanishing',
    icon: '🌫️',
    badge: 'Active Recall',
    titleKey: 'modeVanishingTitle',
    descKey: 'modeVanishingDesc'
  },
  {
    id: 'audio_snatch',
    icon: '🎧',
    badge: 'Auditory Reflex',
    titleKey: 'modeAudioSnatchTitle',
    descKey: 'modeAudioSnatchDesc'
  },
  {
    id: 'bridge',
    icon: '🌉',
    badge: 'Inter-Ayah Bridge',
    titleKey: 'modeBridgeTitle',
    descKey: 'modeBridgeDesc'
  },
  {
    id: 'sprint',
    icon: '⚡',
    badge: 'Arcade Reflex',
    titleKey: 'modeSprintTitle',
    descKey: 'modeSprintDesc'
  }
];

export class ModeGateComponent {
  private container: HTMLElement;
  private onComplete: () => void;
  private allowClose: boolean;

  constructor(container: HTMLElement, onComplete: () => void, allowClose = false) {
    this.container = container;
    this.onComplete = onComplete;
    this.allowClose = allowClose;
  }

  public static hasSelectedMode(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      return !!localStorage.getItem(MODE_GATE_KEY);
    } catch {
      return false;
    }
  }

  public render() {
    const currentMode = store.settings.activeGameMode || 'puzzle';

    const cardsHtml = GAME_MODES.map((mode) => {
      const isSelected = mode.id === currentMode;
      const title = t(mode.titleKey as any);
      const desc = t(mode.descKey as any);

      return `
        <button
          type="button"
          data-mode="${mode.id}"
          class="mode-card group relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#162e29] to-[#0f211d] hover:from-[#1e3f38] hover:to-[#142c26] border ${
            isSelected
              ? 'border-quran-gold shadow-glow-gold ring-1 ring-quran-gold/60'
              : 'border-quran-border hover:border-quran-gold/60'
          } shadow-md transition-all active:scale-[0.98] flex flex-col justify-between text-left min-h-[110px] sm:min-h-[120px]"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="text-2xl sm:text-3xl">${mode.icon}</span>
              ${
                mode.badge
                  ? `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-quran-gold/15 text-quran-gold border border-quran-gold/30">${mode.badge}</span>`
                  : ''
              }
            </div>
            <div class="font-bold text-slate-100 text-sm sm:text-base group-hover:text-quran-gold transition-colors flex items-center gap-1.5">
              <span>${title}</span>
              ${isSelected ? `<span class="text-xs text-quran-gold">✓</span>` : ''}
            </div>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
              ${desc}
            </p>
          </div>
          <div class="mt-2 text-[11px] font-semibold ${
            isSelected ? 'text-quran-gold' : 'text-slate-400 group-hover:text-quran-gold'
          } flex items-center justify-between">
            <span>${isSelected ? '● Aktif' : 'Pilih Mode'}</span>
            <span class="text-xs transition-transform group-hover:translate-x-1">➔</span>
          </div>
        </button>
      `;
    }).join('');

    const html = `
      <div id="mode-gate-backdrop" class="fixed inset-0 z-50 bg-[#0a1412]/95 bg-islamic-pattern backdrop-blur-md flex items-center justify-center p-3 sm:p-4 selection:bg-quran-gold selection:text-black overflow-y-auto max-h-[100dvh]">
        <div class="glass-panel w-full max-w-2xl rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-7 border border-quran-gold/50 shadow-glow-gold flex flex-col gap-3 text-center relative max-h-[94dvh] overflow-y-auto my-auto animate-fadeIn">
          
          ${
            this.allowClose
              ? `
            <button id="btn-close-mode-gate" class="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              ✕
            </button>
          `
              : ''
          }

          <!-- Header -->
          <div class="flex flex-col items-center gap-1">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-quran-gold to-amber-700 flex items-center justify-center shadow-glow-gold text-xl sm:text-2xl mb-1">
              <span>🎮</span>
            </div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              ${t('modeSelectorTitle')}
            </h2>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              ${t('modeSelectorSubtitle')}
            </p>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-2 text-left">
            ${cardsHtml}
          </div>

          <div class="text-[11px] text-slate-400 pt-1.5 border-t border-quran-border/40">
            <span>${t('changeAnytimeNotice')}</span>
          </div>

        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  private attachEvents() {
    const cards = this.container.querySelectorAll<HTMLButtonElement>('.mode-card');
    const closeBtn = this.container.querySelector('#btn-close-mode-gate');

    const selectMode = (modeId: GameModeId) => {
      try {
        localStorage.setItem(MODE_GATE_KEY, 'true');
      } catch {}
      store.setGameMode(modeId);
      this.container.innerHTML = '';
      this.onComplete();
    };

    cards.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode as GameModeId;
        if (mode) {
          selectMode(mode);
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.container.innerHTML = '';
        this.onComplete();
      });
    }
  }
}
