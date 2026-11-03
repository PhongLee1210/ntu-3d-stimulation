export interface Screen {
  sx: number;
  sy: number;
}

export type CameraMode = "overview" | "follow";

export interface View {
  width: number;
  height: number;
  zoom: number;
  mode: CameraMode;
  insetTop: number;
  insetBottom: number;
}

export interface Bounds2 {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Ground {
  x: number;
  z: number;
}

export const HOME_YAW = Math.PI / 4;
const SIN_E = 1 / Math.sqrt(3);
const COS_E = Math.sqrt(2 / 3);
const DISTANCE = 60;

export const PIVOT = { x: 0, z: -4.45 } as const;
export const ORBIT_FRAME = { half: 22.94, top: 13.42, bottom: -13.9 } as const;
export const HUD_CORNER = { width: 344, height: 76 } as const;
export const VIEW_CONTROLS = { width: 158, height: 70 } as const;

const PAD = 24;
const FOLLOW_INSET_TOP = 72;

export function toScreen(x: number, y: number, z: number, yaw = HOME_YAW): Screen {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { sx: x * c - z * s, sy: y * COS_E - (x * s + z * c) * SIN_E };
}

export function groundFromScreen({ sx, sy }: Screen, yaw = HOME_YAW): Ground {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const f = -sy / SIN_E;
  return { x: sx * c + f * s, z: -sx * s + f * c };
}

export function cameraOffset(yaw: number): [number, number, number] {
  return [DISTANCE * COS_E * Math.sin(yaw), DISTANCE * SIN_E, DISTANCE * COS_E * Math.cos(yaw)];
}

export function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function rotateAbout(p: Ground, pivot: Ground, delta: number): Ground {
  const dx = p.x - pivot.x;
  const dz = p.z - pivot.z;
  const c = Math.cos(delta);
  const s = Math.sin(delta);
  return { x: pivot.x + dx * c + dz * s, z: pivot.z - dx * s + dz * c };
}

const QUARTER = Math.PI / 2;
const MIN_TURN = Math.PI / 180;

export function nextIsoYaw(yaw: number, dir: -1 | 1): number {
  const u = (yaw - HOME_YAW) / QUARTER;
  const m = MIN_TURN / QUARTER;
  const k = dir > 0 ? Math.floor(u + m) + 1 : Math.ceil(u - m) - 1;
  return wrapAngle(HOME_YAW + k * QUARTER);
}

const SNAP = (12 * Math.PI) / 180;

export function snapYaw(yaw: number, reduced = false): number {
  const diagonal = wrapAngle(HOME_YAW + Math.round((yaw - HOME_YAW) / QUARTER) * QUARTER);
  return !reduced && Math.abs(wrapAngle(yaw - diagonal)) <= SNAP + 1e-9 ? diagonal : yaw;
}

export function dragRate(width: number): number {
  return (2 * Math.PI) / Math.min(Math.max(width, 600), 1200);
}

export interface ContentBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

const DEFAULT_CONTENT_BOUNDS: ContentBounds = { minX: -14.8, maxX: 14.8, minZ: -21.5, maxZ: 12.6 };

export function contentAt(yaw: number, bounds: ContentBounds = DEFAULT_CONTENT_BOUNDS): Bounds2 {
  const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const [y, grow] of [
    [-0.8, 0.25],
    [0, 0],
  ] as const) {
    for (const x of [bounds.minX - grow, bounds.maxX + grow]) {
      for (const z of [bounds.minZ - grow, bounds.maxZ + grow]) {
        const { sx, sy } = toScreen(x, y, z, yaw);
        b.minX = Math.min(b.minX, sx);
        b.maxX = Math.max(b.maxX, sx);
        b.minY = Math.min(b.minY, sy);
        b.maxY = Math.max(b.maxY, sy);
      }
    }
  }
  return b;
}

export function viewFor(width: number, height: number, insetBottom = 0): View {
  const spanX = 2 * ORBIT_FRAME.half;
  const spanY = ORBIT_FRAME.top - ORBIT_FRAME.bottom;
  const fit = Math.min((width - 2 * PAD) / spanX, (height - 2 * PAD) / spanY);
  if (fit >= 22) {
    return {
      width,
      height,
      zoom: Math.min(fit, 56),
      mode: "overview",
      insetTop: 0,
      insetBottom: 0,
    };
  }
  const zoom = Math.min(Math.max(Math.min((width - 32) / 11.5, (height - 72) / 8), 28), 40);
  return { width, height, zoom, mode: "follow", insetTop: FOLLOW_INSET_TOP, insetBottom };
}

function clampAxis(value: number, half: number, min: number, max: number): number {
  if (2 * half >= max - min) return (min + max) / 2;
  return Math.min(Math.max(value, min + half), max - half);
}

export function clampCentre(
  centre: Screen,
  view: View,
  yaw = HOME_YAW,
  bounds: ContentBounds = DEFAULT_CONTENT_BOUNDS,
): Screen {
  const content = contentAt(yaw, bounds);
  const hw = view.width / (2 * view.zoom);
  const hh = (view.height - view.insetTop - view.insetBottom) / (2 * view.zoom);
  return {
    sx: clampAxis(centre.sx, hw, content.minX, content.maxX),
    sy: clampAxis(centre.sy, hh, content.minY, content.maxY),
  };
}

export function desiredCentre(
  current: Screen,
  focus: Screen,
  view: View,
  centreOnFocus = false,
  yaw = HOME_YAW,
  bounds: ContentBounds = DEFAULT_CONTENT_BOUNDS,
): Screen {
  if (view.mode === "overview") {
    const pivot = toScreen(PIVOT.x, 0, PIVOT.z, yaw);
    return { sx: pivot.sx, sy: pivot.sy + (ORBIT_FRAME.top + ORBIT_FRAME.bottom) / 2 };
  }
  if (centreOnFocus) return clampCentre(focus, view, yaw, bounds);
  const halfW = (0.12 * view.width) / view.zoom;
  const halfH = (0.1 * (view.height - view.insetTop - view.insetBottom)) / view.zoom;
  const push = (value: number, target: number, half: number) =>
    target > value + half ? target - half : target < value - half ? target + half : value;
  return clampCentre(
    { sx: push(current.sx, focus.sx, halfW), sy: push(current.sy, focus.sy, halfH) },
    view,
    yaw,
    bounds,
  );
}

export function cameraCentre(visible: Screen, view: View): Screen {
  return { sx: visible.sx, sy: visible.sy + (view.insetTop - view.insetBottom) / (2 * view.zoom) };
}

export function easeFactor(rate: number, dt: number, reduced: boolean): number {
  return reduced ? 1 : 1 - Math.exp(-rate * dt);
}
