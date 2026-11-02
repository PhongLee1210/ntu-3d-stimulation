import type { ZoneLocation, ZoneStatus } from "./schema";

export const ZONE_BAR: Readonly<Record<ZoneLocation, string>> = {
  library: "bg-brand",
  watchtower: "bg-ink",
  market: "bg-accent",
};

export function ZoneStatusText({
  status,
  className = "",
}: {
  status: ZoneStatus;
  className?: string;
}) {
  return status === "open" ? (
    <span className={`font-semibold text-success ${className}`}>Đang mở</span>
  ) : (
    <span className={`font-medium text-fg-muted ${className}`}>Sắp mở</span>
  );
}

export function ConceptChips({
  concepts,
  className = "",
}: {
  concepts: readonly string[];
  className?: string;
}) {
  if (concepts.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {concepts.map((concept) => (
        <li
          key={concept}
          className="rounded-sm border border-line px-2 py-1 text-xs font-medium text-fg"
        >
          {concept}
        </li>
      ))}
    </ul>
  );
}

export function IncidentBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-accent-tint px-2 py-0.5 text-xs font-semibold text-ink">
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3 text-accent"
        fill="currentColor"
      >
        <path d="M6 .8 11.6 11H.4Zm-.6 3.7v3h1.2v-3Zm0 4.1v1.2h1.2V8.6Z" />
      </svg>
      Sự cố
    </span>
  );
}
