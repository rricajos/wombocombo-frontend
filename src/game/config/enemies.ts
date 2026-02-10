export interface EnemyConfig {
  width: number;
  height: number;
  color: number;
  speed: number;
}

/** Visual config for each enemy type. Placeholder colors until real sprites. */
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  slime: { width: 24, height: 16, color: 0x00cc44, speed: 40 },
  bat: { width: 20, height: 16, color: 0x8844cc, speed: 80 },
  skeleton: { width: 24, height: 32, color: 0xcccccc, speed: 60 },
  demon: { width: 32, height: 32, color: 0xcc2200, speed: 50 },
};

export function getEnemyConfig(type: string): EnemyConfig {
  return (
    ENEMY_CONFIGS[type] ?? { width: 24, height: 24, color: 0xff00ff, speed: 50 }
  );
}
