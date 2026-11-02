import type { ReactElement } from "react";

import { STRIP_VI, variantVi } from "./copy";
import { cutSentence, type ArticleStrip } from "./vizData";
import { Viz } from "./Viz";

export function Strip({ strip, variant }: { strip: ArticleStrip; variant: string }): ReactElement {
  const { dieu, start, end, cuts, inForce } = strip;
  const span = end - start;
  const edges = [start, ...cuts, end];
  const pieces = edges.slice(0, -1).map((from, index) => {
    const to = edges[index + 1] ?? end;
    return {
      from,
      to,
      left: ((from - start) / span) * 100,
      width: ((to - from) / span) * 100,
      severed: to === end ? null : cutSentence(strip.text, start, to),
    };
  });
  const severed = pieces.flatMap((p) => (p.severed ? [p.severed] : []));

  const label =
    STRIP_VI.pieces(dieu, pieces.length) +
    (severed.length > 0 ? ` ${STRIP_VI.severedCount(severed.length)}` : "");

  return (
    <Viz
      caption={STRIP_VI.caption(dieu, inForce)}
      stamp="index"
      note={variantVi(variant)}
      table={
        <table className="text-sm">
          <caption className="sr-only">{STRIP_VI.caption(dieu, inForce)}</caption>
          <thead>
            <tr>
              <th scope="col" className="py-1 pr-3 text-left font-medium">
                {STRIP_VI.columns.piece}
              </th>
              <th scope="col" className="py-1 pr-3 text-left font-medium">
                {STRIP_VI.columns.chars}
              </th>
              <th scope="col" className="py-1 text-left font-medium">
                {STRIP_VI.columns.severed}
              </th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((p, index) => (
              <tr key={p.from} className="border-t border-line">
                <th scope="row" className="py-1 pr-3 text-left font-semibold whitespace-nowrap">
                  {STRIP_VI.piece(index + 1)}
                </th>
                <td className="py-1 pr-3 tabular-nums">{p.to - p.from}</td>
                <td className="py-1">{p.severed ? `«${p.severed.text}»` : STRIP_VI.clean}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div role="img" aria-label={label} className="max-w-prose">
        <div className="relative h-10 overflow-hidden rounded-sm border border-line-strong bg-subtle">
          {pieces.map((p) => (
            <span
              key={`piece-${p.from}`}
              data-strip-piece=""
              aria-hidden="true"
              style={{ left: `${p.left}%`, width: `${p.width}%` }}
              className="absolute inset-y-0 border-r border-line-strong last:border-r-0"
            />
          ))}
          {pieces
            .filter((p) => p.to !== end)
            .map((p) => (
              <span
                key={`cut-${p.to}`}
                data-strip-cut={p.severed ? "severed" : "clean"}
                aria-hidden="true"
                style={{ left: `${p.left + p.width}%` }}
                className={`absolute inset-y-0 w-0.5 ${p.severed ? "bg-danger" : "bg-line-strong"}`}
              />
            ))}
        </div>
      </div>
      <p className="mt-1 max-w-prose text-sm tabular-nums">
        {STRIP_VI.pieces(dieu, pieces.length)}
      </p>
      {!inForce && (
        <p className="mt-1 max-w-prose text-sm font-semibold text-warning">{STRIP_VI.stale}</p>
      )}
      {severed.length > 0 && (
        <p className="mt-1 max-w-prose text-sm font-semibold text-danger">
          {STRIP_VI.severedLegend} «{severed[0]?.text}»
        </p>
      )}
    </Viz>
  );
}
