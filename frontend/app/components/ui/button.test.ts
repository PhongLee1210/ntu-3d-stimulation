import { describe, expect, it } from "vitest";

import { buttonClass } from "./button";

describe("buttonClass", () => {
  it("lets the control grow for a label that wraps, instead of clipping it", () => {
    expect(buttonClass("primary")).toContain("min-h-11");
    expect(buttonClass("primary")).not.toMatch(/(?<!min-)h-11\b/);
  });

  it("still renders one line tall for a label that fits, so nothing else moves", () => {
    expect(buttonClass("inline")).toContain("min-h-11");
  });
});
