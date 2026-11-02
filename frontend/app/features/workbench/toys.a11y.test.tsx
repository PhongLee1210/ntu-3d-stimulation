import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";

import { setAttached, starterBench } from "./bench";
import { Blade } from "./Blade";
import { CitationLedger } from "./CitationLedger";
import { ContextBin } from "./ContextBin";
import { MachineMap } from "./MachineMap";
import { Prism } from "./Prism";
import { Stamps } from "./Stamps";
import { StarDome } from "./StarDome";
import { testEnv } from "./test-fixtures";

afterEach(cleanup);

const STRUCTURAL = [
  "list",
  "th-has-data-cells",
  "td-headers-attr",
  "scope-attr-valid",
  "listitem",
  "aria-required-children",
  "aria-required-parent",
  "aria-allowed-role",
  "aria-allowed-attr",
  "aria-valid-attr-value",
  "image-alt",
  "role-img-alt",
  "nested-interactive",
];

async function violations(node: Element) {
  const result = await axe.run(node, { runOnly: { type: "rule", values: STRUCTURAL } });
  expect(result.passes.length).toBeGreaterThan(0);
  return result.violations.map((v) => `${v.id}: ${v.nodes[0]?.target.join(" ")}`);
}

const items = [
  {
    chunk_id: "ab12cd34",
    rank: 1,
    score: 0.8,
    doc_id: "qcdt-2024",
    dieu: 12,
    khoan: [2],
    hieu_luc: true,
  },
];

describe("the toys answer axe's structural rules", () => {
  it("Stamps", async () => {
    const { container } = render(
      <Stamps answer="Nộp đơn [ab12cd34]. Không rõ." included={["ab12cd34"]} />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("ContextBin", async () => {
    const { container } = render(
      <ContextBin
        tokens={{ docs: 600, query: 40, total: 640, budget: 3000 }}
        included={["ab12cd34"]}
        dropped={["zz"]}
        promptTokens={600}
      />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("Blade", async () => {
    const { container } = render(
      <Blade variant="co_dinh-128-0" chunks={115} avgTokens={128} split />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("StarDome", async () => {
    const { container } = render(
      <StarDome items={items} goldChunks={["ab12cd34"]} goldRank={1} showGold />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("the citation ledger answers the table rules too", async () => {
    const { container } = render(
      <CitationLedger
        caseRole="visible"
        ranked={items}
        included={["ab12cd34"]}
        cited={["ab12cd34", "zz99zz99"]}
        gold={{ chunks: ["ab12cd34"], ranks: {}, flags: [], visible: true }}
      />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("the Lăng kính cards and slots", async () => {
    const env = testEnv("grounded-citation");
    const bench = starterBench(env);
    if (!bench) throw new Error("L1 starter is not drawable");
    const { container } = render(
      <Prism
        env={env}
        bench={{ ...bench, cards: ["G1", null, "G3"] }}
        onChange={() => undefined}
      />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("the machine, with an empty socket and a pair of searches", async () => {
    for (const id of ["grounded-citation", "article-number-lookup"] as const) {
      const env = testEnv(id);
      const start = starterBench(env);
      if (!start) throw new Error(`${id} starter is not drawable`);
      const { container } = render(
        <MachineMap
          env={env}
          bench={setAttached(start, "vector_search", false)}
          onChange={() => undefined}
          disabled={false}
          states={{}}
          highlight={null}
          answer={null}
        />,
      );
      expect(await violations(container)).toEqual([]);
      cleanup();
    }
  });
});
