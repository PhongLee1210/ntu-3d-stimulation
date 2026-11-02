import * as v from "valibot";
import { describe, expect, it } from "vitest";

import { PublicLevelSchema } from "./schema";
import { publicLevelJson } from "./test-fixtures";

describe("PublicLevelSchema", () => {
  it("still reads a level from a backend without the star rules or the info count", () => {
    const old = publicLevelJson("grounded-citation") as Record<string, unknown> & {
      case_counts: Record<string, unknown>;
    };
    delete old.s1_required;
    delete old.s3_forbidden_labels;
    delete old.case_counts.info;
    const level = v.parse(PublicLevelSchema, old);
    expect(level.s1_required).toEqual([]);
    expect(level.s3_forbidden_labels).toEqual([]);
    expect(level.case_counts).toMatchObject({ normal: 8, trap: 2, info: 0 });
  });
});
