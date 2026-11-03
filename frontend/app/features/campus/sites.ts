import { hasStar, STARS_SAVED, type Progress } from "~/features/progress/progress";
import type { ZoneLocation, ZoneStatus, ZoneSummary } from "~/features/zones/schema";

import type { CampusLayout, NpcId, Speaker, Vec2 } from "./layout";

export const DEFAULT_STATUS: Readonly<Record<ZoneLocation, ZoneStatus>> = {
  library: "open",
  watchtower: "open",
  market: "coming_soon",
};

const FALLBACK_NAME: Readonly<Record<ZoneLocation, string>> = {
  library: "Thư viện",
  watchtower: "Tháp canh",
  market: "Chợ model",
};

export const FIRST_LIBRARY_LEVEL = "grounded-citation";

export interface SiteInfo {
  location: ZoneLocation;
  zoneId: string;
  name: string;
  status: ZoneStatus;
  zone: ZoneSummary | null;
}

export type SiteInfoMap = Readonly<Record<ZoneLocation, SiteInfo>>;

export function siteInfo(zones: readonly ZoneSummary[] | null): SiteInfoMap {
  const entry = (location: ZoneLocation): SiteInfo => {
    const zone = zones?.find((candidate) => candidate.location === location) ?? null;
    return {
      location,
      zoneId: zone?.id ?? location,
      name: zone?.name ?? FALLBACK_NAME[location],
      status: zone?.status ?? DEFAULT_STATUS[location],
      zone,
    };
  };
  return { library: entry("library"), watchtower: entry("watchtower"), market: entry("market") };
}

export type SiteLook = "coming_soon" | "open" | "lit";

export function siteLook(status: ZoneStatus, starred: boolean): SiteLook {
  if (status !== "open") return "coming_soon";
  return starred ? "lit" : "open";
}

export function siteLooks(
  sites: SiteInfoMap,
  progress: Progress,
  starsSaved = STARS_SAVED,
): Record<ZoneLocation, SiteLook> {
  const look = ({ status, zoneId }: SiteInfo) =>
    siteLook(status, !starsSaved || hasStar(progress, zoneId));
  return {
    library: look(sites.library),
    watchtower: look(sites.watchtower),
    market: look(sites.market),
  };
}

export type InteractTarget = Speaker | ZoneLocation;

interface InteractPoint {
  id: InteractTarget;
  door: Vec2;
}

const interactPointsCache = new WeakMap<CampusLayout, readonly InteractPoint[]>();

export function interactPoints(layout: CampusLayout): readonly InteractPoint[] {
  let points = interactPointsCache.get(layout);
  if (!points) {
    points = [
      ...layout.speakers.map(({ id, spot }) => ({ id, door: spot })),
      ...layout.sites.map((site) => ({ id: site.id, door: site.door })),
    ];
    interactPointsCache.set(layout, points);
  }
  return points;
}

const SPEAKER_IDS: ReadonlySet<string> = new Set<Speaker>([
  "lan",
  "registrar",
  "guard",
  "examiner",
  "operator",
]);

export const isSpeaker = (target: InteractTarget): target is Speaker => SPEAKER_IDS.has(target);

export type NpcNames = Readonly<Record<NpcId, { name: string }>>;

export interface Hint {
  text: string;
  actionable: boolean;
}

export function hintFor(target: InteractTarget, sites: SiteInfoMap, npcs: NpcNames): Hint {
  if (isSpeaker(target)) {
    const name = target === "lan" ? "cô Lan" : npcs[target].name;
    return { text: `Nhấn E hoặc chạm để nói chuyện với ${name}`, actionable: true };
  }
  const site = sites[target];
  return site.status === "open"
    ? { text: `Nhấn E để vào ${site.name}`, actionable: true }
    : { text: `${site.name} · Sắp mở`, actionable: false };
}
