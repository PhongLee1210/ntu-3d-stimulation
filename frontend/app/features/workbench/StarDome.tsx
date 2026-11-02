import { useEffect, useId, useMemo, useRef, type ReactElement } from "react";

import { DOME_VI, fmtCosine } from "./copy";
import type { Fact } from "./schema";
import { starField, type Star } from "./starField";

type RetrievedItem = Extract<Fact, { kind: "retrieved" }>["items"][number];

const W = 320;
const H = 170;

function label(star: Star): string {
  const khoan = star.khoan.length > 0 ? ` khoản ${star.khoan.join(", ")}` : "";
  const stale = star.stale ? ", văn bản hết hiệu lực" : "";
  const gold = star.gold ? ", đoạn đáp án" : "";
  return `Điều ${star.dieu}${khoan}, hạng ${star.rank}, cosine ${fmtCosine(star.score)}${gold}${stale}`;
}

export function StarDome({
  items,
  goldChunks,
  goldRank,
  showGold,
}: {
  items: readonly RetrievedItem[];
  goldChunks: readonly string[];
  goldRank: number | null;
  showGold: boolean;
}): ReactElement | null {
  const id = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const dome = useMemo(
    () => starField(items, showGold ? goldChunks : [], showGold ? goldRank : null),
    [items, goldChunks, goldRank, showGold],
  );

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (canvas.current && canvas.current.width !== W * dpr) {
      canvas.current.width = W * dpr;
      canvas.current.height = H * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(canvas.current as Element);
    const token = (name: string) => css.getPropertyValue(name).trim();
    const ink = token("--vg-text");
    const muted = token("--vg-text-muted");
    const accent = token("--vg-accent");
    const warning = token("--vg-warning");
    const line = token("--vg-border");

    ctx.clearRect(0, 0, W, H);
    const px = (s: Star) => [s.x * W, H - s.y * H] as const;

    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(W / 2, H - 0.05 * H, 0.42 * W, 0.42 * H, 0, Math.PI, 2 * Math.PI);
    ctx.stroke();

    for (const star of dome.stars) {
      const [x, y] = px(star);
      ctx.beginPath();
      ctx.arc(x, y, star.gold ? 7 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = star.gold ? accent : ink;
      ctx.globalAlpha = star.gold ? 1 : Math.max(0.35, 1 - (star.rank - 1) * 0.18);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (star.stale) {
        ctx.strokeStyle = warning;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.fillStyle = muted;
      ctx.font = "11px sans-serif";
      ctx.fillText(`#${star.rank}`, x + 9, y + 4);
    }

    if (dome.missingGold) {
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(W / 2, H);
      ctx.lineTo(W - 10, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = accent;
      ctx.font = "11px sans-serif";
      ctx.fillText(`hạng ${dome.missingGold.rank}`, W - 70, 11);
    }
  }, [dome]);

  if (items.length === 0) return null;

  const unranked = showGold && goldChunks.length > 0 && goldRank === null;
  const name =
    dome.missingGold || dome.stars.some((s) => s.gold)
      ? `${dome.stars.length} đoạn đã kéo, đoạn đáp án ở hạng ${
          dome.missingGold?.rank ?? dome.stars.find((s) => s.gold)?.rank
        }`
      : `${dome.stars.length} đoạn đã kéo`;

  return (
    <div className="mt-2">
      <div role="img" aria-label={name} aria-describedby={`${id}-stars`}>
        <canvas
          ref={canvas}
          width={W}
          height={H}
          aria-hidden="true"
          className="aspect-[32/17] h-auto w-full max-w-80 rounded-sm border border-line bg-subtle"
        />
      </div>
      <p className="mt-1 max-w-prose text-xs text-fg-muted">
        {DOME_VI.projection}
        {unranked ? ` ${DOME_VI.unranked}` : ""}
      </p>
      <ul id={`${id}-stars`} className="sr-only">
        {dome.stars.map((star) => (
          <li key={star.chunkId}>{label(star)}</li>
        ))}
      </ul>
    </div>
  );
}
