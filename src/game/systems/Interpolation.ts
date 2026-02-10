// Interpolation utilities
// Core interpolation is implemented inline in RemotePlayer and Enemy.
// This file will contain shared helpers in Phase 3+.
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
