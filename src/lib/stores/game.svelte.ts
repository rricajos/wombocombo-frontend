export type GamePhase = "loading" | "countdown" | "playing" | "shop" | "death" | "game_over";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface KillFeedEntry {
  id: number;
  message: string;
  timestamp: number;
  type: "kill" | "death" | "pickup" | "info";
}

let killFeedId = 0;

class GameStore {
  // Phase
  phase = $state<GamePhase>("loading");

  // Player state (updated by Phaser → read by HUD)
  health = $state<number>(100);
  maxHealth = $state<number>(100);
  score = $state<number>(0);
  gold = $state<number>(0);

  // Round state
  round = $state<number>(0);
  timeLeft = $state<number>(60);
  countdownSeconds = $state<number>(0);

  // Players alive
  playersAlive = $state<number>(0);
  totalPlayers = $state<number>(0);

  // Death
  killedBy = $state<string>("");

  // Shop
  shopItems = $state<ShopItem[]>([]);

  // Match results
  finalStats = $state<Record<string, unknown> | null>(null);

  // Kill feed / event log
  killFeed = $state<KillFeedEntry[]>([]);

  // Connection
  wsConnected = $state<boolean>(false);
  serverTick = $state<number>(0);

  addKillFeed(message: string, type: KillFeedEntry["type"] = "info") {
    this.killFeed.push({
      id: ++killFeedId,
      message,
      timestamp: Date.now(),
      type,
    });
    if (this.killFeed.length > 20) {
      this.killFeed = this.killFeed.slice(-15);
    }
  }

  /** Remove expired feed entries (older than 5s) */
  cleanKillFeed() {
    const cutoff = Date.now() - 5000;
    this.killFeed = this.killFeed.filter((e) => e.timestamp > cutoff);
  }

  reset() {
    this.phase = "loading";
    this.health = 100;
    this.maxHealth = 100;
    this.score = 0;
    this.gold = 0;
    this.round = 0;
    this.timeLeft = 60;
    this.countdownSeconds = 0;
    this.playersAlive = 0;
    this.totalPlayers = 0;
    this.killedBy = "";
    this.shopItems = [];
    this.finalStats = null;
    this.killFeed = [];
    this.serverTick = 0;
  }
}

export const gameStore = new GameStore();
