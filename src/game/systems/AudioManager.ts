import { settingsStore } from "$lib/stores/settings.svelte";

/**
 * Centralized audio manager.
 * Generates placeholder sounds using Web Audio API.
 * In production, load actual audio files.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  /**
   * Initialize Web Audio context (must be called from user interaction).
   */
  init(): void {
    if (this.initialized) return;

    try {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.updateVolumes();
      this.initialized = true;
    } catch {
      console.warn("[AUDIO] Web Audio not available");
    }
  }

  /**
   * Update gain values from settings store.
   */
  updateVolumes(): void {
    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const master = settingsStore.masterVolume;
    this.musicGain.gain.value = master * settingsStore.musicVolume;
    this.sfxGain.gain.value = master * settingsStore.sfxVolume;
  }

  /**
   * Play a synthesized SFX (placeholder).
   */
  playSFX(type: SFXType): void {
    if (!this.ctx || !this.sfxGain) return;
    this.updateVolumes();

    const config = SFX_CONFIGS[type];
    if (!config) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = config.wave;
    osc.frequency.value = config.freq;

    if (config.freqEnd) {
      osc.frequency.linearRampToValueAtTime(config.freqEnd, this.ctx.currentTime + config.duration);
    }

    gain.gain.value = config.volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + config.duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + config.duration);
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.initialized = false;
  }
}

export type SFXType =
  | "jump"
  | "land"
  | "hit"
  | "death"
  | "pickup"
  | "coin"
  | "buy"
  | "countdown_tick"
  | "round_start"
  | "enemy_death";

interface SFXConfig {
  wave: OscillatorType;
  freq: number;
  freqEnd?: number;
  duration: number;
  volume: number;
}

const SFX_CONFIGS: Record<SFXType, SFXConfig> = {
  jump: { wave: "square", freq: 300, freqEnd: 500, duration: 0.1, volume: 0.15 },
  land: { wave: "triangle", freq: 120, freqEnd: 60, duration: 0.08, volume: 0.1 },
  hit: { wave: "sawtooth", freq: 200, freqEnd: 80, duration: 0.15, volume: 0.2 },
  death: { wave: "sawtooth", freq: 400, freqEnd: 50, duration: 0.4, volume: 0.25 },
  pickup: { wave: "sine", freq: 600, freqEnd: 900, duration: 0.12, volume: 0.15 },
  coin: { wave: "sine", freq: 800, freqEnd: 1200, duration: 0.1, volume: 0.12 },
  buy: { wave: "sine", freq: 500, freqEnd: 800, duration: 0.15, volume: 0.15 },
  countdown_tick: { wave: "square", freq: 440, duration: 0.08, volume: 0.1 },
  round_start: { wave: "square", freq: 660, freqEnd: 880, duration: 0.25, volume: 0.2 },
  enemy_death: { wave: "triangle", freq: 300, freqEnd: 100, duration: 0.2, volume: 0.15 },
};

export const audioManager = new AudioManager();
