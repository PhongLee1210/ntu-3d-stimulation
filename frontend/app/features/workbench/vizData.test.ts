import { describe, expect, it } from "vitest";

import {
  articleStrip,
  cutSentence,
  focusArticle,
  parseViz,
  variantKey,
  type VizData,
} from "./vizData";
import { readText } from "./test-fixtures";

const data = (
  text: string,
  articles: [number, number, number][],
  cuts: [number, number][],
  inForce = true,
) =>
  ({
    corpus: { d: text },
    articles: { d: articles },
    in_force: { d: inForce },
    strips: { v: cuts.map(([s, e]) => ["d", 0, [], s, e, e - s, inForce]) },
    ranks: {},
  }) as unknown as VizData;

describe("articleStrip", () => {
  const text = "A".repeat(300);

  it("counts a cut that lands inside the article, whichever article it was filed under", () => {
    const strip = articleStrip(
      data(
        text,
        [
          [1, 0, 80],
          [2, 80, 200],
        ],
        [
          [0, 100],
          [100, 200],
        ],
      ),
      "v",
      "d",
      2,
    );
    expect(strip?.cuts).toEqual([100]);
  });

  it("ignores a boundary that falls on the article's own edge, which cuts nothing", () => {
    const strip = articleStrip(
      data(
        text,
        [
          [1, 0, 100],
          [2, 100, 200],
        ],
        [
          [0, 100],
          [100, 200],
        ],
      ),
      "v",
      "d",
      2,
    );
    expect(strip?.cuts).toEqual([]);
  });

  it("carries the article's own text, so the strip can draw the cuts against it", () => {
    const strip = articleStrip(data("0123456789", [[1, 2, 8]], [[0, 10]]), "v", "d", 1);
    expect(strip?.text).toBe("234567");
    expect(strip?.start).toBe(2);
  });

  it("has nothing to draw for an article the document does not hold", () => {
    expect(articleStrip(data(text, [[1, 0, 100]], [[0, 100]]), "v", "d", 99)).toBeNull();
  });

  it("has nothing to draw for a variant nobody built", () => {
    expect(articleStrip(data(text, [[1, 0, 100]], [[0, 100]]), "nope", "d", 1)).toBeNull();
  });

  it("returns the cuts in reading order, with repeats collapsed", () => {
    const strip = articleStrip(
      data(
        "A".repeat(300),
        [[1, 0, 200]],
        [
          [0, 150],
          [100, 50],
          [40, 150],
          [0, 100],
        ],
      ),
      "v",
      "d",
      1,
    );
    expect(strip?.cuts).toEqual([50, 100, 150]);
  });

  it("reports an out-of-force document as such, defaulting to in force when unsaid", () => {
    expect(articleStrip(data(text, [[1, 0, 100]], [[0, 50]], false), "v", "d", 1)?.inForce).toBe(
      false,
    );
  });
});

describe("cutSentence", () => {
  const text = "Câu một. Câu hai dài hơn. Câu ba.";

  it("finds the sentence a cut lands inside, and says where it was cut", () => {
    const cut = cutSentence(text, 0, 16);
    expect(cut?.text).toBe("Câu hai dài hơn.");
    expect(cut?.at).toBe(16);
  });

  it("says nothing when the cut falls on a sentence boundary, which is the good case", () => {
    expect(cutSentence(text, 0, 9)).toBeNull();
  });

  it("says nothing for a cut that falls just before the full stop", () => {
    expect(cutSentence(text, 0, 24)).toBeNull();
  });

  it("says nothing for a cut at the very end of the text", () => {
    expect(cutSentence(text, 0, text.length)).toBeNull();
  });

  it("counts a newline as a boundary: a clause break is not a severed sentence", () => {
    expect(cutSentence("Khoản một\nKhoản hai", 0, 10)).toBeNull();
  });

  it("reads offsets against the whole document, not the slice handed in", () => {
    const strip = cutSentence(text.slice(9), 9, 16);
    expect(strip?.text).toBe("Câu hai dài hơn.");
  });
});

describe("variantKey", () => {
  it("builds the key the static data is filed under, from the bench's own knobs", () => {
    expect(variantKey({ strategy: "theo_dieu", chunk_size: 512, overlap_pct: 10 })).toBe(
      "theo_dieu-512-10",
    );
  });

  it("has no key for a chunker whose knobs are not all set", () => {
    expect(variantKey({ strategy: "co_dinh", chunk_size: 128 })).toBeNull();
    expect(variantKey({})).toBeNull();
  });

  it("has no key for a knob of the wrong kind, rather than a key that cannot exist", () => {
    expect(variantKey({ strategy: 7, chunk_size: 128, overlap_pct: 0 })).toBeNull();
  });
});

describe("focusArticle", () => {
  const real = JSON.parse(readText("public", "viz", "chunk-tuning.json")) as VizData;

  it("names the article the top-ranked chunk sits in, and its document", () => {
    expect(focusArticle(real, "theo_dieu-512-10", "lib-l2-v01")).toEqual({
      docId: "qcdt-2024",
      dieu: 12,
    });
    expect(focusArticle(real, "co_dinh-512-0", "lib-l2-v01")).toEqual({
      docId: "qcdt-2024",
      dieu: 11,
    });
  });

  it("names nothing for a case the data does not rank", () => {
    expect(focusArticle(real, "theo_dieu-512-10", "lib-l2-h01")).toBeNull();
  });

  it("names nothing for a variant nobody built", () => {
    expect(focusArticle(real, "nope", "lib-l2-v01")).toBeNull();
  });
});

describe("the document is part of an article's identity (audit blocker)", () => {
  const real = JSON.parse(readText("public", "viz", "chunk-tuning.json")) as VizData;

  it("favours the document the search pointed at, not the first that owns the number", () => {
    expect(focusArticle(real, "co_dinh-128-0", "lib-l2-v01")).toEqual({
      docId: "qcdt-2019",
      dieu: 10,
    });
  });

  it("draws the article of the document it was given, never a namesake", () => {
    const stale = articleStrip(real, "co_dinh-128-0", "qcdt-2019", 10);
    const inForce = articleStrip(real, "co_dinh-128-0", "qcdt-2024", 10);
    expect(stale?.text.startsWith("Điều 10. Bảo lưu kết quả học tập")).toBe(true);
    expect(inForce?.text.startsWith("Điều 10. Khối lượng học tập")).toBe(true);
    expect(stale?.start).not.toBe(inForce?.start);
  });

  it("says whether the article it drew is still in force, which is L2's own trap", () => {
    expect(articleStrip(real, "co_dinh-128-0", "qcdt-2019", 10)?.inForce).toBe(false);
    expect(articleStrip(real, "co_dinh-128-0", "qcdt-2024", 10)?.inForce).toBe(true);
  });

  it("can reach qcdt-2019's articles at all, which number-only lookup never could", () => {
    for (const dieu of [1, 5, 10, 16]) {
      expect(articleStrip(real, "theo_dieu-512-10", "qcdt-2019", dieu)).not.toBeNull();
    }
  });

  it("has nothing to draw for a document the level's corpus does not hold", () => {
    expect(articleStrip(real, "theo_dieu-512-10", "qcdt-1999", 10)).toBeNull();
  });
});

describe("a piece is made by a cut inside the article, not by a chunk lapping it", () => {
  const real = JSON.parse(readText("public", "viz", "chunk-tuning.json")) as VizData;

  it("calls an article whole when no cut lands inside it, however many chunks lap it", () => {
    const strip = articleStrip(real, "co_dinh-512-10", "qcdt-2019", 10);
    expect(strip?.cuts).toEqual([]);
  });

  it("counts one cut per distinct boundary inside the article", () => {
    const strip = articleStrip(real, "co_dinh-128-0", "qcdt-2019", 10);
    expect(strip?.cuts).toHaveLength(2);
    for (const at of strip?.cuts ?? []) {
      expect(at).toBeGreaterThan(strip?.start ?? 0);
      expect(at).toBeLessThan(strip?.end ?? 0);
    }
  });

  it("keeps the cuts in reading order, with no duplicates from overlapping chunks", () => {
    const strip = articleStrip(real, "co_dinh-128-20", "qcdt-2019", 10);
    const cuts = strip?.cuts ?? [];
    expect(cuts).toEqual([...new Set(cuts)].sort((a, b) => a - b));
    expect(cuts.length).toBeGreaterThan(0);
  });
});

describe("parseViz, the one gate on a shipped data file", () => {
  const real = JSON.parse(readText("public", "viz", "chunk-tuning.json")) as Record<
    string,
    unknown
  >;

  it("accepts the file the exporter writes for this level and version", () => {
    expect(parseViz("chunk-tuning", 1, real)?.in_force).toEqual({
      "qcdt-2024": true,
      "qcdt-2019": false,
    });
  });

  it.each(["format", "level", "level_version"])("refuses a wrong %s", (key) => {
    expect(parseViz("chunk-tuning", 1, { ...real, [key]: "wrong" })).toBeNull();
  });

  it.each(["corpus", "articles", "in_force", "strips", "ranks"])(
    "refuses a file with no %s, which would throw on first access instead",
    (key) => {
      const without = Object.fromEntries(Object.entries(real).filter(([k]) => k !== key));
      expect(parseViz("chunk-tuning", 1, without)).toBeNull();
    },
  );

  it("refuses junk rather than throwing at the caller", () => {
    for (const junk of [null, undefined, 7, "no", [], { format: 1 }]) {
      expect(parseViz("chunk-tuning", 1, junk)).toBeNull();
    }
  });

  it("refuses another level's file, and an older version of this one", () => {
    const other = JSON.parse(readText("public", "viz", "grounded-citation.json")) as unknown;
    expect(parseViz("chunk-tuning", 1, other)).toBeNull();
    expect(parseViz("chunk-tuning", 2, real)).toBeNull();
  });
});
