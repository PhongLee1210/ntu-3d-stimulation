import { Color, Vector3 } from "three";

import type { CampusTheme, LightPreset } from "~/features/theme/schema";

import type { Bake, Phase } from "../sky";

const WHITE = new Color(1, 1, 1);

const mul = (c: Color, k: number) => c.clone().multiplyScalar(k);
const lerpW = (c: Color, t: number) => c.clone().lerp(WHITE, t);
const lerp = (a: Color, b: Color, t: number) => a.clone().lerp(b, t);
const full = (c: Color) => c.multiplyScalar(1 / Math.max(c.r, c.g, c.b));
const luminance = (c: Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
const grey = (c: Color) => new Color(luminance(c), luminance(c), luminance(c));
const UP = new Vector3(0, 1, 0);

export function desaturate(c: Color): Color {
  const y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return c
    .clone()
    .lerp(new Color(y, y, y), 0.7)
    .multiplyScalar(0.97);
}

const VIEW = new Vector3(1, 1, 1).normalize();

export interface Light {
  sun: Vector3;
  sunColor: Color;
  sky: Color;
  ground: Color;
  rim: number;
}

export function light(preset: LightPreset): Light {
  const coefficient = (hex: string, intensity: number) =>
    new Color(hex).multiplyScalar(intensity / Math.PI);
  return {
    sun: new Vector3(...preset.sunDirection).normalize(),
    sunColor: coefficient(preset.sun, preset.sunIntensity),
    sky: coefficient(preset.sky, preset.hemisphere),
    ground: coefficient(preset.ground, preset.hemisphere),
    rim: preset.rim,
  };
}

export function shade(n: Vector3, l: Light, out = new Color()): Color {
  const sun = Math.max(0, n.dot(l.sun));
  const up = 0.5 + 0.5 * n.y;
  const direct = sun * (1 + l.rim * (1 - Math.max(0, n.dot(VIEW))) ** 2);
  const north = 1 - 0.2 * Math.max(0, -n.z) * (1 - Math.abs(n.y));
  return out.setRGB(
    Math.min(1, l.ground.r + (l.sky.r - l.ground.r) * up + l.sunColor.r * direct) * north,
    Math.min(1, l.ground.g + (l.sky.g - l.ground.g) * up + l.sunColor.g * direct) * north,
    Math.min(1, l.ground.b + (l.sky.b - l.ground.b) * up + l.sunColor.b * direct) * north,
  );
}

function shadowFactor(l: Light): Color {
  const top = shade(new Vector3(0, 1, 0), l);
  const turned = l.sky.clone().lerp(l.ground, 0.5);
  return new Color(
    Math.min(1, turned.r / top.r),
    Math.min(1, turned.g / top.g),
    Math.min(1, turned.b / top.b),
  );
}

const WEATHER: Record<
  Bake,
  { sun: number; sky: number; grey: number; wet: number; sunShade: boolean }
> = {
  clear: { sun: 1, sky: 1, grey: 0, wet: 0, sunShade: true },
  partly: { sun: 0.9, sky: 0.95, grey: 0.15, wet: 0, sunShade: true },
  overcast: { sun: 0.9, sky: 0.88, grey: 0.55, wet: 0, sunShade: false },
  damp: { sun: 0.9, sky: 0.84, grey: 0.55, wet: 0.5, sunShade: false },
  wet: { sun: 0.9, sky: 0.8, grey: 0.6, wet: 1, sunShade: false },
};

function greyHex(hex: string, t: number): string {
  const c = new Color(hex);
  const y = luminance(c);
  return `#${c.lerp(new Color(y, y, y), t).getHexString()}`;
}

export function weatherPreset(preset: LightPreset, bake: Bake): LightPreset {
  if (bake === "clear") return preset;
  const w = WEATHER[bake];
  return {
    ...preset,
    sky: greyHex(preset.sky, w.grey),
    ground: greyHex(preset.ground, w.grey),
    hemisphere: preset.hemisphere * w.sky,
    sunIntensity: preset.sunIntensity * w.sun,
    rim: preset.rim * w.sun,
  };
}

export interface BuildingPalette {
  wall: Color;
  trim: Color;
  roof: Color;
}

export type Palette = ReturnType<typeof palette>;

export function palette(campus: CampusTheme, phase: Phase = "day", bake: Bake = "clear") {
  const c = (hex: string) => new Color(hex);
  const building = (b: { wall: string; trim: string; roof: string }): BuildingPalette => ({
    wall: c(b.wall),
    trim: c(b.trim),
    roof: c(b.roof),
  });
  const preset = weatherPreset(campus.lights[phase], bake);
  const weather = WEATHER[bake];
  const paving = 1 - 0.22 * weather.wet;
  const ground = mul(c(campus.ground), 1 - 0.1 * weather.wet);
  const water = c(campus.water);
  const foliage = c(campus.foliage);
  const trunk = c(campus.trunk);
  const npc = c(campus.npc);
  const lm = {
    wall: c(campus.landmark.wall),
    trim: c(campus.landmark.trim),
    roof: c(campus.landmark.roof),
    accent: c(campus.landmark.accent),
  };
  const mk = building(campus.buildings.market);
  const wt = building(campus.buildings.watchtower);
  const band = mul(lm.trim, 0.5 * paving);
  const path = mul(c(campus.path), paving);
  const sunlight = light(preset);
  const shadow = shadowFactor(sunlight);
  const soil = mul(ground, 0.45);
  const darkness = Math.min(1, Math.max(0, (0.7 - luminance(shade(UP, sunlight))) / 0.5));
  const lit =
    phase === "dusk"
      ? full(lerp(lm.accent, c(campus.lights.dusk.sun), 0.5))
      : lerpW(lm.accent, 0.2);
  const player = c(campus.player);
  return {
    light: sunlight,
    preset,
    darkness,
    sunShade: weather.sunShade,
    ground,
    path,
    plaza: mul(c(campus.plaza), paving),
    water,
    foliage,
    trunk,
    player,
    npc,
    lm,
    lib: building(campus.buildings.library),
    wt,
    mk,
    soil,
    subsoil: lerp(soil, trunk, 0.35),
    mow: mul(ground, 0.925),
    kerb: mul(lm.trim, 0.92 * paving),
    deep: mul(water, 0.78),
    glass: mul(water, 0.45),
    lit,
    litDim: mul(lit, 0.62),
    figureLift: 1 + 0.6 * darkness,
    glow: mul(lit, 0.45 * darkness),
    ring: darkness >= 0.5 ? lerpW(player, 0.55) : player,
    waterHi: lerpW(water, 0.35),
    dark: mul(trunk, 0.35),
    lanSkirt: mul(npc, 0.45),
    pants: mul(player, 0.45),
    xray: lerpW(player, 0.45),
    cypress: mul(foliage, 0.82),
    band,
    hedge: mul(foliage, 0.7),
    bloom: mul(lerpW(mk.roof, 0.35), 0.85),
    track: mul(lerpW(mk.roof, 0.06), 0.72 * paving),
    vault: lerp(lm.roof, water, 0.35),
    solar: lerpW(wt.roof, 0.03),
    sand: mul(path, 0.8),
    court: mul(water, 0.78 * paving),
    asphalt: mul(band, 0.42),
    park: lerp(ground, trunk, 0.12),
    iron: mul(lm.trim, 0.06),
    shadow,
    ao: lerpW(lerp(shadow, grey(shadow), 0.5), 0.2),
    foam: lerpW(water, 0.6),
  };
}
