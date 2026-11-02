export const PROGRESS_KEY = "vg-progress-v1";

export const STARS_SAVED = true as boolean;

export type Stars = 0 | 1 | 2 | 3;
export type Progress = Readonly<Record<string, Readonly<Record<string, Stars>>>>;

const ID = /^[a-z][a-z0-9-]{1,31}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isStars = (value: unknown): value is Stars =>
  value === 0 || value === 1 || value === 2 || value === 3;
const own = <T>(map: Readonly<Record<string, T>> | undefined, key: string): T | undefined =>
  map && Object.hasOwn(map, key) ? map[key] : undefined;

function clean(data: unknown): Record<string, Record<string, Stars>> {
  const progress = Object.create(null) as Record<string, Record<string, Stars>>;
  if (!isRecord(data)) return progress;
  for (const [zoneId, levels] of Object.entries(data)) {
    if (!ID.test(zoneId) || !isRecord(levels)) continue;
    for (const [levelId, stars] of Object.entries(levels)) {
      if (!ID.test(levelId) || !isStars(stars)) continue;
      (progress[zoneId] ??= Object.create(null) as Record<string, Stars>)[levelId] = stars;
    }
  }
  return progress;
}

export function readProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? clean(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function recordStars(zoneId: string, levelId: string, stars: Stars): Progress {
  if (!ID.test(zoneId) || !ID.test(levelId) || !isStars(stars)) {
    throw new Error(`Invalid progress entry: ${zoneId}/${levelId} = ${String(stars)}`);
  }
  const progress = clean(readProgress());
  const zone = own(progress, zoneId) ?? {};
  if ((own(zone, levelId) ?? -1) >= stars) return progress;
  progress[zoneId] = { ...zone, [levelId]: stars };
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
  return progress;
}

export function levelStars(progress: Progress, zoneId: string, levelId: string): Stars {
  return own(own(progress, zoneId), levelId) ?? 0;
}

export function hasStar(progress: Progress, zoneId: string): boolean {
  return Object.values(own(progress, zoneId) ?? {}).some((stars) => stars >= 1);
}
