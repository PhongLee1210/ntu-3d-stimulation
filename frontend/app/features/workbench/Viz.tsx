import { useState, type ReactElement, type ReactNode } from "react";

import { buttonClass } from "~/components/ui/button";
import { useMediaQuery } from "~/lib/useMediaQuery";

import { VIZ_STAMP, VIZ_VI, type VizStamp } from "./copy";

const NARROW = "(max-width: 639px)";

type VizProps =
  | {
      caption: string;
      stamp: VizStamp;
      note?: string;
      form: "table";
      children: ReactNode;
    }
  | {
      caption: string;
      stamp: VizStamp;
      note?: string;
      form?: undefined;
      table: ReactNode;
      children: ReactNode;
    };

export function Viz(props: VizProps): ReactElement {
  const { caption, stamp, note, children } = props;
  const narrow = useMediaQuery(NARROW);
  const [chosen, setChosen] = useState<"picture" | "table" | null>(null);
  const showing = chosen ?? (narrow ? "table" : "picture");
  const asTable = props.form !== "table" && showing === "table";
  const table = props.form === "table" ? children : props.table;

  return (
    <figure data-vg-viz={props.form === "table" ? "table" : "both"} className="mt-3">
      {asTable ? (
        <div
          tabIndex={0}
          role="region"
          aria-label={caption}
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-brand"
        >
          {table}
        </div>
      ) : props.form === "table" ? (
        table
      ) : (
        children
      )}
      <figcaption className="mt-1 max-w-prose text-sm">{caption}</figcaption>
      <p className="mt-1 text-xs text-fg-muted">
        {VIZ_STAMP[stamp]}
        {note !== undefined && ` · ${note}`}
      </p>
      {props.form !== "table" && (
        <button
          type="button"
          onClick={() => setChosen(asTable ? "picture" : "table")}
          className={buttonClass("quiet")}
        >
          {asTable ? VIZ_VI.toPicture : VIZ_VI.toTable}
        </button>
      )}
    </figure>
  );
}
