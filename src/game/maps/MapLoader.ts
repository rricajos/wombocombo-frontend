import type { PlatformDef } from "../systems/Collision";
import { MAP } from "../config/physics";

/**
 * Map data that comes either from Tiled JSON or built-in definitions.
 */
export interface MapDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  platforms: PlatformDef[];
  spawnPoints: { x: number; y: number }[];
  enemySpawnZones: { x: number; y: number; w: number; h: number }[];
  bgColor: number;
}

/**
 * Built-in placeholder maps.
 * These will be replaced by Tiled JSON maps loaded from assets.
 */
const BUILT_IN_MAPS: Record<string, MapDefinition> = {
  arena_01: {
    id: "arena_01",
    name: "Arena",
    width: 1280,
    height: 720,
    bgColor: 0x12122a,
    platforms: [
      // Lower level
      { x: 160, y: 600, w: 4, oneWay: true },
      { x: 500, y: 580, w: 3, oneWay: true },
      { x: 900, y: 600, w: 4, oneWay: true },

      // Mid level
      { x: 280, y: 480, w: 5 },
      { x: 700, y: 460, w: 4 },
      { x: 1040, y: 490, w: 3, oneWay: true },

      // Upper level
      { x: 130, y: 350, w: 3, oneWay: true },
      { x: 460, y: 340, w: 4 },
      { x: 780, y: 330, w: 5 },

      // Top level
      { x: 330, y: 220, w: 3, oneWay: true },
      { x: 630, y: 200, w: 3, oneWay: true },
      { x: 930, y: 240, w: 2, oneWay: true },
    ],
    spawnPoints: [
      { x: 200, y: 500 },
      { x: 500, y: 350 },
      { x: 800, y: 500 },
      { x: 1050, y: 400 },
    ],
    enemySpawnZones: [
      { x: 100, y: 200, w: 400, h: 50 },
      { x: 700, y: 150, w: 400, h: 50 },
    ],
  },

  forest_01: {
    id: "forest_01",
    name: "Forest",
    width: 1600,
    height: 800,
    bgColor: 0x0d1a0d,
    platforms: [
      // Tree trunk platforms
      { x: 200, y: 650, w: 3 },
      { x: 500, y: 550, w: 4, oneWay: true },
      { x: 850, y: 600, w: 3, oneWay: true },
      { x: 1100, y: 650, w: 5 },
      { x: 1350, y: 550, w: 3, oneWay: true },

      // Canopy level
      { x: 300, y: 420, w: 5 },
      { x: 700, y: 380, w: 4, oneWay: true },
      { x: 1000, y: 400, w: 4 },
      { x: 1300, y: 380, w: 3, oneWay: true },

      // Treetops
      { x: 200, y: 270, w: 3, oneWay: true },
      { x: 550, y: 230, w: 4, oneWay: true },
      { x: 900, y: 250, w: 3, oneWay: true },
      { x: 1200, y: 220, w: 3, oneWay: true },
    ],
    spawnPoints: [
      { x: 250, y: 550 },
      { x: 600, y: 450 },
      { x: 1150, y: 550 },
      { x: 1400, y: 450 },
    ],
    enemySpawnZones: [
      { x: 100, y: 150, w: 600, h: 50 },
      { x: 800, y: 150, w: 600, h: 50 },
    ],
  },

  dungeon_01: {
    id: "dungeon_01",
    name: "Dungeon",
    width: 1280,
    height: 800,
    bgColor: 0x0a0a14,
    platforms: [
      // Dungeon shelves
      { x: 120, y: 650, w: 6 },
      { x: 600, y: 650, w: 6 },
      { x: 1000, y: 650, w: 4 },

      // Mid level
      { x: 200, y: 500, w: 4, oneWay: true },
      { x: 550, y: 480, w: 5 },
      { x: 950, y: 510, w: 4, oneWay: true },

      // Upper level
      { x: 100, y: 350, w: 5 },
      { x: 500, y: 330, w: 4, oneWay: true },
      { x: 850, y: 360, w: 5 },

      // Top
      { x: 300, y: 200, w: 3, oneWay: true },
      { x: 600, y: 180, w: 3, oneWay: true },
      { x: 900, y: 210, w: 3, oneWay: true },
    ],
    spawnPoints: [
      { x: 200, y: 550 },
      { x: 650, y: 400 },
      { x: 1050, y: 550 },
      { x: 400, y: 250 },
    ],
    enemySpawnZones: [
      { x: 50, y: 100, w: 500, h: 50 },
      { x: 600, y: 100, w: 500, h: 50 },
    ],
  },
};

/**
 * Load a map by ID.
 * First checks built-in maps, later will try Tiled JSON from assets.
 */
export function loadMap(mapId: string): MapDefinition {
  const builtin = BUILT_IN_MAPS[mapId];
  if (builtin) return builtin;

  // Fallback to arena_01
  console.warn(`[MAP] Unknown map "${mapId}", falling back to arena_01`);
  return BUILT_IN_MAPS.arena_01;
}

/**
 * Get a spawn point for a given player index.
 */
export function getSpawnPoint(map: MapDefinition, playerIndex: number): { x: number; y: number } {
  const idx = playerIndex % map.spawnPoints.length;
  return map.spawnPoints[idx];
}
