import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = import.meta.dirname;

const moduleName = (file: string) => file.split(".")[0] ?? file;

function collisions(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const byKey = new Map<string, string[]>();
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    const key = moduleName(entry.name).toLowerCase();
    byKey.set(key, [...(byKey.get(key) ?? []), entry.name]);
  }
  const here = [...byKey.values()]
    .filter((files) => new Set(files.map(moduleName)).size > 1)
    .map((files) => `${path.relative(root, dir) || "."}: ${files.join(", ")}`);
  const nested = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => collisions(path.join(dir, entry.name)));
  return [...here, ...nested];
}

describe("module names", () => {
  it("never differ only by case within one folder", () => {
    expect(collisions(root)).toEqual([]);
  });
});
