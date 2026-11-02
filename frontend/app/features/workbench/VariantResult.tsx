import type { ReactElement } from "react";

import { VARIANT_VI } from "./copy";
import type { RunView } from "./run";

export function VariantResult({ run }: { run: RunView }): ReactElement | null {
  const c = run.cases[0];
  if (run.scope !== "bien_the" || run.phase !== "finished" || !c?.graded) return null;
  const passed = c.graded.passed;
  return (
    <section aria-labelledby="wb-variant" className="mt-12 max-w-prose border-t border-line pt-8">
      <h2 id="wb-variant" tabIndex={-1} className="text-2xl font-bold tracking-tight">
        {VARIANT_VI.heading}
      </h2>
      {c.question && <p className="mt-2">{c.question}</p>}
      <p data-variant={passed ? "passed" : "failed"} className="mt-2 font-semibold">
        {passed ? VARIANT_VI.passed : VARIANT_VI.failed}
      </p>
    </section>
  );
}
