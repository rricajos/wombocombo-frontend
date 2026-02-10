/**
 * Linear interpolation between a and b by factor t (clamped 0-1).
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/**
 * Clamp value between 0 and 1.
 */
export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/**
 * Clamp value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Smooth damp — approaches target smoothly without overshooting.
 * Returns the new current value.
 */
export function smoothDamp(
  current: number,
  target: number,
  smoothTime: number,
  deltaTime: number
): number {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  return lerp(target, current, exp);
}

/**
 * Distance between two points.
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a position has changed significantly (avoids micro-jitter).
 */
export function positionChanged(
  x1: number, y1: number,
  x2: number, y2: number,
  threshold: number = 0.5
): boolean {
  return Math.abs(x2 - x1) > threshold || Math.abs(y2 - y1) > threshold;
}
