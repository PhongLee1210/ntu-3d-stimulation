import { ApiError, getJson } from "~/lib/api";

import { ZoneListResponseSchema, ZoneSchema, type Zone, type ZoneSummary } from "./schema";

export async function fetchZones(signal?: AbortSignal): Promise<ZoneSummary[]> {
  const { zones } = await getJson("/api/zones", ZoneListResponseSchema, signal);
  return zones;
}

export function fetchZone(zoneId: string, signal?: AbortSignal): Promise<Zone> {
  return getJson(`/api/zones/${encodeURIComponent(zoneId)}`, ZoneSchema, signal);
}

export type ZoneListResult = { ok: true; zones: ZoneSummary[] } | { ok: false };

export async function loadZoneList(): Promise<ZoneListResult> {
  try {
    return { ok: true, zones: await fetchZones() };
  } catch {
    return { ok: false };
  }
}

export type ZonePageData =
  | { kind: "open"; zone: Zone }
  | { kind: "locked"; zone: Zone }
  | { kind: "not-found" }
  | { kind: "error" };

const ZONE_ID = /^[a-z][a-z0-9-]{1,31}$/;

export async function loadZonePage(zoneId: string | undefined): Promise<ZonePageData> {
  if (!zoneId || !ZONE_ID.test(zoneId)) return { kind: "not-found" };
  try {
    const zone = await fetchZone(zoneId);
    return zone.status === "open" ? { kind: "open", zone } : { kind: "locked", zone };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { kind: "not-found" };
    return { kind: "error" };
  }
}
