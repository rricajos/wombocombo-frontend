// ═══════════════════════════════════════════════════════════════
// MESSAGES SENT BY CLIENT → SERVER
// ═══════════════════════════════════════════════════════════════

export interface ClientPlayerReady {
  type: "player_ready";
  ready: boolean;
}

export interface ClientChatMessage {
  type: "chat_message";
  message: string;
}

export interface ClientPlayerInput {
  type: "player_input";
  tick: number;
  actions: PlayerAction[];
}

export interface ClientPlayerAction {
  type: "player_action";
  action: string;
}

export interface ClientBuyItem {
  type: "buy_item";
  item_id: string;
}

export type ClientMessage =
  | ClientPlayerReady
  | ClientChatMessage
  | ClientPlayerInput
  | ClientPlayerAction
  | ClientBuyItem;

// ═══════════════════════════════════════════════════════════════
// MESSAGES RECEIVED FROM SERVER → CLIENT
// ═══════════════════════════════════════════════════════════════

// ── Connection ────────────────────────────────────────────────
export interface ServerConnected {
  type: "connected";
  player_id: string;
  server_tick: number;
}

export interface ServerError {
  type: "error";
  code: number;
  message: string;
}

// ── Lobby ─────────────────────────────────────────────────────
export interface ServerPlayerJoined {
  type: "player_joined";
  player_id: string;
  player_name: string;
}

export interface ServerPlayerLeft {
  type: "player_left";
  player_id: string;
}

export interface ServerPlayerReadyState {
  type: "player_ready_state";
  player_id: string;
  ready: boolean;
}

export interface LobbyPlayerInfo {
  id: string;
  name: string;
  avatar_id: string;
  ready: boolean;
}

export interface ServerLobbyState {
  type: "lobby_state";
  players: LobbyPlayerInfo[];
  settings: Record<string, unknown>;
}

export interface ServerChatBroadcast {
  type: "chat_broadcast";
  player_id: string;
  message: string;
}

// ── Gameplay State (20 Hz) ────────────────────────────────────
export interface GameStatePlayer {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  state: PlayerState;
  facing: FacingDirection;
}

export interface GameStateEnemy {
  id: string;
  type: string;
  x: number;
  y: number;
  health: number;
  state: string;
}

export interface GameStateItem {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface ServerGameState {
  type: "game_state";
  tick: number;
  time_left: number;
  players: GameStatePlayer[];
  enemies: GameStateEnemy[];
  items: GameStateItem[];
}

// ── Game Events ───────────────────────────────────────────────
export interface ServerGameStart {
  type: "game_start";
  round: number;
  map_data: MapData;
  spawn_points: SpawnPoint[];
}

export interface ServerPlayerHit {
  type: "player_hit";
  player_id: string;
  damage: number;
  health: number;
}

export interface ServerPlayerDeath {
  type: "player_death";
  player_id: string;
}

export interface ServerPlayerRespawn {
  type: "player_respawn";
  player_id: string;
  x: number;
  y: number;
}

export interface ServerEnemySpawn {
  type: "enemy_spawn";
  enemy_id: string;
  enemy_type: string;
  x: number;
  y: number;
}

export interface ServerEnemyDeath {
  type: "enemy_death";
  enemy_id: string;
  killed_by: string;
}

export interface ServerItemSpawn {
  type: "item_spawn";
  item_id: string;
  item_type: string;
  x: number;
  y: number;
}

export interface ServerItemPickup {
  type: "item_pickup";
  item_id: string;
  player_id: string;
}

// ── Round Flow ────────────────────────────────────────────────
export interface ServerRoundEnd {
  type: "round_end";
  stats: Record<string, unknown>;
  rewards: Record<string, unknown>;
}

export interface ServerShopOpen {
  type: "shop_open";
  available_items: ShopItemData[];
}

export interface ServerBuyResult {
  type: "buy_result";
  success: boolean;
  item_id: string;
  gold_left: number;
}

export interface ServerRoundStartCountdown {
  type: "round_start_countdown";
  seconds: number;
}

export interface ServerGameOver {
  type: "game_over";
  final_stats: Record<string, unknown>;
}

export type ServerMessage =
  | ServerConnected
  | ServerError
  | ServerPlayerJoined
  | ServerPlayerLeft
  | ServerPlayerReadyState
  | ServerLobbyState
  | ServerChatBroadcast
  | ServerGameState
  | ServerGameStart
  | ServerPlayerHit
  | ServerPlayerDeath
  | ServerPlayerRespawn
  | ServerEnemySpawn
  | ServerEnemyDeath
  | ServerItemSpawn
  | ServerItemPickup
  | ServerRoundEnd
  | ServerShopOpen
  | ServerBuyResult
  | ServerRoundStartCountdown
  | ServerGameOver;

// ═══════════════════════════════════════════════════════════════
// SHARED TYPES
// ═══════════════════════════════════════════════════════════════

export type PlayerAction =
  | "left"
  | "right"
  | "jump"
  | "crouch"
  | "interact"
  | "use_item";

export type PlayerState =
  | "idle"
  | "running"
  | "jumping"
  | "falling"
  | "crouching"
  | "dead";

export type FacingDirection = "left" | "right";

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface MapData {
  id: string;
  tilemap: string;
  tileset: string;
  width: number;
  height: number;
}

export interface ShopItemData {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
}
