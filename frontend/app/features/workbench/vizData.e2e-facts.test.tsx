import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { starterBench } from "./bench";

import { articleStrip, cutSentence, focusArticle, type VizData } from "./vizData";
import { Strip } from "./Strip";
import { readText, testEnv } from "./test-fixtures";
import { WorkbenchPage } from "./WorkbenchPage";

const l2 = JSON.parse(readText("public", "viz", "chunk-tuning.json")) as VizData;

function facts(variant: string) {
  const ref = focusArticle(l2, variant, "lib-l2-v01");
  if (ref === null) return null;
  const strip = articleStrip(l2, variant, ref.docId, ref.dieu);
  if (strip === null) return null;
  const severed = strip.cuts
    .map((at) => cutSentence(strip.text, strip.start, at))
    .filter((c) => c !== null);
  return {
    docId: ref.docId,
    dieu: ref.dieu,
    inForce: strip.inForce,
    pieces: strip.cuts.length + 1,
    severed: severed.length,
  };
}

describe("the facts e2e/workbench.spec.ts asserts about the blade's strip", () => {
  it("the L2 starter favours the superseded Điều 10, in 3 pieces, 2 severed", () => {
    expect(facts("co_dinh-128-0")).toEqual({
      docId: "qcdt-2019",
      dieu: 10,
      inForce: false,
      pieces: 3,
      severed: 2,
    });
  });

  it("the reference blade favours the in-force Điều 12, whole, nothing severed", () => {
    expect(facts("theo_dieu-512-10")).toEqual({
      docId: "qcdt-2024",
      dieu: 12,
      inForce: true,
      pieces: 1,
      severed: 0,
    });
  });

  it("keeps the two apart: a fixed cut hides Điều 12 inside a piece filed under Điều 11", () => {
    expect(focusArticle(l2, "co_dinh-512-0", "lib-l2-v01")).toEqual({
      docId: "qcdt-2024",
      dieu: 11,
    });
  });
});
describe("the locators e2e/workbench.spec.ts uses on the blade", () => {
  function page() {
    const l2 = testEnv("chunk-tuning");
    const starter = starterBench(l2);
    if (!starter) throw new Error("L2 starter is not drawable");
    return render(
      <MemoryRouter>
        <WorkbenchPage env={l2} starter={starter} back="/play/library" />
      </MemoryRouter>,
    );
  }

  afterEach(cleanup);

  it.each([
    [/Cách chia/, "Bám điều, khoản"],
    [/Chồng lấp/, "10 %"],
  ])("group %s holds exactly one option reading %s", (group, option) => {
    page();
    const fieldset = screen.getByRole("group", { name: group });
    expect(within(fieldset).getAllByText(option, { exact: true })).toHaveLength(1);
  });

  it("offers the chunk size as one slider over its four stops", () => {
    page();
    const blade = screen.getByRole("slider", { name: /Cỡ đoạn/ });
    expect(blade.getAttribute("min")).toBe("0");
    expect(blade.getAttribute("max")).toBe("3");
  });

  it("hides the radio behind its own label, which is why .check() cannot be used", () => {
    page();
    const fieldset = screen.getByRole("group", { name: /Cách chia/ });
    const radio = within(fieldset).getAllByRole("radio")[0];
    expect(radio?.className).toContain("sr-only");
    expect(radio?.closest("label")).not.toBeNull();
  });
});

describe("what the spec reads off the strip at both widths", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function viewport(narrow: boolean) {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: narrow && query.includes("max-width"),
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
  }

  function drawStrip(variant: string, narrow: boolean) {
    viewport(narrow);
    const ref = focusArticle(l2, variant, "lib-l2-v01");
    if (ref === null) throw new Error(`${variant} ranks nothing`);
    const strip = articleStrip(l2, variant, ref.docId, ref.dieu);
    if (strip === null) throw new Error(`${variant} has no ${ref.docId} Điều ${ref.dieu}`);
    render(<Strip strip={strip} variant={variant} />);
    return ref.dieu;
  }

  it.each([false, true])("names the figure exactly once, narrow=%s", (narrow) => {
    const dieu = drawStrip("co_dinh-128-0", narrow);
    const figures = screen
      .getAllByRole("figure")
      .filter((f) => f.textContent.includes(`Dải đoạn Điều ${dieu}`));
    expect(figures).toHaveLength(1);
  });

  it("hides the drawn bar and its caption lines on a narrow screen", () => {
    drawStrip("co_dinh-128-0", true);
    expect(document.querySelectorAll("[data-strip-piece]")).toHaveLength(0);
    expect(screen.queryByText("Điều 10 được chia thành 3 đoạn.", { exact: false })).toBeNull();
    expect(screen.getByRole("table")).toBeDefined();
  });

  function table(narrow: boolean) {
    const toTable = screen.queryByRole("button", { name: "Xem dạng bảng" });
    expect(toTable === null).toBe(narrow);
    if (toTable) fireEvent.click(toTable);
    return screen.getByRole("table");
  }

  it.each([false, true])("says the document is superseded at narrow=%s too", (narrow) => {
    drawStrip("co_dinh-128-0", narrow);
    const figure = screen.getAllByRole("figure")[0];
    expect(figure?.textContent).toContain("văn bản hết hiệu lực");
  });

  it.each([false, true])("says nothing of the sort for the in-force document, narrow=%s", (n) => {
    drawStrip("theo_dieu-512-10", n);
    expect(screen.getAllByRole("figure")[0]?.textContent).not.toContain("hết hiệu lực");
  });

  it.each([false, true])("gives the starter 3 piece rows and a severed cell, narrow=%s", (n) => {
    drawStrip("co_dinh-128-0", n);
    const rows = table(n);
    expect(rows.querySelectorAll("tr")).toHaveLength(4);
    expect(rows.textContent).toContain("«");
  });

  it.each([false, true])("gives the reference blade 1 row and nothing severed, narrow=%s", (n) => {
    drawStrip("theo_dieu-512-10", n);
    const rows = table(n);
    expect(rows.querySelectorAll("tr")).toHaveLength(2);
    expect(rows.textContent).not.toContain("«");
    expect(rows.textContent).toContain("Không");
  });
});
