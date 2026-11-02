import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { History } from "./History";
import type { RunMark } from "./storage";

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

const mark = (at: number, stars: 0 | 1 | 2 | 3, verdicts: [number, boolean][]): RunMark => ({
  body: `{"at":${at}}`,
  at,
  stars,
  tokens: 100,
  budget: 3000,
  cases: verdicts.map(([n, passed]) => ({ n, role: "visible" as const, passed })),
});

const grid = () =>
  [...document.querySelectorAll("[data-run-row]")].map((row) =>
    [...row.querySelectorAll("[data-cell]")].map(
      (cell) => `${cell.getAttribute("data-cell")}:${cell.textContent}`,
    ),
  );

describe("History", () => {
  it("draws a row per run and a column per case, newest run on top", () => {
    viewport(false);
    render(
      <History
        runs={[
          mark(2, 0, [
            [1, true],
            [2, false],
          ]),
          mark(1, 1, [
            [1, true],
            [2, true],
          ]),
        ]}
      />,
    );
    expect(grid()).toEqual([
      ["pass:Đạt", "fail:Trượt"],
      ["pass:Đạt", "pass:Đạt"],
    ]);
  });

  it("says a case a run never reached did not run, and not that it failed", () => {
    viewport(false);
    render(
      <History
        runs={[
          mark(2, 0, [[1, true]]),
          mark(1, 1, [
            [1, true],
            [2, true],
          ]),
        ]}
      />,
    );
    expect(grid()[0]).toEqual(["pass:Đạt", "skip:Không chạy"]);
    const [passed, skipped] = [...document.querySelectorAll("[data-cell]")];
    expect(skipped?.className).not.toContain("danger");
    expect(skipped?.className).not.toBe(passed?.className);
  });

  it("gives every cell an icon as well as its colour and its words", () => {
    viewport(false);
    render(
      <History
        runs={[
          mark(1, 1, [
            [1, true],
            [2, false],
          ]),
        ]}
      />,
    );
    const cells = [...document.querySelectorAll("[data-cell]")];
    expect(cells).toHaveLength(2);
    expect(cells.every((c) => c.querySelector("svg") !== null)).toBe(true);
  });

  it("wears the run stamp, because these are the player's own runs", () => {
    viewport(false);
    render(<History runs={[mark(1, 1, [[1, true]])]} />);
    expect(document.querySelector("figure[data-vg-viz]")).not.toBeNull();
    expect(document.body.textContent).toContain("Đo từ lượt của bạn");
  });

  it("offers no form toggle, because the strip is already the table", () => {
    viewport(false);
    render(<History runs={[mark(1, 1, [[1, true]])]} />);
    expect(screen.queryByRole("button", { name: /Xem dạng/ })).toBeNull();
    expect(document.querySelector("figure[data-vg-viz] table")).not.toBeNull();
  });

  it("reads as a table at every width, with a header per case and per run", () => {
    viewport(true);
    render(
      <History
        runs={[
          mark(1, 1, [
            [1, true],
            [2, false],
          ]),
        ]}
      />,
    );
    const heads = [...document.querySelectorAll("thead th")].map((h) => h.textContent);
    expect(heads).toEqual(["Lượt", "Sao", "Câu #1", "Câu #2"]);
    expect(document.querySelector("tbody th")?.textContent).toBe("Lượt 1");
    expect(document.querySelector("tbody td")?.textContent).toBe("1/3");
    expect(document.body.textContent).not.toContain("1/3 sao");
  });

  it("says nothing at all before there is a run behind it", () => {
    viewport(false);
    const { container } = render(<History runs={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("adds no second live region to the page", () => {
    viewport(false);
    const { container } = render(<History runs={[mark(1, 1, [[1, true]])]} />);
    expect(container.querySelectorAll("[aria-live]")).toHaveLength(0);
  });
});

describe("duplicating a remembered configuration", () => {
  const three = [
    { ...mark(3, 0, [[1, false]]), body: '{"top_k":9}' },
    { ...mark(2, 1, [[1, true]]), body: '{"top_k":6}' },
    { ...mark(1, 2, [[1, true]]), body: '{"top_k":3}' },
  ];

  it("hands over the configuration of the row that was pressed, not the newest", () => {
    viewport(false);
    const picked: string[] = [];
    render(<History runs={three} onDuplicate={(m) => picked.push(m.body)} />);
    fireEvent.click(screen.getByRole("button", { name: "Nhân bản cấu hình của lượt 2" }));
    expect(picked).toEqual(['{"top_k":6}']);
  });

  it("gives each row its own name, so three buttons are not one name three times", () => {
    viewport(false);
    render(<History runs={three} onDuplicate={() => undefined} />);
    expect(
      [...document.querySelectorAll("[data-duplicate]")].map((b) => b.getAttribute("aria-label")),
    ).toEqual([
      "Nhân bản cấu hình của lượt 1",
      "Nhân bản cấu hình của lượt 2",
      "Nhân bản cấu hình của lượt 3",
    ]);
  });

  it("offers nothing to press when the page has nowhere to put a configuration", () => {
    viewport(false);
    render(<History runs={three} />);
    expect(document.querySelectorAll("[data-duplicate]")).toHaveLength(0);
  });
});

describe("a strip wider than the screen", () => {
  it("scrolls inside its own region instead of pushing the page sideways", () => {
    viewport(true);
    const ten = mark(
      1,
      1,
      Array.from({ length: 10 }, (_, i) => [i + 1, true] as [number, boolean]),
    );
    const { container } = render(<History runs={[ten]} />);
    const scroller = container.querySelector(".overflow-x-auto");
    expect(scroller?.querySelector("table")).not.toBeNull();
    expect(scroller?.getAttribute("tabindex")).toBe("0");
  });
});

describe("the table at the width that squeezes it", () => {
  it("never lets the table shrink below its natural width", () => {
    viewport(true);
    render(<History runs={[mark(1, 1, [[1, true]])]} />);
    expect(document.querySelector("table")?.className).toContain("w-max");
  });

  it("keeps every header and the duplicate button on one line", () => {
    viewport(true);
    render(
      <History
        runs={[
          mark(1, 1, [
            [1, true],
            [2, false],
          ]),
        ]}
        onDuplicate={() => undefined}
      />,
    );
    const headers = [...document.querySelectorAll("th")];
    const button = document.querySelector("[data-duplicate]");
    for (const el of [...headers, button]) {
      expect(el?.className).toContain("whitespace-nowrap");
    }
  });
});
