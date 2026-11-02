import { describe, expect, it } from "vitest";

import { buildRoutes } from "./vercel-routes.mjs";

const routes = () => buildRoutes({ apiOrigin: "https://api.example", security: { "X-A": "b" } });
const cacheRuleCovering = (group) =>
  routes().find((r) => r.headers?.["Cache-Control"] && r.src.includes(group));

describe("Vercel cache rules", () => {
  it("caches the baked model data, which is 200 kB that changes only when the bake script runs", () => {
    expect(cacheRuleCovering("models")?.headers["Cache-Control"]).toMatch(/max-age=[1-9]/);
  });

  it("caches the recorded static runs the workbench plays while the API sleeps", () => {
    expect(cacheRuleCovering("runs")?.headers["Cache-Control"]).toMatch(/max-age=[1-9]/);
  });

  it("keeps hashed assets immutable and everything else revalidating", () => {
    expect(cacheRuleCovering("assets")?.headers["Cache-Control"]).toContain("immutable");
    const catchAll = routes().find((r) => r.src === "^/(.*)$" && r.headers);
    expect(catchAll?.headers["Cache-Control"]).toBeUndefined();
  });

  it("proxies the API to the configured origin and nowhere else", () => {
    const api = routes().find((r) => r.dest?.includes("/api/"));
    expect(api?.dest).toBe("https://api.example/api/$1");
  });
});
