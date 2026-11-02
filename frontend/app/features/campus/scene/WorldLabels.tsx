import { useEffect } from "react";

import { ZoneStatusText } from "~/features/zones/ui";

import { NPCS, siteFor, talkSpot, type Speaker, type Vec2 } from "../layout";
import type { SiteInfoMap } from "../sites";
import { hubStore, useHub } from "../store";
import { labelElements, labelWidths, type LabelId } from "./labels";

const ZONES = ["library", "watchtower", "market"] as const;
const BOX = "absolute top-0 left-0 will-change-transform";

const walk = (goal: Vec2, talk: Speaker | null = null) => ({
  tabIndex: -1,
  onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
  onClick: () => {
    const state = hubStore.getState();
    if (state.dialog) return;
    state.walkTo(goal);
    state.motion.talkOnArrival = talk;
  },
});

const register = (id: LabelId) => (element: HTMLElement | null) => {
  if (element) labelElements.set(id, element);
  else labelElements.delete(id);
};

const BADGE =
  "pointer-events-auto grid size-7 cursor-pointer place-items-center rounded-sm border-2 border-surface bg-accent text-lg leading-none font-bold text-on-brand";

export function WorldLabels({ sites }: { sites: SiteInfoMap }) {
  const badges = useHub((state) =>
    state.dialog
      ? ""
      : !state.met.lan
        ? "lan"
        : NPCS.filter(({ id }) => !state.met[id])
            .map(({ id }) => id)
            .join(" "),
  ).split(" ");

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        for (const [id, element] of labelElements) {
          if (element === target) labelWidths.set(id, element.offsetWidth);
        }
      }
      hubStore.getState().wake();
    });
    for (const element of labelElements.values()) observer.observe(element);
    return () => {
      observer.disconnect();
      labelWidths.clear();
    };
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {ZONES.map((id) => (
        <div key={id} ref={register(id)} hidden className={BOX}>
          <button
            type="button"
            {...walk(siteFor(id).door)}
            className="pointer-events-auto cursor-pointer rounded-sm border border-line bg-surface px-2 py-1 text-xs font-semibold whitespace-nowrap text-fg"
          >
            {sites[id].name} · <ZoneStatusText status={sites[id].status} />
          </button>
        </div>
      ))}
      {(["lan", ...NPCS.map(({ id }) => id)] as const).map((who) => (
        <div key={who} ref={register(who)} hidden className={BOX}>
          {badges.includes(who) && (
            <button type="button" data-badge={who} {...walk(talkSpot(who), who)} className={BADGE}>
              !
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
