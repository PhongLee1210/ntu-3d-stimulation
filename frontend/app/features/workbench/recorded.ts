import * as v from "valibot";

import { runReducer, type RunView } from "./run";
import { EVENT_SCHEMAS, type EventType, type RunEvent } from "./schema";

export interface RecordedRun {
  events: readonly RunEvent[];
}

const FileSchema = v.object({
  format: v.literal(1),
  level: v.string(),
  level_version: v.number(),
  events: v.array(v.looseObject({ type: v.string() })),
});

export const recordedUrl = (levelId: string) => `/runs/${encodeURIComponent(levelId)}.json`;

export function parseRecorded(
  levelId: string,
  levelVersion: number,
  raw: unknown,
): RecordedRun | null {
  const parsed = v.safeParse(FileSchema, raw);
  if (!parsed.success) return null;
  const file = parsed.output;
  if (file.level !== levelId || file.level_version !== levelVersion) return null;

  const events = file.events.flatMap((event): RunEvent[] => {
    const schema = EVENT_SCHEMAS[event.type as EventType] as
      (typeof EVENT_SCHEMAS)[EventType] | undefined;
    if (schema === undefined) return [];
    const body = v.safeParse(schema, event);
    if (!body.success) return [];
    const stamped =
      event.type === "run.started" ? { ...body.output, scope: "da_ghi" } : body.output;
    return [{ ...stamped, type: event.type } as RunEvent];
  });
  return events.length > 0 ? { events } : null;
}

export function replayRecorded(log: RecordedRun): RunView | null {
  let run = runReducer(null, { kind: "reset", runId: RECORDED_RUN_ID });
  log.events.forEach((event, index) => {
    run = runReducer(run, { kind: "event", seq: index + 1, event });
  });
  return run === null ? null : { ...run, stream: "closed" };
}

export const RECORDED_RUN_ID = "da-ghi";
