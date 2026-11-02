import type { ReactElement } from "react";

import { AlertIcon, StarIcon } from "~/components/ui/icons";

import type { SlotGold } from "./BenchView";
import { LEDGER_VI, STAMP_VI } from "./copy";
import { citationLedger, type LedgerRow } from "./ledger";
import type { CaseRole, Fact } from "./schema";

type Item = Extract<Fact, { kind: "retrieved" }>["items"][number];

const CHIP = "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-xs";

function Cell({
  row,
  state,
  children,
}: {
  row: LedgerRow;
  state: "here" | "gap" | "ghost";
  children?: ReactElement | null;
}) {
  return (
    <td data-id={row.id} data-state={state} className="px-1 py-1 align-top">
      {state === "gap" ? (
        <span className="text-fg-muted" aria-label={`${row.id}: ${LEDGER_VI.gap}`}>
          —
        </span>
      ) : (
        <span
          className={`${CHIP} ${
            state === "ghost" ? "border-dashed border-danger" : "border-line-strong"
          }`}
        >
          {row.id}
          {children}
        </span>
      )}
    </td>
  );
}

export function CitationLedger({
  caseRole,
  ranked,
  included,
  cited,
  gold,
}: {
  caseRole: CaseRole | null;
  ranked: readonly Item[];
  included: readonly string[];
  cited: readonly string[];
  gold: SlotGold | null;
}): ReactElement | null {
  if (caseRole !== "visible") return null;
  const { rows, counts } = citationLedger(ranked, included, cited);
  if (rows.length === 0) return null;
  const isGold = (id: string) => gold?.visible === true && gold.chunks.includes(id);

  return (
    <div className="mt-3">
      <div
        tabIndex={0}
        role="region"
        aria-label={LEDGER_VI.caption}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-brand"
      >
        <table className="text-sm">
          <caption className="sr-only">
            Mã đoạn qua ba chặng: đã lấy về, vào thùng, đã trích.
          </caption>
          <tbody>
            {(
              [
                ["pull", LEDGER_VI.pull, (r: LedgerRow) => r.rank !== null],
                ["bin", LEDGER_VI.bin, (r: LedgerRow) => r.inBin],
                ["cite", LEDGER_VI.cite, (r: LedgerRow) => r.cited],
              ] as const
            ).map(([key, label, reached]) => (
              <tr key={key} data-row={key} className="border-t border-line">
                <th scope="row" className="py-1 pr-2 text-left font-semibold whitespace-nowrap">
                  {label}
                </th>
                {rows.map((row) => (
                  <Cell
                    key={row.id}
                    row={row}
                    state={!reached(row) ? "gap" : key === "cite" && row.ghost ? "ghost" : "here"}
                  >
                    {key === "cite" && row.ghost ? (
                      <span className="inline-flex items-center gap-1 font-sans text-danger">
                        <AlertIcon className="size-3.5 shrink-0" />
                        {STAMP_VI.fake.replace("· ", "")}
                      </span>
                    ) : key === "pull" && isGold(row.id) ? (
                      <span className="inline-flex items-center gap-1 font-sans font-semibold">
                        <StarIcon className="size-3.5 shrink-0 fill-accent stroke-accent" />
                        Đoạn đáp án
                      </span>
                    ) : null}
                  </Cell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p data-ledger-note className="mt-1 max-w-prose text-sm">
        {LEDGER_VI.note(counts.cited, counts.inBin, counts.ghost)}
      </p>
    </div>
  );
}
