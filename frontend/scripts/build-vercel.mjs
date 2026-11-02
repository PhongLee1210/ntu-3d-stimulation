import { execSync } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildRoutes } from "./vercel-routes.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = path.join(root, "build", "client");
const outDir = path.join(root, ".vercel", "output");
const staticDir = path.join(outDir, "static");

const apiOrigin = process.env.VG_API_ORIGIN;
if (!apiOrigin)
  throw new Error("Set VG_API_ORIGIN to the backend origin, e.g. https://x.onrender.com");
const api = new URL(apiOrigin);
if (api.protocol !== "https:" || api.pathname !== "/" || api.search) {
  throw new Error(`VG_API_ORIGIN must be a bare https origin, got ${apiOrigin}`);
}

const env = {
  ...process.env,
  VITE_THEME_PACKS: process.env.VITE_THEME_PACKS ?? "town",
  VITE_DEFAULT_THEME: process.env.VITE_DEFAULT_THEME ?? "town",
};
execSync("npm run build", { cwd: root, stdio: "inherit", env });

const packs = env.VITE_THEME_PACKS.split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const HOST_FILES = new Set(["_headers", "_redirects"]);

await rm(outDir, { recursive: true, force: true });
await mkdir(staticDir, { recursive: true });
await cp(clientDir, staticDir, {
  recursive: true,
  filter: (source) => !HOST_FILES.has(path.basename(source)),
});

if (packs.length > 0) {
  const themesDir = path.join(staticDir, "themes");
  for (const entry of await readdir(themesDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !packs.includes(entry.name)) {
      await rm(path.join(themesDir, entry.name), { recursive: true });
    }
  }
  const indexFile = path.join(themesDir, "index.json");
  const index = JSON.parse(await readFile(indexFile, "utf8"));
  const kept = index.themes.filter((theme) => packs.includes(theme.id));
  await writeFile(indexFile, `${JSON.stringify({ ...index, themes: kept }, null, 2)}\n`);
}

const security = JSON.parse(
  await readFile(path.join(root, "build", "security-headers.json"), "utf8"),
);
const config = { version: 3, routes: buildRoutes({ apiOrigin: api.origin, security }) };
await writeFile(path.join(outDir, "config.json"), `${JSON.stringify(config, null, 2)}\n`);

console.warn(
  `Vercel output: /api -> ${api.origin}; theme packs: ${packs.length ? packs.join(", ") : "all"}.`,
);
