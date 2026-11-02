import type { ReactElement } from "react";

import { JOURNEY_VI } from "./copy";
import { Viz } from "./Viz";
import { rankJourney, type Move, type Scale } from "./journey";

const TONE: Readonly<Record<Move, string>> = {
  start: "border-line-strong",
  up: "border-success bg-success-tint",
  down: "border-danger bg-danger-tint",
  same: "border-line-strong",
  rescaled: "border-line-strong",
};

const ARROW: Readonly<Record<Move, string>> = {
  start: "",
  up: "↑",
  down: "↓",
  same: "",
  rescaled: "",
};

export function RankJourney({
  ranks,
  order,
  toys,
  scales,
}: {
  ranks: Readonly<Record<string, number | null>>;
  order: readonly string[];
  toys: Readonly<Record<string, string>>;
  scales?: Readonly<Record<string, Scale>>;
}): ReactElement | null {
  const steps = rankJourney(ranks, order, scales);
  if (steps.length === 0) return null;

  const scaleOf = (node: string) => {
    const scale = scales?.[node];
    if (scale === undefined) return JOURNEY_VI.unknownScale;
    return scale.kind === "corpus"
      ? JOURNEY_VI.corpus
      : scale.size === null
        ? JOURNEY_VI.unknownScale
        : JOURNEY_VI.kept(scale.size);
  };

  return (
    <Viz
      caption={JOURNEY_VI.caption}
      stamp="run"
      table={
        <table className="text-sm">
          <tbody>
            {steps.map((step) => (
              <tr key={step.node} className="border-t border-line">
                <th scope="row" className="py-1 pr-3 text-left font-semibold whitespace-nowrap">
                  {toys[step.node] ?? step.node}
                </th>
                <td className="py-1 pr-3 tabular-nums">
                  {step.rank === null ? JOURNEY_VI.absent : `#${step.rank}`}
                </td>
                <td className="py-1 text-fg-muted">{scaleOf(step.node)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ol aria-hidden="true" className="flex flex-wrap items-center gap-1 text-sm">
        {steps.map((step) => (
          <li
            key={step.node}
            data-hop={step.move}
            className={`rounded-sm border px-2 py-1 tabular-nums ${TONE[step.move]}`}
          >
            <span className="text-fg-muted">{toys[step.node] ?? step.node}</span>{" "}
            {step.rank === null ? JOURNEY_VI.absent : `#${step.rank}`}
            {ARROW[step.move] !== "" && <span className="ml-0.5">{ARROW[step.move]}</span>}
          </li>
        ))}
      </ol>
    </Viz>
  );
}
