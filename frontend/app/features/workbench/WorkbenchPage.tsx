import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
} from "react";
import { Link, useParams } from "react-router";
import * as v from "valibot";

import { PageFrame } from "~/components/PageFrame";
import { buttonClass } from "~/components/ui/button";
import { useProjector } from "~/features/projector/projector";
import { levelStars, readProgress, recordStars, type Stars } from "~/features/progress/progress";

import { cancelRun, eventsUrl, newKey, postRun, previewRetrieval, type LevelPageData } from "./api";
import { benchFromGraph, graphFromBench, type Bench, type Env } from "./bench";
import { BenchSection, slotTargets } from "./BenchView";
import { Brief } from "./Brief";
import { BACK_TO_LEVELS, FIRST_TOUCH_VI, liveMessage, PROJECTOR_VI } from "./copy";
import { EMPTY_SLIP, isEmptySlip, type Slip } from "./guess";
import { previewableCase, shouldPreview } from "./preview";
import { parseRecorded, recordedUrl, replayRecorded } from "./recorded";
import { parseViz, vizUrl, type VizData } from "./vizData";
import { lastPassing } from "./runHistory";
import { Results } from "./Results";
import { SampleResult } from "./SampleResult";
import {
  cappedRun,
  frameAction,
  isActive,
  runReducer,
  sampleVerdict,
  type BenchRun,
  type RunAction,
  type RunView,
} from "./run";
import { RunPanel, type RequestState, type StopState, type Summary } from "./RunPanel";
import type { Fact } from "./schema";
import {
  EVENT_TYPES,
  GraphSchema,
  type BlockType,
  type Graph,
  type Issue,
  type PublicLevel,
} from "./schema";
import {
  loadHistory,
  recordExtras,
  loadSaved,
  loadSlip,
  recordRun,
  save,
  saveSlip,
  type RunMark,
} from "./storage";
import { HintLadder, useHints } from "./HintLadder";
import { firstTouches, firstTouchTypes, type Pointer } from "./hints";
import { useQuota } from "./useQuota";
import { VariantResult } from "./VariantResult";
import { loadSeen, markSeen, pickVariant } from "./variants";
import { errorsOf, validateGraph } from "./validate";

const levelsUrl = (zoneId: string | null) => (zoneId ? `/play/${zoneId}` : "/play");

export function LevelPage({ data, onRetry }: { data: LevelPageData; onRetry: () => void }) {
  const back = levelsUrl(data.zoneId);
  switch (data.kind) {
    case "ready":
      return (
        <PageFrame back={back} backLabel={BACK_TO_LEVELS} width="6xl">
          <WorkbenchPage
            key={data.env.level.id}
            env={data.env}
            starter={data.starter}
            back={back}
          />
        </PageFrame>
      );
    case "not-found":
      return (
        <PageFrame back={back} backLabel={BACK_TO_LEVELS}>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Không tìm thấy màn này</h1>
          <p className="mt-3 text-fg-muted">Đường dẫn không khớp màn nào của khu.</p>
          <Link to={back} className={buttonClass("primary", "mt-8")}>
            {BACK_TO_LEVELS}
          </Link>
        </PageFrame>
      );
    case "error":
      return (
        <PageFrame back={back} backLabel={BACK_TO_LEVELS}>
          <div role="alert" className="rounded-md border border-line bg-warning-tint p-5">
            <h1 className="text-base font-semibold text-fg">Chưa tải được màn này.</h1>
            <p className="mt-1 text-sm text-fg-muted">Kiểm tra kết nối rồi thử lại.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onRetry} className={buttonClass("secondary")}>
                Thử lại
              </button>
              <Link to={back} className={buttonClass("quiet")}>
                {BACK_TO_LEVELS}
              </Link>
            </div>
          </div>
        </PageFrame>
      );
  }
}

export function LevelPageSkeleton() {
  const block = "rounded-sm bg-subtle";
  const { zoneId } = useParams();
  return (
    <PageFrame back={levelsUrl(zoneId ?? null)} backLabel={BACK_TO_LEVELS} width="6xl">
      <div aria-hidden="true">
        <div className={`h-[5px] w-12 ${block}`} />
        <div className={`mt-4 h-9 w-64 ${block}`} />
        <div className={`mt-4 h-4 w-full max-w-prose ${block}`} />
        <div className={`mt-2 h-4 w-2/3 max-w-prose ${block}`} />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-28 rounded-md bg-subtle" />
            ))}
          </div>
          <div className="h-64 rounded-md bg-subtle" />
        </div>
      </div>
      <p role="status" className="sr-only">
        Đang tải màn
      </p>
    </PageFrame>
  );
}

function useRunStream(runId: string | null, attempt: number, dispatch: Dispatch<RunAction>) {
  useEffect(() => {
    if (!runId) return;
    const source = new EventSource(eventsUrl(runId));
    let warned = false;
    for (const type of EVENT_TYPES) {
      source.addEventListener(type, (message: MessageEvent<string>) => {
        const action = frameAction(type, message.data, Number(message.lastEventId));
        if (action?.event.type !== type) {
          if (!warned) console.warn(`Sự kiện ${type} không đúng định dạng.`);
          warned = true;
        }
        if (!action) return;
        dispatch(action);
        const { type: kind } = action.event;
        if (kind === "run.finished" || kind === "run.failed") source.close();
      });
    }
    source.onopen = () => dispatch({ kind: "stream", state: "live" });
    source.onerror = () =>
      dispatch({
        kind: "stream",
        state: source.readyState === EventSource.CLOSED ? "lost" : "reconnecting",
      });
    return () => source.close();
  }, [runId, attempt, dispatch]);
}

function useCancelOnLeave(run: RunView | null) {
  const active = useRef<string | null>(null);
  const left = useRef(false);
  useEffect(() => {
    active.current = run && isActive(run) ? run.runId : null;
  }, [run]);
  useEffect(() => {
    left.current = false;
    const cancel = () => {
      const runId = active.current;
      if (!runId) return;
      active.current = null;
      void cancelRun(runId, { keepalive: true });
    };
    window.addEventListener("pagehide", cancel);
    return () => {
      left.current = true;
      window.removeEventListener("pagehide", cancel);
      cancel();
    };
  }, []);
  return left;
}

function focusOn(target: HTMLElement | null) {
  target?.focus();
  target?.scrollIntoView({ block: "nearest" });
}

function useFocusLater() {
  const [request, setRequest] = useState<{ selectors: readonly string[]; n: number } | null>(null);
  useEffect(() => {
    if (!request) return;
    for (const selector of request.selectors) {
      const target = document.querySelector<HTMLElement>(selector);
      if (target) {
        focusOn(target);
        return;
      }
    }
  }, [request]);
  return (selectors: string | readonly string[]) =>
    setRequest((last) => ({
      selectors: typeof selectors === "string" ? [selectors] : selectors,
      n: (last?.n ?? 0) + 1,
    }));
}

export function useLevelWon(level: PublicLevel, run: RunView | null): boolean {
  const [saved] = useState(() => levelStars(readProgress(), level.zone, level.id));
  const earned = run?.score && run.scope === undefined && !cappedRun(run) ? run.score.stars : 0;
  return saved >= 1 || earned >= 1;
}

export function useRecordStars(level: PublicLevel, run: RunView | null) {
  const scoredRun = run?.score && run.scope === undefined && !cappedRun(run) ? run.runId : null;
  const stars = run?.score?.stars;
  useEffect(() => {
    if (!scoredRun || stars === undefined) return;
    try {
      recordStars(level.zone, level.id, stars as Stars);
    } catch (error) {
      console.warn("Không lưu được số sao của màn.", error);
    }
  }, [scoredRun, stars, level.zone, level.id]);
}

export function useRecordHistory(
  levelId: string,
  run: RunView | null,
  ranBody: string | null,
  onWritten?: (runs: RunMark[]) => void,
) {
  const scoredRun = run?.score && run.scope === undefined && !cappedRun(run) ? run.runId : null;
  const written = useRef<string | null>(null);
  useEffect(() => {
    if (scoredRun === null || scoredRun === written.current) return;
    if (!run?.score || ranBody === null) return;
    written.current = scoredRun;
    recordRun(levelId, {
      body: ranBody,
      at: Date.now(),
      stars: run.score.stars as Stars,
      tokens: run.score.tokens,
      budget: run.score.budget,
      cases: run.cases.flatMap((c) =>
        c.graded ? [{ n: c.n, role: c.role, passed: c.graded.passed }] : [],
      ),
    });
    onWritten?.(loadHistory(levelId));
  }, [scoredRun, run, ranBody, levelId, onWritten]);
}

export function useStarRunAfterSample(
  run: RunView | null,
  ranBody: string | null,
  start: (body: string) => void,
  samplesOnly = false,
) {
  const chained = useRef<string | null>(null);
  useEffect(() => {
    if (run === null || ranBody === null || samplesOnly) return;
    if (sampleVerdict(run) !== "passed" || chained.current === run.runId) return;
    chained.current = run.runId;
    start(ranBody);
  }, [run, ranBody, start, samplesOnly]);
}

export function useLastSample(run: RunView | null): RunView | null {
  const stage = run === null ? "gone" : sampleVerdict(run) !== null ? "done" : run.scope;
  const [sample, setSample] = useState<RunView | null>(null);
  const [at, setAt] = useState<string | null>(null);
  const key = `${run?.runId ?? ""}:${stage ?? "sao"}`;
  if (at !== key) {
    setAt(key);
    if (stage === "done") setSample(run);
    else if (stage !== undefined) setSample(null);
  }
  return sample;
}

export function useStaticViz(level: PublicLevel): VizData | null {
  const [data, setData] = useState<VizData | null>(null);
  useEffect(() => {
    const stop = new AbortController();
    void (async () => {
      try {
        const response = await fetch(vizUrl(level.id), {
          headers: { Accept: "application/json" },
          signal: stop.signal,
        });
        setData(parseViz(level.id, level.version, await response.json()));
      } catch {}
    })();
    return () => {
      stop.abort();
    };
  }, [level.id, level.version]);
  return data;
}

export function useRecordedRun(level: PublicLevel) {
  const [run, setRun] = useState<RunView | null>(null);
  const [failed, setFailed] = useState(false);
  const asked = useRef(false);
  const show = useCallback(async () => {
    if (asked.current) return;
    asked.current = true;
    let raw: unknown;
    try {
      raw = await (
        await fetch(recordedUrl(level.id), { headers: { Accept: "application/json" } })
      ).json();
    } catch {
      setFailed(true);
      return;
    }
    const log = parseRecorded(level.id, level.version, raw);
    const replayed = log && replayRecorded(log);
    if (!replayed) setFailed(true);
    setRun(replayed ?? null);
  }, [level.id, level.version]);
  return { run, failed, show };
}

function parseGraph(body: string | null): Graph | null {
  if (body === null) return null;
  const parsed = v.safeParse(GraphSchema, JSON.parse(body));
  return parsed.success ? parsed.output : null;
}

const PREVIEW_DEBOUNCE_MS = 250;

export function usePreview(
  levelId: string,
  caseId: string | null,
  body: string,
  wanted: boolean,
): Readonly<Record<string, Extract<Fact, { kind: "retrieved" }>>> | null {
  const [got, setGot] = useState<{
    key: string;
    nodes: Readonly<Record<string, Extract<Fact, { kind: "retrieved" }>>>;
  } | null>(null);
  const key = `${caseId ?? ""} ${body}`;
  useEffect(() => {
    if (!wanted || !caseId) return;
    let live = true;
    const drop = new AbortController();
    const timer = setTimeout(() => {
      void previewRetrieval(levelId, caseId, body, drop.signal).then((result) => {
        if (live && result.ok) setGot({ key, nodes: result.nodes });
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
      drop.abort();
    };
  }, [levelId, caseId, body, wanted, key]);
  return wanted && got?.key === key ? got.nodes : null;
}

function RevealGate({ onReveal }: { onReveal: () => void }) {
  return (
    <section aria-labelledby="wb-reveal-title" className="mt-12 border-t border-line pt-8">
      <h2 id="wb-reveal-title" className="sr-only">
        {PROJECTOR_VI.reveal}
      </h2>
      <p className="max-w-prose text-fg-muted">{PROJECTOR_VI.revealNote}</p>
      <button
        id="wb-reveal"
        type="button"
        onClick={onReveal}
        className={buttonClass("primary", "mt-4")}
      >
        {PROJECTOR_VI.reveal}
      </button>
    </section>
  );
}

export function useLastAttempt(
  run: RunView | null,
  variantId: string | null = null,
): RunView | null {
  const [attempt, setAttempt] = useState<RunView | null>(null);
  const isVariant = run?.scope === "bien_the" || (run !== null && run.runId === variantId);
  if (!isVariant && attempt !== run) setAttempt(run);
  return isVariant ? attempt : run;
}

export function WorkbenchPage({ env, starter, back }: { env: Env; starter: Bench; back: string }) {
  const { level } = env;
  const [initial] = useState(() => loadSaved(env));
  const [bench, setBench] = useState<Bench>(initial.bench ?? starter);
  const [saved, setSaved] = useState(initial.bench !== null);
  const graph = useMemo(() => graphFromBench(env, bench), [env, bench]);
  const body = useMemo(() => JSON.stringify(graph), [graph]);
  const clientIssues = useMemo(() => validateGraph(env, graph), [env, graph]);
  const [serverIssues, setServerIssues] = useState<Issue[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [request, setRequest] = useState<RequestState>({ state: "idle" });
  const [notes, setNotes] = useState<Issue[]>([]);
  const [ours, dispatch] = useReducer(runReducer, null);
  const [lastBody, setLastBody] = useState<string | null>(null);
  const [followed, setFollowed] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<BlockType | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [stopping, setStopping] = useState<{ runId: string; state: "pending" | "failed" } | null>(
    null,
  );
  const [slip, setSlip] = useState(() => loadSlip(level.id));
  const [ranSlip, setRanSlip] = useState<{ runId: string; slip: Slip } | null>(null);
  const focusLater = useFocusLater();

  useRunStream(ours?.runId ?? null, attempt, dispatch);
  const left = useCancelOnLeave(ours);
  const recorded = useRecordedRun(level);
  const viz = useStaticViz(level);
  const run = ours ?? recorded.run;
  const projector = useProjector().on;
  const [revealed, setRevealed] = useState<string | null>(null);
  const masked = projector && run !== null && run.runId !== revealed;
  const [tips, setTips] = useState<Partial<Record<BlockType, string>>>({});
  const sample = useLastSample(ours);
  useRecordStars(level, run);
  const won = useLevelWon(level, run);
  const [machineHost, setMachineHost] = useState<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<RunMark[]>(() => loadHistory(level.id));
  const passing = lastPassing(history);
  useRecordHistory(level.id, run, lastBody, setHistory);
  const [samplesOnly, setSamplesOnly] = useState(false);
  useStarRunAfterSample(
    ours,
    lastBody,
    (starBody) => {
      void send(starBody, newKey());
    },
    samplesOnly,
  );
  const slipOf = useCallback(
    (runId: string) => (ranSlip?.runId === runId ? ranSlip.slip : null),
    [ranSlip],
  );
  const quota = useQuota({
    levelId: level.id,
    cases: level.case_counts.normal + level.case_counts.trap + level.case_counts.info,
    ours,
    samplesCached: sample !== null && lastBody === body,
    slipOf,
    projector,
  });
  const [variantId, setVariantId] = useState<string | null>(null);
  const lastAttempt = useLastAttempt(ours, variantId);
  const hints = useHints({
    levelId: level.id,
    zoneId: level.zone,
    run: lastAttempt,
    ranBody: lastBody,
    gate: {
      left: quota.left,
      starPrice: level.case_counts.normal + level.case_counts.trap + level.case_counts.info,
    },
  });

  const issues = serverIssues ?? clientIssues;
  const active = isActive(run);
  const locked = active || request.state === "sending";
  const changed = lastBody !== null && body !== lastBody;
  const runGraph = useMemo(() => parseGraph(lastBody), [lastBody]);
  const benchRun: BenchRun = !run ? "none" : changed ? "stale" : isActive(run) ? "active" : "done";

  const previewCase = previewableCase(followed, run?.cases ?? [], level);
  const previewNodes = usePreview(level.id, previewCase, body, shouldPreview(benchRun));

  const firstVisible = run?.cases.find((c) => c.role === "visible") ?? run?.cases[0];
  const followedCase = run?.cases.find((c) => c.id === followed) ?? firstVisible ?? null;
  const reveal = run?.report?.gold[followedCase?.id ?? ""];
  const benchView =
    run && followedCase && !changed && !masked
      ? {
          run,
          followed: followedCase,
          gold: reveal
            ? {
                chunks: reveal.gold_chunks,
                ranks: reveal.ranks,
                flags: reveal.flags,
                visible: followedCase.role === "visible",
              }
            : null,
        }
      : null;

  const scoredRun = run?.score ? run.runId : null;
  useEffect(() => {
    if (scoredRun) focusOn(document.getElementById("wb-results"));
  }, [scoredRun]);
  const stopped = sample !== null && sampleVerdict(sample) !== "passed" ? sample.runId : null;
  useEffect(() => {
    if (stopped) focusOn(document.getElementById("wb-sample"));
  }, [stopped]);
  const variantDone = ours?.scope === "bien_the" && ours.phase === "finished" ? ours.runId : null;
  useEffect(() => {
    if (variantDone) focusOn(document.getElementById("wb-variant"));
  }, [variantDone]);
  const failedRun = run?.phase === "failed" ? run.runId : null;
  useEffect(() => {
    if (failedRun) focusOn(document.getElementById("wb-run-failed"));
  }, [failedRun]);
  const lost = run?.stream === "lost";
  useEffect(() => {
    if (lost) focusOn(document.getElementById("wb-lost"));
  }, [lost]);
  const startedRun = run && run.cases.length > 0 ? run.runId : null;
  useEffect(() => {
    const heading = document.getElementById("wb-running");
    if (!startedRun || !heading || document.activeElement !== heading) return;
    if (!window.matchMedia("(min-width: 64rem)").matches)
      heading.scrollIntoView({ block: "start" });
  }, [startedRun]);
  const stop: StopState = stopping && stopping.runId === run?.runId ? stopping.state : null;

  function edit(next: Bench) {
    const fresh = firstTouches(firstTouchTypes(graph, graphFromBench(env, next)));
    if (fresh.length > 0) {
      setTips((shown) => ({
        ...shown,
        ...Object.fromEntries(
          fresh.flatMap((t) => (FIRST_TOUCH_VI[t] ? [[t, FIRST_TOUCH_VI[t]]] : [])),
        ),
      }));
    }
    hints.markLook();
    setBench(next);
    setSaved(save(level.id, level.version, graphFromBench(env, next)));
    setServerIssues(null);
    setSummary(null);
    setRequest({ state: "idle" });
    setNotes([]);
    setHighlight(null);
  }

  function benchFrom(mark: RunMark) {
    const graph = parseGraph(mark.body);
    const remembered = graph === null ? null : benchFromGraph(env, graph);
    if (remembered === null) {
      setNotes([
        {
          code: "W_HISTORY_STALE",
          severity: "info",
          node: null,
          port: null,
          message_vi: "Cấu hình của lượt đó không còn vẽ được trên bàn thợ của màn này.",
        },
      ]);
      return;
    }
    edit(remembered);
  }

  function editSlip(next: Slip) {
    setSlip(next);
    saveSlip(level.id, next);
  }

  async function send(
    sendBody: string,
    key: string,
    before?: Promise<unknown>,
    scope?: "mau" | { variant: string },
  ) {
    const gone = () => left.current;
    setRequest({ state: "sending", key, body: sendBody });
    await before;
    if (gone()) return;
    const result = await postRun(level.id, sendBody, key, scope);
    if (gone()) {
      if (result.ok) void cancelRun(result.runId, { keepalive: true });
      return;
    }
    if (!result.ok) {
      if (result.error.issues) {
        setServerIssues(result.error.issues);
        setSummary({ kind: "server", title: result.error.title });
        setRequest({ state: "idle" });
        focusLater("#wb-issues");
      } else {
        setRequest({ state: "failed", error: result.error, key, body: sendBody });
        focusLater("#wb-request-error");
      }
      return;
    }
    setNotes(result.issues.filter((issue) => issue.severity === "info"));
    setRanSlip(isEmptySlip(slip) ? null : { runId: result.runId, slip });
    editSlip(EMPTY_SLIP);
    setLastBody(sendBody);
    setVariantId(typeof scope === "object" ? result.runId : null);
    setFollowed(null);
    setAttempt(0);
    dispatch({ kind: "reset", runId: result.runId });
    setRequest({ state: "idle" });
    focusLater("#wb-running");
  }

  function openShift(before?: Promise<unknown>) {
    if (errorsOf(issues).length > 0) {
      if (!serverIssues) setSummary({ kind: "client" });
      focusLater("#wb-issues");
      return;
    }
    setSamplesOnly(quota.mode === "sample");
    void send(body, newKey(), before, "mau");
  }

  function showRecorded() {
    if (ours !== null && !isActive(ours)) dispatch({ kind: "clear" });
    void recorded.show();
  }

  function runVariant() {
    if (!hints.target) return;
    if (errorsOf(issues).length > 0) {
      if (!serverIssues) setSummary({ kind: "client" });
      focusLater("#wb-issues");
      return;
    }
    const caseId = pickVariant(level.id, hints.target.key, loadSeen(level.id));
    if (caseId === null) return;
    markSeen(level.id, caseId);
    setSamplesOnly(false);
    void send(body, newKey(), undefined, { variant: caseId });
  }

  function follow(caseId: string) {
    setFollowed(caseId);
    hints.markLook();
  }

  function point(pointer: Pointer) {
    if (pointer.kind === "case") {
      const target = run?.cases.find((c) => c.n === pointer.n);
      if (target) follow(target.id);
      focusLater("#wb-bench-title");
    } else {
      hints.markLook();
      focusSlot(pointer.slot, pointer.param);
    }
  }

  function focusSlot(type: BlockType, param?: string, phrase?: string | null) {
    setHighlight(type);
    focusLater(slotTargets(env, type, param, phrase));
  }

  const live = masked ? "" : liveMessage(run, followedCase?.id ?? null);
  const awaitingReveal = masked && run.phase === "finished" ? run.runId : null;
  useEffect(() => {
    if (awaitingReveal) focusOn(document.getElementById("wb-reveal"));
  }, [awaitingReveal]);
  useEffect(() => {
    if (revealed)
      focusOn(document.getElementById("wb-results") ?? document.getElementById("wb-sample"));
  }, [revealed]);

  return (
    <>
      <Brief level={level} won={won} />
      <div ref={setMachineHost} className="mt-8" />
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6 chieu:lg:grid-cols-[minmax(0,1fr)]">
        <BenchSection
          env={env}
          bench={bench}
          graph={graph}
          onChange={edit}
          locked={locked}
          issues={issues}
          highlight={highlight}
          view={benchView}
          benchRun={benchRun}
          preview={previewNodes}
          viz={viz}
          vizCase={previewCase}
          saved={saved}
          tips={tips}
          machineHost={machineHost}
          discarded={initial.discarded && !saved}
        />
        <aside
          aria-label="Mở ca và lượt chạy"
          className="self-start lg:sticky lg:top-6 lg:-m-1 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:p-1 chieu:lg:static chieu:lg:m-0 chieu:lg:max-h-none chieu:lg:overflow-visible chieu:lg:p-0"
        >
          <RunPanel
            env={env}
            graph={graph}
            body={body}
            lastBody={lastBody}
            issues={issues}
            summary={summary}
            request={request}
            notes={notes}
            run={run}
            stop={stop}
            followedId={followedCase?.id ?? null}
            backTo={back}
            slip={slip}
            onSlip={editSlip}
            onOpen={openShift}
            onRecorded={showRecorded}
            recordedFailed={recorded.failed}
            quota={quota}
            samplesOnly={samplesOnly}
            projector={projector}
            masked={masked}
            onRetry={() => {
              if (request.state === "failed") void send(request.body, request.key);
            }}
            onRestore={() => edit(starter)}
            backToPassing={passing === null ? null : () => benchFrom(passing)}
            onFocusSlot={focusSlot}
            onStop={() => {
              if (!run) return;
              const { runId } = run;
              setStopping({ runId, state: "pending" });
              void cancelRun(runId).then((ok) => {
                if (!ok) setStopping({ runId, state: "failed" });
              });
            }}
            onReconnect={() => {
              dispatch({ kind: "stream", state: "connecting" });
              setAttempt((n) => n + 1);
              focusLater("#wb-running");
            }}
            onRerun={() => {
              if (run && isActive(run)) {
                dispatch({ kind: "clear" });
                openShift(cancelRun(run.runId));
              } else {
                openShift();
              }
            }}
            onAbandon={() => {
              if (run) void cancelRun(run.runId);
              dispatch({ kind: "clear" });
              focusLater("#wb-bench-title");
            }}
            onEdit={() => focusLater("#wb-bench-title")}
            onFollow={follow}
          />
        </aside>
      </div>
      {awaitingReveal && <RevealGate onReveal={() => setRevealed(awaitingReveal)} />}
      {sample && !masked && <SampleResult run={sample} samplesOnly={samplesOnly} />}
      {ours && !masked && <VariantResult run={ours} />}
      {run?.score && !masked && (
        <Results
          key={run.runId}
          env={env}
          run={run}
          changed={changed}
          runGraph={runGraph}
          graph={graph}
          backTo={back}
          slip={ranSlip?.runId === run.runId ? ranSlip.slip : null}
          history={history}
          onDebrief={(extras) => {
            recordExtras(level.id, extras);
            setHistory(loadHistory(level.id));
          }}
          onDuplicate={benchFrom}
          onEdit={() => focusLater("#wb-bench-title")}
          onFocusSlot={focusSlot}
          onLook={hints.markLook}
        />
      )}
      {hints.target && !masked && (
        <HintLadder
          levelId={level.id}
          target={hints.target}
          book={hints.book}
          gate3={hints.gate3}
          variant={pickVariant(level.id, hints.target.key, loadSeen(level.id))}
          busy={locked}
          onOpen={hints.openNext}
          onPointer={point}
          onVariant={runVariant}
        />
      )}
      <p aria-live="polite" className="sr-only">
        {live}
      </p>
    </>
  );
}
