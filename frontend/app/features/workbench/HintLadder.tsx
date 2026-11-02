import { useCallback, useEffect, useState, type ReactElement } from "react";

import { buttonClass } from "~/components/ui/button";
import { levelStars, readProgress } from "~/features/progress/progress";

import { HINTS_VI, TOY } from "./copy";
import {
  canOpen,
  configKey,
  hint3Gate,
  hintFor,
  hintTarget,
  loadHints,
  look,
  open,
  recordFail,
  saveHints,
  type GateContext,
  type HintBook,
  type Pointer,
  type Target,
} from "./hints";
import type { RunView } from "./run";

export function useHints({
  levelId,
  zoneId,
  run,
  ranBody,
  gate,
}: {
  levelId: string;
  zoneId: string;
  run: RunView | null;
  ranBody: string | null;
  gate: GateContext;
}) {
  const [book, setBook] = useState<HintBook>(() => loadHints(levelId));
  const target = run ? hintTarget(levelId, run, levelStars(readProgress(), zoneId, levelId)) : null;
  const [counted, setCounted] = useState<string | null>(null);
  if (run && target && ranBody !== null && counted !== run.runId) {
    setCounted(run.runId);
    setBook(recordFail(book, target.star, configKey(ranBody), run.scope === "mau"));
  }
  useEffect(() => {
    saveHints(levelId, book);
  }, [levelId, book]);

  const gate3 = target !== null && hint3Gate(book, target, gate);
  const openNext = useCallback(() => {
    if (!target) return;
    if (canOpen(book, target.key, hint3Gate(book, target, gate)) === null) return;
    setBook(open(book, target.key, target.star, Date.now()));
  }, [target, book, gate]);
  const markLook = useCallback(() => setBook(look(book)), [book]);

  return { book, target, gate3, openNext, markLook };
}

const pointerLabel = (pointer: Pointer) =>
  pointer.kind === "case"
    ? HINTS_VI.seeCase(pointer.n)
    : HINTS_VI.seeSlot(
        (pointer.param && TOY[pointer.slot].params?.[pointer.param]) ?? TOY[pointer.slot].name,
      );

export function HintLadder({
  levelId,
  target,
  book,
  gate3,
  variant,
  busy,
  onOpen,
  onPointer,
  onVariant,
}: {
  levelId: string;
  target: Target;
  book: HintBook;
  gate3: boolean;
  variant: string | null;
  busy: boolean;
  onOpen: () => void;
  onPointer: (pointer: Pointer) => void;
  onVariant: () => void;
}): ReactElement | null {
  const opened = book.targets[target.key]?.opened ?? 0;
  const next = canOpen(book, target.key, gate3);
  const failures = book.fails[String(target.star) as "1" | "2" | "3"]?.configs.length ?? 0;
  const shown = ([1, 2, 3] as const)
    .filter((n) => n <= opened)
    .map((n) => ({ n, hint: hintFor(levelId, target, n) }));
  if (hintFor(levelId, target, 1) === null) return null;

  return (
    <section
      aria-labelledby="wb-hints"
      className="mt-8 max-w-prose rounded-md border border-line p-4 chieu:hidden"
    >
      <h2 id="wb-hints" className="text-lg font-bold">
        {HINTS_VI.heading}
      </h2>
      <p className="mt-1 text-sm text-fg-muted">{HINTS_VI.lead(target.star)}</p>
      {shown.length > 0 && (
        <ol className="mt-3 space-y-3">
          {shown.map(({ n, hint }) =>
            hint ? (
              <li key={n} data-hint={n}>
                <p>
                  <span className="font-semibold">
                    {n === 3 ? HINTS_VI.example : HINTS_VI.label(n)}:{" "}
                  </span>
                  {hint.text}
                </p>
                <button
                  type="button"
                  onClick={() => onPointer(hint.pointer)}
                  className={buttonClass("inline")}
                >
                  {pointerLabel(hint.pointer)}
                </button>
              </li>
            ) : null,
          )}
        </ol>
      )}
      {next !== null ? (
        <button type="button" onClick={onOpen} className={buttonClass("secondary", "mt-3")}>
          {HINTS_VI.open(next)}
        </button>
      ) : (
        <>
          {opened === 1 && <p className="mt-3 text-sm text-fg-muted">{HINTS_VI.waitLook}</p>}
          {opened >= 3 && variant !== null && (
            <div className="mt-4 border-t border-line pt-4">
              <h3 className="font-bold">{HINTS_VI.variantHeading}</h3>
              <p className="mt-1 text-sm text-fg-muted">{HINTS_VI.variantLead}</p>
              <button
                type="button"
                onClick={onVariant}
                disabled={busy}
                className={buttonClass("secondary", "mt-3")}
              >
                {HINTS_VI.variantRun}
              </button>
            </div>
          )}
          {opened === 2 && (
            <p className="mt-3 text-sm text-fg-muted">{HINTS_VI.waitGate(failures)}</p>
          )}
        </>
      )}
    </section>
  );
}
