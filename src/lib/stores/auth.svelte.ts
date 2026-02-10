export interface PlayerData {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_id: string;
  created_at: string;
}

const STORAGE_KEY = "wombocombo_auth";

function loadFromStorage(): { token: string; refreshToken: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

class AuthStore {
  token = $state<string>("");
  refreshToken = $state<string>("");
  player = $state<PlayerData | null>(null);
  loading = $state<boolean>(false);

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  constructor() {
    const saved = loadFromStorage();
    if (saved) {
      this.token = saved.token;
      this.refreshToken = saved.refreshToken;
    }
  }

  setAuth(token: string, refreshToken: string, player: PlayerData) {
    this.token = token;
    this.refreshToken = refreshToken;
    this.player = player;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, refreshToken })
    );
  }

  updateToken(token: string) {
    this.token = token;
    const saved = loadFromStorage();
    if (saved) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, token })
      );
    }
  }

  setPlayer(player: PlayerData) {
    this.player = player;
  }

  clear() {
    this.token = "";
    this.refreshToken = "";
    this.player = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const authStore = new AuthStore();
