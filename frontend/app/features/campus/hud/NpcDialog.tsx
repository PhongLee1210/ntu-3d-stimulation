import { useRef, type ReactNode } from "react";

import { buttonClass } from "~/components/ui/button";

import type { NpcId } from "../layout";
import { linesFor, NPC_ROLES } from "../npcs";
import type { SiteInfo } from "../sites";
import { HubDialog } from "./HubDialog";

interface NpcDialogProps {
  who: NpcId;
  name: string;
  visits: number;
  site: SiteInfo | null;
  onEnter: () => void;
  onClose: () => void;
  zoneCard: ReactNode;
}

export function NpcDialog({ who, name, visits, site, onEnter, onClose, zoneCard }: NpcDialogProps) {
  const firstRef = useRef<HTMLButtonElement>(null);
  const role = NPC_ROLES[who];
  const open = site?.status === "open";

  return (
    <HubDialog
      titleId="npc-dialog-title"
      title={name.charAt(0).toLocaleUpperCase("vi") + name.slice(1)}
      subtitle={role.subtitle}
      initialFocus={firstRef}
      onClose={onClose}
    >
      <div className="mt-3 space-y-3 text-base leading-relaxed text-fg">
        {linesFor(who, visits, site?.status ?? "coming_soon").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {open && (
          <button ref={firstRef} type="button" onClick={onEnter} className={buttonClass("primary")}>
            Vào {site.name}
          </button>
        )}
        <button
          ref={open ? undefined : firstRef}
          type="button"
          onClick={onClose}
          className={buttonClass("quiet")}
        >
          Để sau
        </button>
      </div>
      {site && zoneCard && <div className="mt-5 border-t border-line pt-5">{zoneCard}</div>}
    </HubDialog>
  );
}
