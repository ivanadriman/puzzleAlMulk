type AudioEventCallback = () => void;
type TimeUpdateCallback = (current: number, duration: number) => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private playbackRate: number = 1.0;
  private isAudioUnlocked: boolean = false;

  private onPlayCallbacks: AudioEventCallback[] = [];
  private onPauseCallbacks: AudioEventCallback[] = [];
  private onEndedCallbacks: AudioEventCallback[] = [];
  private onTimeUpdateCallbacks: TimeUpdateCallback[] = [];
  private onErrorCallbacks: ((err: any) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      // Unlock mobile audio on first user gesture
      window.addEventListener('click', () => this.unlockAudio(), { once: true });
      window.addEventListener('touchstart', () => this.unlockAudio(), { once: true });
    }
  }

  private initAudio() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('play', () => {
      this.onPlayCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('pause', () => {
      this.onPauseCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('ended', () => {
      this.onEndedCallbacks.forEach((cb) => cb());
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        const cur = this.audio.currentTime || 0;
        const dur = this.audio.duration || 0;
        this.onTimeUpdateCallbacks.forEach((cb) => cb(cur, dur));
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.onErrorCallbacks.forEach((cb) => cb(e));
    });
  }

  private unlockAudio() {
    if (this.isAudioUnlocked || !this.audio) return;
    this.audio.play().then(() => {
      this.audio?.pause();
      this.isAudioUnlocked = true;
    }).catch(() => {
      // Ignore autoplay prevention on unlock attempt
    });
  }

  /**
   * Preload audio URL into browser cache for instantaneous playback
   */
  public preload(url: string) {
    if (!url) return;
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'audio';
      link.href = url;
      document.head.appendChild(link);
    } catch {
      // non-critical
    }
  }

  public async play(url: string): Promise<void> {
    if (!this.audio) return;

    if (this.currentUrl !== url) {
      this.currentUrl = url;
      this.audio.src = url;
      this.audio.playbackRate = this.playbackRate;
      this.audio.load();
    }

    try {
      this.audio.playbackRate = this.playbackRate;
      await this.audio.play();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Playback play() was rejected:', err);
      }
    }
  }

  public pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public toggle(url: string) {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play(url);
    }
  }

  public replay() {
    if (this.audio && this.currentUrl) {
      this.audio.currentTime = 0;
      this.audio.play().catch(console.warn);
    }
  }

  public isPlaying(): boolean {
    return !!(this.audio && !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0);
  }

  public setSpeed(rate: number) {
    this.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio?.duration || 0;
  }

  public onPlay(cb: AudioEventCallback) {
    this.onPlayCallbacks.push(cb);
  }

  public onPause(cb: AudioEventCallback) {
    this.onPauseCallbacks.push(cb);
  }

  public onEnded(cb: AudioEventCallback) {
    this.onEndedCallbacks.push(cb);
  }

  public onTimeUpdate(cb: TimeUpdateCallback) {
    this.onTimeUpdateCallbacks.push(cb);
  }

  public onError(cb: (err: any) => void) {
    this.onErrorCallbacks.push(cb);
  }
}

export const audioService = new AudioService();
