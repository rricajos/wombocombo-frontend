// ── Physics Constants ────────────────────────────────
export const PHYSICS = {
  GRAVITY: 800,
  PLAYER_SPEED: 220,
  PLAYER_JUMP: -420,
  PLAYER_MAX_FALL: 600,
  TILE_SIZE: 32,
  PLAYER_WIDTH: 24,
  PLAYER_HEIGHT: 32,

  // Enemy defaults (overridden per type in enemies.ts)
  ENEMY_SPEED: 60,
  ENEMY_GRAVITY: 800,

  // Items
  ITEM_FLOAT_AMPLITUDE: 4,
  ITEM_FLOAT_SPEED: 1500,

  // Combat
  KNOCKBACK_X: 150,
  KNOCKBACK_Y: -200,
  INVULNERABLE_MS: 800,
} as const;

// ── Network Constants ────────────────────────────────
export const NETWORK = {
  SERVER_TICK_RATE: 20,
  INTERPOLATION_DELAY: 100,
  SNAPSHOT_BUFFER_SIZE: 10,
  INPUT_SEND_RATE_MS: 50,
} as const;

// ── Camera Constants ─────────────────────────────────
export const CAMERA = {
  LERP_X: 0.08,
  LERP_Y: 0.06,
  DEADZONE_W: 80,
  DEADZONE_H: 40,
  SHAKE_DURATION: 120,
  SHAKE_INTENSITY: 0.006,
  DEATH_ZOOM: 0.88,
  ZOOM_DURATION: 500,
} as const;

// ── Map Constants ────────────────────────────────────
export const MAP = {
  DEFAULT_WIDTH: 1280,
  DEFAULT_HEIGHT: 720,
  COLLISION_LAYER: "collision",
  PLATFORM_LAYER: "platforms",
  DECORATION_LAYER: "decoration",
  SPAWN_LAYER: "spawns",
} as const;
