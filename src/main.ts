import './styles.css';
import { store } from './core/store';
import { audioService } from './services/audio';
import { HeaderComponent } from './ui/header';
import { NavigationComponent } from './ui/navigation';
import { BoardComponent } from './ui/board';
import { ActionsComponent } from './ui/actions';
import { SettingsModalComponent } from './ui/modal';
import { LanguageGateComponent } from './ui/languageGate';
import { ModeGateComponent } from './ui/modeGate';
import { setLanguage } from './i18n';

async function bootstrap() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const initAppView = async () => {
    appEl.innerHTML = `
      <div class="min-h-screen bg-islamic-pattern flex flex-col justify-between p-3 md:p-6 select-none">
        <div id="header-root"></div>
        <main class="flex-1 flex flex-col justify-center gap-5 my-4">
          <div id="navigation-root"></div>
          <div id="board-root"></div>
          <div id="actions-root"></div>
        </main>
        <footer class="w-full max-w-4xl mx-auto text-center py-4 text-xs text-quran-textMuted border-t border-quran-border/40">
          <p>Surah Al-Mulk Memorization Puzzle • Mishary Rashid Alafasy • Translations: Sahih International (EN) & Kemenag RI (ID)</p>
        </footer>
        <div id="modal-root"></div>
      </div>
    `;

    const headerRoot = document.getElementById('header-root')!;
    const navigationRoot = document.getElementById('navigation-root')!;
    const boardRoot = document.getElementById('board-root')!;
    const actionsRoot = document.getElementById('actions-root')!;
    const modalRoot = document.getElementById('modal-root')!;

    const openModeGateModal = () => {
      const modalContainer = document.createElement('div');
      modalContainer.id = 'mode-gate-modal-root';
      document.body.appendChild(modalContainer);

      const modeGate = new ModeGateComponent(modalContainer, () => {
        modalContainer.remove();
      }, true);
      modeGate.render();
    };

    const modal = new SettingsModalComponent(modalRoot);
    const header = new HeaderComponent(headerRoot, () => modal.open(), openModeGateModal);
    const navigation = new NavigationComponent(navigationRoot);
    const board = new BoardComponent(boardRoot);
    const actions = new ActionsComponent(actionsRoot);

    const renderAll = () => {
      header.render();
      navigation.render();
      board.render();
      actions.render();
    };

    store.subscribe(() => {
      renderAll();
    });

    audioService.onPlay(() => actions.render());
    audioService.onPause(() => actions.render());
    audioService.onEnded(() => actions.render());

    // Global Keyboard shortcuts
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        store.prevAyah();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        store.nextAyah();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        const ayah = store.getCurrentAyah();
        if (ayah) audioService.toggle(ayah.audioUrl);
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        store.checkCombination();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        store.useHint();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        store.revealAyah();
      }
    });

    // Load data (defaults to Surah 67 Al-Mulk)
    await store.initialize(67);
  };

  // Pre-initialize app view under the hood
  const savedLang = LanguageGateComponent.getSavedLanguage();
  setLanguage(savedLang);
  store.settings.language = savedLang;
  await initAppView();

  // Onboarding Flow:
  // Step 1: Language selection gate (if not yet chosen)
  // Step 2: Immediately follow with Game Mode selection gate
  if (!LanguageGateComponent.hasSelectedLanguage()) {
    const gateContainer = document.createElement('div');
    gateContainer.id = 'gate-root';
    document.body.appendChild(gateContainer);

    const langGate = new LanguageGateComponent(gateContainer, () => {
      // Step 2: Immediately show Mode Selection Gate
      const modeGate = new ModeGateComponent(gateContainer, () => {
        gateContainer.remove();
      }, false);
      modeGate.render();
    });
    langGate.render();
  } else if (!ModeGateComponent.hasSelectedMode()) {
    // If language was chosen in previous session but mode gate was not yet passed
    const gateContainer = document.createElement('div');
    gateContainer.id = 'gate-root';
    document.body.appendChild(gateContainer);

    const modeGate = new ModeGateComponent(gateContainer, () => {
      gateContainer.remove();
    }, false);
    modeGate.render();
  }

  // Register Service Worker for offline PWA functionality
  const swUrl = `${import.meta.env.BASE_URL || '/'}sw.js`;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register(swUrl)
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version ready, activating...');
                window.location.reload();
              }
            };
          }
        };
      })
      .catch((err) => {
        console.info('Service Worker registration skipped or failed:', err);
      });
  }
}

bootstrap().catch(console.error);
