import { readFileSync } from "node:fs";
import path from "node:path";

import { test as base, expect, type Page, type Request, type Route } from "@playwright/test";

import type { NpcId } from "../app/features/campus/layout";
import { blocksJson, publicLevelJson, readText } from "../app/features/workbench/test-fixtures";

interface SeedZone {
  id: string;
  status: "open" | "coming_soon";
  levels: unknown[];
  [field: string]: unknown;
}

const seed = JSON.parse(
  readFileSync(
    path.resolve(
      import.meta.dirname,
      "..",
      "..",
      "backend",
      "src",
      "vgame",
      "content",
      "data",
      "zones.json",
    ),
    "utf8",
  ),
) as { zones: SeedZone[] };

export const zoneList = () => ({
  zones: seed.zones.map(({ levels, ...zone }) => ({ ...zone, level_count: levels.length })),
});

export const zoneDetail = (id: string) => seed.zones.find((zone) => zone.id === id);

export const themeIds = (
  JSON.parse(
    readFileSync(path.resolve(import.meta.dirname, "..", "public", "themes", "index.json"), "utf8"),
  ) as { themes: { id: string }[] }
).themes.map((theme) => theme.id);

export const bundleReport = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, "..", "build", "bundle-report.json"), "utf8"),
) as { threeChunks: string[]; sceneChunks: string[] };

interface Reply {
  status: number;
  body?: unknown;
}

export function seedDetail(id: string): Reply {
  const zone = zoneDetail(id);
  return zone ? { status: 200, body: zone } : { status: 404, body: { detail: "Not found" } };
}

export async function mockApi(
  page: Page,
  options: { list?: () => Reply; detail?: (id: string) => Reply } = {},
) {
  const list = options.list ?? (() => ({ status: 200, body: zoneList() }));
  const detail = options.detail ?? seedDetail;
  await page.route("**/api/zones", (route) => {
    const reply = list();
    return route.fulfill({ status: reply.status, json: reply.body ?? { detail: "Lỗi" } });
  });
  await page.route("**/api/zones/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1) ?? "";
    const reply = detail(decodeURIComponent(id));
    return route.fulfill({ status: reply.status, json: reply.body ?? { detail: "Lỗi" } });
  });
}

export const OPEN_METEO = "**/api.open-meteo.com/**";
export const OPEN_METEO_CORS = { "Access-Control-Allow-Origin": "*" } as const;

export const WMO = {
  clear: 0,
  partly_cloudy: 2,
  cloudy: 3,
  fog: 45,
  drizzle: 53,
  rain: 63,
  thunderstorm: 95,
} as const;

export async function fulfillWeather(
  route: Route,
  condition: keyof typeof WMO = "clear",
  temperature = 30,
) {
  const now = await route
    .request()
    .frame()
    .evaluate(() => Date.now())
    .catch(() => Date.now());
  await route.fulfill({
    headers: OPEN_METEO_CORS,
    json: {
      utc_offset_seconds: 0,
      timezone: "GMT",
      current: {
        time: new Date(now).toISOString().slice(0, 16),
        interval: 900,
        temperature_2m: temperature,
        weather_code: WMO[condition],
      },
    },
  });
}

export const test = base.extend<{
  consoleErrors: string[];
  hubDisplay: "day" | "live";
  hubSky: undefined;
}>({
  hubDisplay: ["day", { option: true }],
  hubSky: [
    async ({ page, hubDisplay }, provide) => {
      await page.route(OPEN_METEO, (route) => fulfillWeather(route));
      await page.addInitScript((display) => {
        if (localStorage.getItem("vg-hub-display") === null) {
          localStorage.setItem("vg-hub-display", display);
        }
      }, hubDisplay);
      await provide(undefined);
    },
    { auto: true },
  ],
  consoleErrors: async ({ page }, provide) => {
    await page.route("**/api/health", (route) => route.fulfill({ json: { status: "ok" } }));
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (
        /Failed to load resource: the server responded with a status of (404|409|422|429|500|503)/.test(
          text,
        )
      )
        return;
      errors.push(text);
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      const { hostname, pathname } = new URL(response.url());
      const mockable = pathname.startsWith("/api/") || hostname === "api.open-meteo.com";
      if (response.status() >= 400 && !mockable) {
        errors.push(`${response.status()} ${pathname}`);
      }
    });
    await provide(errors);
  },
});

export { expect };

export async function waitForIdleScene(page: Page, timeout = 15_000) {
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("html[data-frames]")).toBeAttached();
  await expect(page.locator("html[data-scene-busy]")).toHaveCount(0, { timeout });
  return () => page.evaluate(() => Number(document.documentElement.dataset.frames));
}

type Names = Record<NpcId, { name: string }>;

export async function npcNames(page: Page): Promise<Names> {
  const theme = await page.locator("html").getAttribute("data-theme");
  const file = path.resolve(
    import.meta.dirname,
    "..",
    "public",
    "themes",
    `${theme}`,
    "manifest.json",
  );
  return (JSON.parse(readFileSync(file, "utf8")) as { campus: { npcs: Names } }).campus.npcs;
}

export const titleOf = (name: string) => name.charAt(0).toLocaleUpperCase("vi") + name.slice(1);

export const sse = {
  short: () => readText("e2e", "data", "run-l1-short.sse"),
  reference: () => readText("e2e", "data", "run-l1-reference.sse"),
  sample: (pass = true) => {
    const visible = new Set(["lib-l1-v01", "lib-l1-v02", "lib-l1-v03"]);
    const kept = sse
      .reference()
      .split("\n\n")
      .filter((frame) => frame.trim() !== "")
      .flatMap((frame) => {
        const line = frame.split("\n").find((l) => l.startsWith("data:")) ?? "data: {}";
        const data = JSON.parse(line.slice(5)) as Record<string, unknown>;
        if (frame.includes("event: run.scored")) return [];
        if (typeof data.case === "string" && !visible.has(data.case)) return [];
        if (frame.includes("event: run.started")) {
          const cases = (data.cases as { id: string }[]).filter((c) => visible.has(c.id));
          return [reframe(frame, { ...data, scope: "mau", cases })];
        }
        if (frame.includes("event: case.graded")) {
          return [reframe(frame, { ...data, passed: pass, status: pass ? "ok" : "fail" })];
        }
        if (frame.includes("event: run.finished"))
          return [reframe(frame, { ...data, scope: "mau" })];
        return [frame];
      });
    return `${kept.join("\n\n")}\n\n`;
  },
};

const reframe = (frame: string, data: unknown) =>
  frame
    .split("\n")
    .map((line) => (line.startsWith("data:") ? `data: ${JSON.stringify(data)}` : line))
    .join("\n");

export const runId = (n: number) => n.toString(16).padStart(32, "0");

export interface WorkbenchReply extends Reply {
  headers?: Record<string, string>;
}

export interface WorkbenchMock {
  posts: { key: string | null; contentType: string | null; body: string; scope: string | null }[];
  cancels: string[];
  streams: number;
  previews: number;
}

export async function mockWorkbenchApi(
  page: Page,
  options: {
    post?: (
      n: number,
      request: Request,
    ) => WorkbenchReply | undefined | Promise<WorkbenchReply | undefined>;
    events?: (n: number) => string | Promise<string>;
    cancel?: (n: number) => number | Promise<number>;
    preview?: (n: number) => WorkbenchReply | undefined;
    quota?: Record<string, unknown>;
  } = {},
): Promise<WorkbenchMock> {
  await mockApi(page);
  const mock: WorkbenchMock = { posts: [], cancels: [], streams: 0, previews: 0 };
  await page.route("**/api/blocks", (route) => route.fulfill({ json: blocksJson() }));
  await page.route(
    (url) => url.pathname === "/api/quota",
    (route) =>
      route.fulfill({
        json: options.quota ?? {
          cap: 500,
          used: 0,
          remaining: 500,
          resets_at: "2026-11-02T00:00:00+00:00",
          estimate: true,
          reserve_left: 17,
          learner_daily: 999,
        },
      }),
  );
  await page.route(
    (url) => url.pathname === "/api/quota/refund",
    (route) =>
      route.fulfill({
        status: 409,
        json: { code: "not_sample_run", detail: "Chỉ hoàn lượt Thử 3 câu mẫu." },
      }),
  );
  await page.route("**/api/levels/*", (route) => {
    const id = new URL(route.request().url()).pathname.split("/").at(-1) ?? "";
    try {
      return route.fulfill({ json: publicLevelJson(id) });
    } catch {
      return route.fulfill({ status: 404, json: { detail: "Không tìm thấy level." } });
    }
  });
  await page.route(
    (url) => url.pathname === "/api/preview/retrieval",
    async (route) => {
      mock.previews += 1;
      const reply = options.preview?.(mock.previews);
      if (reply === undefined) {
        return route.fulfill({
          json: { case: new URL(route.request().url()).searchParams.get("case"), nodes: {} },
        });
      }
      return route.fulfill({ status: reply.status, json: reply.body ?? {} });
    },
  );
  await page.route(
    (url) => url.pathname === "/api/runs",
    async (route) => {
      const request = route.request();
      mock.posts.push({
        key: request.headers()["idempotency-key"] ?? null,
        contentType: request.headers()["content-type"] ?? null,
        body: request.postData() ?? "",
        scope: new URL(request.url()).searchParams.get("scope"),
      });
      const n = mock.posts.length;
      const reply = (await options.post?.(n, request)) ?? {
        status: 202,
        body: { run_id: runId(n), created: true, issues: [] },
      };
      return route.fulfill({
        status: reply.status,
        json: reply.body ?? {},
        ...(reply.headers ? { headers: reply.headers } : {}),
      });
    },
  );
  await page.route("**/api/runs/*/events", async (route) => {
    mock.streams += 1;
    const body = await (options.events?.(mock.streams) ?? sse.short());
    return route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "cache-control": "no-store" },
      body,
    });
  });
  await page.route("**/api/runs/*/cancel", async (route) => {
    mock.cancels.push(new URL(route.request().url()).pathname.split("/").at(-2) ?? "");
    const status = (await options.cancel?.(mock.cancels.length)) ?? 202;
    return route.fulfill({
      status,
      json: status === 202 ? { cancelled: true } : { detail: "Máy chủ gặp lỗi." },
    });
  });
  return mock;
}
