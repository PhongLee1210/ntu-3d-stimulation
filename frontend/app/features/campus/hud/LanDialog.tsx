import { useRef, type ReactNode } from "react";

import { buttonClass } from "~/components/ui/button";
import { ZonesErrorNotice } from "~/features/zones/ZoneCard";

import type { SiteInfo } from "../sites";
import type { DialogLines } from "../store";
import { HubDialog } from "./HubDialog";

const LINES: Readonly<Record<DialogLines, readonly string[]>> = {
  first: [
    "Chào bạn, mình là Lan, thủ thư ca tối. Trợ lý tra cứu của thư viện vừa trả lời sai quy chế cho một bạn sinh viên, còn gán cho Điều 47 một quy định không hề có.",
    "Mình cần người dạy nó tra sách trước khi trả lời. Bạn vào xem giúp mình nhé?",
  ],
  again: ["Trợ lý vẫn đang chờ bạn ở quầy tra cứu."],
};

interface LanDialogProps {
  lines: DialogLines;
  library: SiteInfo;
  onTeach: () => void;
  opening: boolean;
  onEnter: () => void;
  onClose: () => void;
  zonesFailed: boolean;
  onRetry: () => void;
  zoneCard: ReactNode;
}

export function LanDialog({
  lines,
  library,
  onTeach,
  opening,
  onEnter,
  onClose,
  zonesFailed,
  onRetry,
  zoneCard,
}: LanDialogProps) {
  const teachRef = useRef<HTMLButtonElement>(null);

  const retryKeepingFocus = () => {
    teachRef.current?.focus();
    onRetry();
  };

  return (
    <HubDialog
      titleId="lan-dialog-title"
      title="Cô Lan"
      subtitle="Thủ thư ca tối"
      initialFocus={teachRef}
      onClose={onClose}
    >
      <div className="mt-3 space-y-3 text-base leading-relaxed text-fg">
        {LINES[lines].map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <button
          ref={teachRef}
          type="button"
          onClick={opening ? undefined : onTeach}
          aria-busy={opening}
          className={buttonClass("primary")}
        >
          {opening ? "Đang mở màn…" : "Dạy trợ lý tra sách"}
        </button>
        <p role="status" className="sr-only">
          {opening ? "Đang mở màn…" : ""}
        </p>
        <button type="button" onClick={onEnter} className={buttonClass("secondary")}>
          Vào {library.name}
        </button>
        <button type="button" onClick={onClose} className={buttonClass("quiet")}>
          Để sau
        </button>
      </div>
      <div className="mt-5 border-t border-line pt-5">
        {zonesFailed ? <ZonesErrorNotice onRetry={retryKeepingFocus} /> : zoneCard}
      </div>
    </HubDialog>
  );
}
