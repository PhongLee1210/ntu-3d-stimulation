import { useState, type ReactElement } from "react";

import type { Env } from "./bench";
import { DEBRIEF_VI } from "./copy";
import { nextPickOptions, type NextPick } from "./diff";
import { gradeSlip, type Slip } from "./guess";
import type { CaseView, RunView } from "./run";
import type { Graph } from "./schema";

export function Debrief({
  env,
  run,
  slip,
  graph,
  ask,
  whyIndex,
  onPick,
}: {
  env: Env;
  run: RunView;
  slip: Slip | null;
  graph: Graph;
  ask: { c: CaseView | null; menu: { options: readonly [string, ...string[]] } } | null;
  whyIndex: number | null;
  onPick: (extras: { why?: number; next?: NextPick }) => void;
}): ReactElement | null {
  const grade = slip ? gradeSlip(slip, run, env.level.id) : null;
  const [chosen, setChosen] = useState<NextPick | null>(null);
  const options = nextPickOptions(env, graph);
  const reason = whyIndex !== null ? ask?.menu.options[whyIndex] : undefined;

  if (grade === null && reason === undefined && options.length === 0) return null;

  return (
    <div className="mt-8 max-w-prose rounded-md border border-line p-4 text-sm">
      <p className="text-lg font-bold">{DEBRIEF_VI.heading}</p>
      {grade?.count && (
        <p className="mt-2 tabular-nums">
          Bạn đoán {grade.count.guess} câu đạt; thực tế {grade.count.actual}/{grade.count.total} câu
          đạt.
        </p>
      )}
      {grade && grade.predictions.length > 0 && (
        <p className="mt-1 tabular-nums">
          Đoán đúng {grade.predictions.filter((p) => p.right).length}/{grade.predictions.length} câu
          đã đoán.
        </p>
      )}
      {reason !== undefined && <p className="mt-1">{DEBRIEF_VI.why(reason)}</p>}
      {options.length > 0 && (
        <fieldset className="mt-2">
          <legend className="font-semibold">{DEBRIEF_VI.nextLegend}</legend>
          <div className="mt-1 space-y-1">
            {options.map((option) => (
              <label key={option.label} className="flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="debrief-next"
                  className="size-5 shrink-0 accent-brand"
                  onChange={() => {
                    setChosen(option.pick);
                    onPick({ next: option.pick });
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
          {chosen && (
            <p className="mt-1 text-fg-muted">
              {DEBRIEF_VI.nextChosen(options.find((o) => o.pick === chosen)?.label ?? "")}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
