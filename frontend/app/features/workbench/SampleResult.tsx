import type { ReactElement } from "react";

import { SAMPLE_VI } from "./copy";
import { sampleVerdict, type RunView } from "./run";

export function SampleResult({
  run,
  samplesOnly = false,
}: {
  run: RunView;
  samplesOnly?: boolean;
}): ReactElement | null {
  const verdict = sampleVerdict(run);
  if (verdict === null) return null;
  const line = verdict === "passed" && samplesOnly ? SAMPLE_VI.passedAlone : SAMPLE_VI[verdict];
  const passed = run.cases.filter((c) => c.graded?.passed === true).length;

  return (
    <section aria-labelledby="wb-sample" className="mt-12 max-w-prose border-t border-line pt-8">
      <h2 id="wb-sample" tabIndex={-1} className="text-2xl font-bold tracking-tight">
        {SAMPLE_VI.heading}
      </h2>
      <p className="mt-2 tabular-nums">
        {SAMPLE_VI.count(passed, run.cases.length)} {SAMPLE_VI.noStars}
      </p>
      <p className="mt-1 text-sm text-fg-muted">{line}</p>
    </section>
  );
}
