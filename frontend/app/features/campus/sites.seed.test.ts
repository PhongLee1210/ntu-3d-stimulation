import { readFileSync } from "node:fs";
import path from "node:path";

import * as v from "valibot";
import { describe, expect, it } from "vitest";

import { ZoneContentSchema } from "~/features/zones/schema";

import { DEFAULT_STATUS } from "./sites";

describe("the campus fallback status", () => {
  it("matches the zones.json seed for every building", () => {
    const seed = v.parse(
      ZoneContentSchema,
      JSON.parse(
        readFileSync(
          path.resolve(
            process.cwd(),
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
      ),
    );
    const fromSeed = Object.fromEntries(seed.zones.map((zone) => [zone.location, zone.status]));
    expect(DEFAULT_STATUS).toEqual(fromSeed);
  });
});
