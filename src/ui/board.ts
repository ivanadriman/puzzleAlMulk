import { store } from '../core/store';
import { GameModeId } from '../types';
import { PuzzleView } from './modes/puzzleView';
import { VanishingView } from './modes/vanishingView';
import { AudioSnatchView } from './modes/audioSnatchView';
import { BridgeView } from './modes/bridgeView';
import { SprintView } from './modes/sprintView';

export class BoardComponent {
  private container: HTMLElement;
  private puzzleView: PuzzleView;
  private vanishingView: VanishingView;
  private audioSnatchView: AudioSnatchView;
  private bridgeView: BridgeView;
  private sprintView: SprintView;

  constructor(container: HTMLElement) {
    this.container = container;
    this.puzzleView = new PuzzleView(this.container);
    this.vanishingView = new VanishingView(this.container);
    this.audioSnatchView = new AudioSnatchView(this.container);
    this.bridgeView = new BridgeView(this.container);
    this.sprintView = new SprintView(this.container);
  }

  public render() {
    const ayah = store.getCurrentAyah();
    if (!ayah) {
      this.container.innerHTML = `<div class="p-8 text-center text-slate-400">Loading Ayah...</div>`;
      return;
    }

    const activeMode: GameModeId = store.settings.activeGameMode || 'puzzle';

    switch (activeMode) {
      case 'puzzle':
        this.puzzleView.render();
        break;
      case 'vanishing':
        this.vanishingView.render();
        break;
      case 'audio_snatch':
        this.audioSnatchView.render();
        break;
      case 'bridge':
        this.bridgeView.render();
        break;
      case 'sprint':
        this.sprintView.render();
        break;
      default:
        this.puzzleView.render();
        break;
    }
  }
}
