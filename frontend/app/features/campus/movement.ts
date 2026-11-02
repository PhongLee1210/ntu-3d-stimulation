import { HOME_YAW } from "./camera";
import type { Box, Vec2 } from "./layout";

export const PLAYER_RADIUS = 0.35;
export const WALK_SPEED = 4.2;
const ARRIVE_DISTANCE = 0.08;

const KEY_DIRECTIONS: Readonly<Record<string, { right: number; up: number }>> = {
  ArrowUp: { right: 0, up: 1 },
  KeyW: { right: 0, up: 1 },
  ArrowDown: { right: 0, up: -1 },
  KeyS: { right: 0, up: -1 },
  ArrowLeft: { right: -1, up: 0 },
  KeyA: { right: -1, up: 0 },
  ArrowRight: { right: 1, up: 0 },
  KeyD: { right: 1, up: 0 },
};

export function isMovementKey(code: string): boolean {
  return code in KEY_DIRECTIONS;
}

export function keyboardDirection(held: Iterable<string>, yaw = HOME_YAW): Vec2 | null {
  let right = 0;
  let up = 0;
  for (const code of held) {
    const direction = KEY_DIRECTIONS[code];
    if (direction) {
      right += direction.right;
      up += direction.up;
    }
  }
  const length = Math.hypot(right, up);
  if (length < 1e-6) return null;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { x: (right * c - up * s) / length, z: (-right * s - up * c) / length };
}

export function overlapsBox(point: Vec2, box: Box, radius: number): boolean {
  return (
    Math.abs(point.x - box.x) < box.halfX + radius && Math.abs(point.z - box.z) < box.halfZ + radius
  );
}

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function isBlocked(point: Vec2, obstacles: readonly Box[], b: Bounds): boolean {
  if (point.x < b.minX || point.x > b.maxX || point.z < b.minZ || point.z > b.maxZ) return true;
  return obstacles.some((box) => overlapsBox(point, box, PLAYER_RADIUS));
}

export interface StepResult {
  position: Vec2;
  heading: number | null;
  moving: boolean;
  targetDone: boolean;
}

export function step(
  position: Vec2,
  input: { keys: Iterable<string>; target: Vec2 | null; yaw?: number },
  dt: number,
  obstacles: readonly Box[],
  bounds: Bounds,
): StepResult {
  let direction = keyboardDirection(input.keys, input.yaw);
  let maxDistance = WALK_SPEED * dt;
  let blockedTarget = false;

  if (!direction && input.target) {
    const dx = input.target.x - position.x;
    const dz = input.target.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= ARRIVE_DISTANCE) {
      const end = isBlocked(input.target, obstacles, bounds) ? position : { ...input.target };
      return { position: end, heading: null, moving: false, targetDone: true };
    }
    direction = { x: dx / distance, z: dz / distance };
    maxDistance = Math.min(maxDistance, distance);
    blockedTarget = isBlocked(input.target, obstacles, bounds);
  }

  if (!direction) return { position, heading: null, moving: false, targetDone: false };

  const next = { ...position };
  const tryX = { x: position.x + direction.x * maxDistance, z: position.z };
  const xFree = !isBlocked(tryX, obstacles, bounds);
  if (xFree) next.x = tryX.x;
  const tryZ = { x: next.x, z: position.z + direction.z * maxDistance };
  const zFree = !isBlocked(tryZ, obstacles, bounds);
  if (zFree) next.z = tryZ.z;

  const moved = Math.hypot(next.x - position.x, next.z - position.z);
  if (moved < 1e-6) {
    return { position, heading: null, moving: false, targetDone: input.target !== null };
  }
  return {
    position: next,
    heading: Math.atan2(direction.x, direction.z),
    moving: true,
    targetDone: blockedTarget && !(xFree && zFree),
  };
}

export function nearestWithin<T extends { door: Vec2 }>(
  position: Vec2,
  sites: readonly T[],
  radius: number,
): T | null {
  let best: T | null = null;
  let bestDistance = radius;
  for (const site of sites) {
    const distance = Math.hypot(site.door.x - position.x, site.door.z - position.z);
    if (distance <= bestDistance) {
      best = site;
      bestDistance = distance;
    }
  }
  return best;
}
