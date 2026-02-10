export const PHYSICS = {
  GRAVITY: 800,
  PLAYER_SPEED: 200,
  PLAYER_JUMP: -400,
  PLAYER_MAX_FALL: 600,
  TILE_SIZE: 32,
  PLAYER_WIDTH: 24,
  PLAYER_HEIGHT: 32,
} as const;

export const NETWORK = {
  /** Tick rate the server sends game_state */
  SERVER_TICK_RATE: 20,
  /** Interpolation delay in ms (renders 100ms behind server) */
  INTERPOLATION_DELAY: 100,
  /** How many snapshots to buffer per remote entity */
  SNAPSHOT_BUFFER_SIZE: 10,
} as const;
