import type { ReactElement } from "react";

import { AlertIcon } from "~/components/ui/icons";

import { binFill, droppedRanks } from "./bin";
import { BIN_VI, DROPPED_VI, fmt, TOKENS_VI } from "./copy";
import { Viz } from "./Viz";

export function ContextBin({
  tokens,
  included,
  dropped,
  ranked,
  promptTokens,
}: {
  tokens: { docs: number; query: number; total: number; budget: number };
  included: readonly string[];
  dropped: readonly string[];
  ranked?: readonly { chunk_id: string; rank: number }[];
  promptTokens: number | null;
}): ReactElement {
  const fill = binFill(tokens);
  const lost = droppedRanks(dropped, ranked ?? []);
  const cut = dropped.length > 0 ? `, ${dropped.length} đoạn bị cắt` : "";
  const label =
    `Thùng chứa ${fmt(tokens.total)} trên ${fmt(tokens.budget)} token, ` +
    `${included.length} đoạn vào thùng${cut}`;

  return (
    <Viz
      caption={label}
      stamp="run"
      table={
        <table className="text-sm tabular-nums">
          <tbody>
            {(
              [
                ["Tổng", tokens.total],
                ["Ngân sách", tokens.budget],
                ["Tài liệu", tokens.docs],
                ["Câu hỏi", tokens.query],
                ["Đoạn vào thùng", included.length],
                ["Đoạn bị cắt", dropped.length],
              ] as const
            ).map(([name, value]) => (
              <tr key={name} className="border-t border-line">
                <th scope="row" className="py-1 pr-3 text-left font-semibold whitespace-nowrap">
                  {name}
                </th>
                <td className="py-1">{fmt(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div role="img" aria-label={label} className="max-w-80">
        {fill.overflow && (
          <svg
            data-overflow={fill.overPct}
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-4 w-full"
          >
            <rect
              y={Math.max(0, 100 - Math.min(fill.overPct, 100))}
              width="100"
              height={Math.min(fill.overPct, 100)}
              className="fill-danger-tint"
            />
          </svg>
        )}
        <svg
          data-bin=""
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={`h-28 w-full rounded-sm border-2 border-b-4 bg-subtle ${
            fill.overflow ? "border-danger" : "border-line-strong"
          }`}
        >
          <rect
            data-band="docs"
            y={100 - fill.docsPct}
            width="100"
            height={fill.docsPct}
            className="fill-brand-tint"
          />
          <rect
            data-band="query"
            y={100 - fill.docsPct - fill.queryPct}
            width="100"
            height={fill.queryPct}
            className="fill-accent-tint"
          />
        </svg>
        <ul className="-mt-4 flex flex-wrap gap-0.5 px-1">
          {included.map((id) => (
            <li key={id} data-passage="" className="size-2 rounded-xs bg-brand" />
          ))}
        </ul>
        {lost.pieces.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1 border-t border-dashed border-line pt-2">
            {lost.pieces.map((piece) => (
              <li
                key={piece.id}
                data-cut-piece=""
                aria-label={piece.rank === null ? DROPPED_VI.unknown : DROPPED_VI.piece(piece.rank)}
                className="rounded-xs border border-line-strong bg-subtle px-1 text-xs text-fg-muted tabular-nums"
              >
                {piece.rank ?? "?"}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-1 text-sm tabular-nums">
        {fmt(tokens.total)}/{fmt(tokens.budget)} token · tài liệu {fmt(tokens.docs)} · câu hỏi{" "}
        {fmt(tokens.query)} <span className="text-fg-muted">({TOKENS_VI.bin})</span>
      </p>
      <p className="mt-1 max-w-prose text-sm text-fg-muted tabular-nums">
        {promptTokens === null ? TOKENS_VI.noneYet : TOKENS_VI.prompt(fmt(promptTokens))}
      </p>
      {lost.pieces.length > 0 && (
        <p data-cut-note className="mt-1 text-sm tabular-nums">
          {DROPPED_VI.summary(lost.pieces.length, lost.range)}
        </p>
      )}
      {fill.overflow && (
        <p data-overflow-note className="flex items-center gap-1 text-sm font-semibold text-danger">
          <AlertIcon className="size-4 shrink-0" />
          {BIN_VI.overflow}
        </p>
      )}
      <p className="mt-1 max-w-prose text-xs text-fg-muted">{BIN_VI.counted}</p>
    </Viz>
  );
}
