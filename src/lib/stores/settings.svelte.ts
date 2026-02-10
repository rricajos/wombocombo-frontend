const SETTINGS_KEY = "wombocombo_settings";

interface SettingsData {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  showFPS: boolean;
}

const DEFAULTS: SettingsData = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  showFPS: false,
};

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

class SettingsStore {
  masterVolume = $state<number>(DEFAULTS.masterVolume);
  musicVolume = $state<number>(DEFAULTS.musicVolume);
  sfxVolume = $state<number>(DEFAULTS.sfxVolume);
  showFPS = $state<boolean>(DEFAULTS.showFPS);

  constructor() {
    const saved = loadSettings();
    this.masterVolume = saved.masterVolume;
    this.musicVolume = saved.musicVolume;
    this.sfxVolume = saved.sfxVolume;
    this.showFPS = saved.showFPS;
  }

  save() {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        showFPS: this.showFPS,
      })
    );
  }
}

export const settingsStore = new SettingsStore();
