import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleDashIcon,
  ClockIcon,
  CrossIcon,
  LockIcon,
  PlayIcon,
  RotateCwIcon,
  StarIcon,
} from "~/components/ui/icons";

import { Blade } from "./Blade";
import { MachineMap } from "./MachineMap";
import { Prism } from "./Prism";
import { Stamps } from "./Stamps";
import { CitationLedger } from "./CitationLedger";
import { packerSaw } from "./ledger";
import { ContextBin } from "./ContextBin";
import { StarDome } from "./StarDome";
import { articleStrip, focusArticle, variantKey, type VizData } from "./vizData";
import { Strip } from "./Strip";
import {
  domain,
  isAllowed,
  isLocked,
  isOptional,
  nodeIds,
  paramNames,
  roundToStep,
  setAttached,
  setParam,
  setPhrase,
  slotParams,
  type Bench,
  type Domain,
  type Env,
} from "./bench";
import {
  BLOCK_STATE_VI,
  CRITERIA_VI,
  fmt,
  fmtValue,
  DESK_VI,
  GUARD_VI,
  LABEL_VI,
  LEDGER_BOOK_VI,
  LEVEL_COPY,
  outcomeText,
  shownLabels,
  stepStatusText,
  TOKENS_VI,
  TOY,
  toyName,
  vaiVi,
} from "./copy";
import {
  blockState,
  type BenchRun,
  type BlockState,
  type CaseView,
  type RunView,
  type StepView,
} from "./run";
import type { BlockType, CaseRole, Fact, Graph, Issue, JsonValue } from "./schema";
import { fixFor } from "./validate";

export function rich(text: string): ReactNode {
  return text
    .split(/\*([^*]+)\*/)
    .map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part));
}

export const slotId = (env: Env, type: BlockType) => `slot-${nodeIds(env.level)[type]}`;

const CONTROL = ':is(input:not([type="radio"]), input:checked, select, button):not([disabled])';

export function slotTargets(
  env: Env,
  type: BlockType,
  param?: string,
  phrase?: string | null,
): string[] {
  const slot = `#${slotId(env, type)}`;
  const chip = phrase ? `${slot} [data-phrase="${phrase.replace(/["\\]/g, "\\$&")}"]` : null;
  return [
    ...(chip ? [chip] : []),
    ...(param ? [`${slot} [data-param="${param}"] ${CONTROL}`] : []),
    `${slot} ${CONTROL}`,
  ];
}

export function hasControls(env: Env, type: BlockType): boolean {
  if (!isAllowed(env.level, type) || isLocked(env.level, type)) return false;
  if (isOptional(type) || type === "llm" || type === "action_llm") return true;
  return paramNames(env.blocks, type).some((name) => domain(env, type, name)?.kind !== "fixed");
}

export interface SlotGold {
  chunks: readonly string[];
  ranks: Readonly<Record<string, number | null>>;
  flags: readonly string[];
  visible: boolean;
}

export interface BenchRunView {
  run: RunView;
  followed: CaseView;
  gold: SlotGold | null;
}

export type Preview = Readonly<Record<string, Extract<Fact, { kind: "retrieved" }>>>;

interface BenchProps {
  env: Env;
  bench: Bench;
  graph: Graph;
  onChange: (next: Bench) => void;
  locked: boolean;
  issues: readonly Issue[];
  highlight: BlockType | null;
  view: BenchRunView | null;
  benchRun: BenchRun;
  preview: Preview | null;
  viz: VizData | null;
  vizCase: string | null;
  saved: boolean;
  discarded: boolean;
  tips?: Partial<Record<BlockType, string>>;
  machineHost?: HTMLElement | null;
}

const EMPTY_TEXT: Readonly<Record<string, string>> = {
  vector_search: "Không tìm theo nghĩa.",
  bm25_search: "Không tìm theo từ khóa.",
  fusion: "Không gộp: các danh sách đổ thẳng vào bước sau.",
  rerank: "Không xếp hạng lại.",
};

const FLOW: readonly BlockType[] = [
  "input",
  "corpus",
  "chunker",
  "vector_search",
  "bm25_search",
  "fusion",
  "rerank",
  "context_packer",
  "llm",
  "pattern_guard",
  "injection_classifier",
  "action_llm",
  "human_approval",
  "tool_refund",
  "output",
];

export const isDesk = (env: Env) => isAllowed(env.level, "action_llm");

export function BenchSection(props: BenchProps) {
  const { env, locked, view, saved, discarded } = props;
  const { level, blocks } = env;
  const allowed = (type: BlockType) => isAllowed(level, type);
  const flow = (type: BlockType) => Object.values(blocks[type].outputs)[0]?.type_vi ?? "";
  const desk = isDesk(env);
  const notOpened = (["vector_search", "bm25_search", "fusion", "rerank"] as const)
    .filter((type) => !desk && !allowed(type))
    .map((type) => TOY[type].name);
  const [picked, setPicked] = useState<BlockType | null>(
    () => props.highlight ?? FLOW.find((type) => allowed(type) && hasControls(env, type)) ?? null,
  );
  const [seen, setSeen] = useState(props.highlight);
  if (props.highlight !== seen) {
    setSeen(props.highlight);
    if (props.highlight) setPicked(props.highlight);
  }
  const [focusTo, setFocusTo] = useState<{ type: BlockType; n: number } | null>(null);
  useEffect(() => {
    if (!focusTo) return;
    const target = slotTargets(env, focusTo.type)
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .find((el) => el !== null);
    document.getElementById(slotId(env, focusTo.type))?.scrollIntoView({ block: "start" });
    target?.focus({ preventScroll: true });
  }, [focusTo, env]);
  const open = (type: BlockType) => {
    setPicked(type);
    setFocusTo((last) => ({ type, n: (last?.n ?? 0) + 1 }));
  };
  const slot = (type: BlockType) => (
    <Slot key={type} type={type} {...props} open={picked === type} onPick={() => setPicked(type)} />
  );
  const states = Object.fromEntries(
    (Object.keys(blocks) as BlockType[]).map((type) => [type, slotState(props, type)]),
  ) as Record<BlockType, BlockState>;
  const graded = view?.followed.graded;

  const machine = (
    <div className="mt-5 rounded-md border border-line bg-surface p-4">
      <MachineMap
        env={env}
        bench={props.bench}
        onChange={props.onChange}
        onOpen={open}
        onPick={setPicked}
        disabled={locked}
        states={states}
        highlight={props.highlight}
        answer={graded?.counted === true ? (graded.passed ? "pass" : "fail") : null}
        view={view}
      />
    </div>
  );

  return (
    <section aria-labelledby="wb-bench-title">
      <h2 id="wb-bench-title" tabIndex={-1} className="text-2xl font-bold tracking-tight">
        Bàn thợ
      </h2>
      <p className="mt-1 max-w-prose text-fg-muted">
        Gắn, tháo và chỉnh từng món. Mỗi lần mở ca, trợ lý chạy thật trên mọi câu của tối nay.
      </p>
      <div className="mt-2 max-w-prose space-y-1 text-sm text-fg-muted">
        {notOpened.length > 0 && <p>Chưa mở ở màn này: {notOpened.join(", ")}.</p>}
        {discarded && (
          <p>Cấu hình đã lưu không còn hợp với màn này nên bàn thợ dùng cấu hình khởi đầu.</p>
        )}
        {saved && <p>Đã lưu cấu hình trên máy này.</p>}
        {locked && <p className="font-semibold text-fg">Bàn thợ khóa trong lúc chạy.</p>}
      </div>
      {view && (
        <p className="mt-4 flex flex-wrap gap-x-3 rounded-sm bg-brand-tint px-3 py-2 text-sm">
          <span className="font-semibold">
            Đang theo dõi: câu #{view.followed.n} · {vaiVi(view.followed.vai)}
          </span>
          <a href="#wb-cases-title" className="text-brand underline underline-offset-4">
            Đổi câu ở bảng câu
          </a>
        </p>
      )}

      {props.machineHost ? createPortal(machine, props.machineHost) : machine}

      <fieldset disabled={locked} className="mt-5 min-w-0">
        <legend className="sr-only">Các món trên bàn thợ</legend>
        {desk ? (
          <>
            {slot("input")}
            <Connector label={flow("input")} />
            {slot("pattern_guard")}
            <Connector label={flow("pattern_guard")} />
            {slot("injection_classifier")}
            <Connector label={flow("injection_classifier")} />
            {slot("action_llm")}
            <Connector label={DESK_VI.branch} />
            <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
              {slot("human_approval")}
              {slot("tool_refund")}
            </div>
            <Connector label={flow("action_llm")} />
            {slot("output")}
          </>
        ) : (
          <LibraryFlow slot={slot} allowed={allowed} flow={flow} />
        )}
      </fieldset>
    </section>
  );
}

function LibraryFlow({
  slot,
  allowed,
  flow,
}: {
  slot: (type: BlockType) => ReactNode;
  allowed: (type: BlockType) => boolean;
  flow: (type: BlockType) => string;
}) {
  return (
    <>
      {slot("input")}
      <Connector label={flow("input")} />
      <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
        {slot("corpus")}
        {slot("chunker")}
      </div>
      <Connector label={flow("chunker")} />
      {(allowed("vector_search") || allowed("bm25_search")) && (
        <>
          <div
            className={`grid gap-3 ${allowed("vector_search") && allowed("bm25_search") ? "sm:grid-cols-2" : ""}`}
          >
            {allowed("vector_search") && slot("vector_search")}
            {allowed("bm25_search") && slot("bm25_search")}
          </div>
          <Connector label={flow("vector_search")} />
        </>
      )}
      {allowed("fusion") && (
        <>
          {slot("fusion")}
          <Connector label={flow("fusion")} />
        </>
      )}
      {allowed("rerank") && (
        <>
          {slot("rerank")}
          <Connector label={flow("rerank")} />
        </>
      )}
      {slot("context_packer")}
      <Connector label={flow("context_packer")} />
      {slot("llm")}
      <Connector label={flow("llm")} />
      {slot("output")}
    </>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="flex h-8 items-center gap-3 pl-6">
      <span className="h-full w-0.5 bg-line" />
      <span className="text-xs text-fg-muted">{label}</span>
    </div>
  );
}

export const CHIP =
  "flex h-11 min-w-11 items-center justify-center rounded-sm border border-fg-muted bg-surface px-3 text-sm peer-checked:border-brand peer-checked:bg-brand peer-checked:text-on-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:cursor-not-allowed peer-disabled:opacity-60";

const STATE_LOOK: Readonly<
  Record<BlockState, { Icon: (props: { className?: string }) => ReactNode; tone: string }>
> = {
  idle: { Icon: CircleDashIcon, tone: "border-line-strong text-fg-muted" },
  stale: { Icon: RotateCwIcon, tone: "border-warning text-warning" },
  queued: { Icon: ClockIcon, tone: "border-line-strong text-fg-muted" },
  running: { Icon: PlayIcon, tone: "border-brand text-brand" },
  passed: { Icon: CheckIcon, tone: "border-success text-success" },
  error: { Icon: CrossIcon, tone: "border-danger text-danger" },
};

export function StateChip({ state }: { state: BlockState }) {
  const { Icon, tone } = STATE_LOOK[state];
  return (
    <span
      data-state={state}
      className={`inline-flex items-center gap-1 rounded-sm border bg-surface px-1.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="text-fg">
        <span className="sr-only">Trạng thái khối: </span>
        {BLOCK_STATE_VI[state]}
      </span>
    </span>
  );
}

const WARN = new Set(["timeout", "cancelled", "budget"]);
const DANGER = new Set(["llm_error", "index_error"]);

function frameClass(step: StepView | undefined, highlighted: boolean, failed: boolean): string {
  if (highlighted) return "border-brand ring-2 ring-brand bg-brand-tint";
  if (failed) return "border-danger ring-1 ring-danger bg-surface";
  if (step?.state === "running") return "border-brand ring-1 ring-brand bg-surface";
  if (!step) return "border-line bg-surface";
  if (step.status === "ok") return "border-success ring-1 ring-success bg-surface";
  if (step.status && WARN.has(step.status)) return "border-warning bg-warning-tint";
  if (step.status && DANGER.has(step.status)) return "border-danger bg-danger-tint";
  return "border-warning bg-surface";
}

function slotState({ env, view, benchRun }: BenchProps, type: BlockType): BlockState {
  const step = view ? view.followed.steps[nodeIds(env.level)[type]] : undefined;
  const graded = type === "output" ? view?.followed.graded : undefined;
  return blockState(benchRun, step, {
    started: (view?.run.cases.length ?? 0) > 0,
    ingest: type === "corpus" || type === "chunker",
    failedAnswer: graded?.counted === true && !graded.passed,
  });
}

function Slot(props: BenchProps & { type: BlockType; open: boolean; onPick: () => void }) {
  const {
    type,
    env,
    bench,
    graph,
    onChange,
    issues,
    highlight,
    view,
    preview,
    viz,
    vizCase,
    tips = {},
    open,
    onPick,
  } = props;
  const { level, blocks } = env;
  const id = nodeIds(level)[type];
  const titleId = `${slotId(env, type)}-title`;
  const locked = isLocked(level, type);
  const params = slotParams(env, bench, type);
  const toy = toyName(type, params);
  const optional = isOptional(type);
  const step = view ? view.followed.steps[id] : undefined;
  const own = issues.filter((issue) => issue.node === id);
  const graded = type === "output" ? view?.followed.graded : undefined;
  const state = slotState(props, type);
  const knobs = paramNames(blocks, type)
    .filter((name) => !(type === "fusion" && name === (params.method === "alpha" ? "k" : "alpha")))
    .flatMap((name) => {
      const d: Domain | null = locked
        ? { kind: "fixed", value: params[name] ?? null }
        : domain(env, type, name);
      return d ? [{ name, d }] : [];
    });
  const fixed = knobs.filter(({ d }) => d.kind === "fixed");

  if (optional && !bench.attached[type]) {
    const retrievalEmpty =
      (type === "vector_search" || type === "bm25_search") &&
      !(isAllowed(level, "vector_search") && bench.attached.vector_search) &&
      !(isAllowed(level, "bm25_search") && bench.attached.bm25_search);
    const fact =
      retrievalEmpty && type === "vector_search"
        ? "Không có khe truy xuất nào: thùng chỉ có câu hỏi."
        : EMPTY_TEXT[type];
    return (
      <section
        id={slotId(env, type)}
        aria-labelledby={titleId}
        data-slot-open={open}
        className={`rounded-md border-2 border-dashed ${open ? "p-4" : "px-4 py-2"} ${highlight === type ? "border-brand" : "border-line-strong"}`}
      >
        <SlotHead titleId={titleId} toy={toy} type={type} env={env} />
        <AttachSwitch
          toy={toy}
          on={false}
          onToggle={() => {
            onChange(setAttached(bench, type, true));
            onPick();
          }}
        />
        {open && <p className="mt-1 max-w-prose text-sm text-fg-muted">{fact}</p>}
        <SlotIssues env={env} graph={graph} issues={own} />
      </section>
    );
  }

  const frame = frameClass(step, highlight === type, graded?.counted === true && !graded.passed);
  const head = (
    <SlotHead titleId={titleId} toy={toy} type={type} env={env}>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {locked && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-muted">
            <LockIcon className="size-3.5 shrink-0" />
            Khóa ở màn này
          </span>
        )}
        <StateChip state={state} />
        {!open && (
          <button
            type="button"
            aria-expanded={false}
            aria-label={`Mở ${toy}`}
            onClick={onPick}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand"
          >
            Mở
            <ChevronDownIcon />
          </button>
        )}
      </span>
    </SlotHead>
  );

  if (!open) {
    return (
      <section
        id={slotId(env, type)}
        aria-labelledby={titleId}
        data-slot-open="false"
        className={`rounded-md border px-4 py-2 transition-colors duration-150 ${frame}`}
      >
        {head}
        {graded && view && <Grade c={view.followed} />}
        <SlotIssues env={env} graph={graph} issues={own} />
      </section>
    );
  }

  return (
    <section
      id={slotId(env, type)}
      aria-labelledby={titleId}
      data-slot-open="true"
      className={`rounded-md border p-4 transition-colors duration-150 ${frame}`}
    >
      {head}
      {optional && (
        <AttachSwitch toy={toy} on onToggle={() => onChange(setAttached(bench, type, false))} />
      )}
      {tips[type] && (
        <p data-first-touch={type} className="mt-2 max-w-prose text-sm chieu:hidden">
          {tips[type]}
        </p>
      )}

      {graded && view && <Grade c={view.followed} />}

      {type === "corpus" && (
        <p className="mt-2 text-sm">
          Kho:{" "}
          {level.corpus.map((doc, index) => (
            <span key={doc}>
              {index > 0 && ", "}
              <code className="font-mono text-xs">{doc}</code>
            </span>
          ))}
        </p>
      )}

      <div className="mt-3 space-y-4 empty:hidden">
        {knobs
          .filter(({ d }) => d.kind !== "fixed")
          .map(({ name, d }) => (
            <Control
              key={name}
              env={env}
              type={type}
              param={name}
              domain={d}
              value={params[name] ?? null}
              inert={LEVEL_COPY[level.id]?.inertKnobs?.[name]}
              onValue={(value) => onChange(setParam(env, bench, type, name, value))}
            />
          ))}
        {(type === "llm" || type === "action_llm") && !locked && (
          <Prism env={env} bench={bench} onChange={onChange} />
        )}
        {type === "pattern_guard" && <PhraseTray env={env} bench={bench} onChange={onChange} />}
        {type === "injection_classifier" && (
          <p data-precomputed="" className="max-w-prose text-xs text-fg-muted">
            {DESK_VI.precomputed}
          </p>
        )}
        {fixed.length > 0 && (
          <details data-fixed-params={fixed.length} className="group">
            <summary className="inline-flex min-h-11 cursor-pointer items-center gap-1 text-sm text-fg-muted">
              <LockIcon className="size-3.5 shrink-0" />
              {fixed.length} thông số giữ cố định ở màn này
              <ChevronDownIcon />
            </summary>
            <div className="mt-1 space-y-2">
              {fixed.map(({ name, d }) => (
                <Control
                  key={name}
                  env={env}
                  type={type}
                  param={name}
                  domain={d}
                  value={params[name] ?? null}
                  onValue={() => undefined}
                />
              ))}
            </div>
          </details>
        )}
      </div>

      {type === "chunker" && view && <Ingestion run={view.run} node={id} gold={view.gold} />}
      {type === "chunker" && <ChunkerStrip env={env} params={params} viz={viz} caseId={vizCase} />}
      <SlotIssues env={env} graph={graph} issues={own} />
      {step && (
        <StepState
          step={step}
          node={id}
          toy={toy}
          gold={view?.gold ?? null}
          packed={packedIds(view)}
          caseRole={view?.followed.role ?? null}
          ranked={packerSaw(view?.followed.steps ?? {})}
          prompt={promptTokens(view)}
        />
      )}
      {!step && preview?.[id] && (
        <StarDome items={preview[id].items} goldChunks={[]} goldRank={null} showGold={false} />
      )}
    </section>
  );
}

function SlotHead({
  titleId,
  toy,
  type,
  env,
  children,
}: {
  titleId: string;
  toy: string;
  type: BlockType;
  env: Env;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <div className="min-w-0">
        <h3 id={titleId} className="text-base font-bold">
          {toy}
        </h3>
        <p className="text-xs text-fg-muted">
          {env.blocks[type].name_vi} · <code className="font-mono">{type}</code>
        </p>
      </div>
      {children}
    </div>
  );
}

function AttachSwitch({ toy, on, onToggle }: { toy: string; on: boolean; onToggle: () => void }) {
  return (
    <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
      <input
        type="checkbox"
        role="switch"
        checked={on}
        onChange={onToggle}
        className="size-5 shrink-0 accent-brand"
      />
      Gắn {toy}
    </label>
  );
}

export function Grade({ c }: { c: CaseView }) {
  const graded = c.graded;
  const tone = !graded?.counted
    ? "bg-subtle"
    : graded.passed
      ? "bg-success-tint"
      : "bg-danger-tint";
  return (
    <>
      <p className={`mt-2 inline-block rounded-sm px-2 py-0.5 text-sm font-semibold ${tone}`}>
        {outcomeText(c)}
      </p>
      {graded && (
        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tiêu chí">
          {Object.entries(graded.criteria).map(([name, ok]) => (
            <li
              key={name}
              className="inline-flex items-center gap-1 rounded-sm border border-line px-2 py-0.5 text-xs"
            >
              {ok ? (
                <CheckIcon className="size-3.5 shrink-0 text-success" />
              ) : (
                <CrossIcon className="size-3.5 shrink-0 text-danger" />
              )}
              <span className="sr-only">{ok ? "Đạt" : "Trượt"}: </span>
              {CRITERIA_VI[name] ?? name}
            </li>
          ))}
          {shownLabels(graded.labels).map((label) => (
            <li key={label} className="rounded-sm bg-subtle px-2 py-0.5 text-xs">
              {LABEL_VI[label] ?? label}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function SlotIssues({ env, graph, issues }: { env: Env; graph: Graph; issues: readonly Issue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="mt-3 max-w-prose space-y-1">
      {issues.map((issue, index) => (
        <li
          key={index}
          className={`flex gap-2 text-sm ${issue.severity === "error" ? "text-danger" : "text-fg-muted"}`}
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {issue.severity === "error" ? <span className="sr-only">Lỗi: </span> : null}
            {rich(issue.message_vi)} {fixFor(env, graph, issue)?.hint}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PhraseTray({
  env,
  bench,
  onChange,
}: {
  env: Env;
  bench: Bench;
  onChange: (next: Bench) => void;
}) {
  const id = useId();
  const tray = env.level.phrase_tray;
  return (
    <div data-phrase-tray="" data-param="phrases">
      <p id={id} className="text-sm font-medium">
        {DESK_VI.tray(bench.phrases.length, tray.length)}
      </p>
      <ul aria-labelledby={id} className="mt-2 flex flex-wrap gap-1">
        {tray.map((phrase) => {
          const on = bench.phrases.includes(phrase);
          return (
            <li key={phrase}>
              <button
                type="button"
                aria-pressed={on}
                data-phrase={phrase}
                onClick={() => onChange(setPhrase(env.level, bench, phrase, !on))}
                className="inline-flex min-h-11 items-center rounded-sm border border-fg-muted bg-surface px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-on-brand"
              >
                {phrase}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-1 max-w-prose text-xs text-fg-muted">{DESK_VI.match}</p>
    </div>
  );
}

function ParamLabel({ env, type, param }: { env: Env; type: BlockType; param: string }) {
  const title = env.blocks[type].params.properties[param]?.title ?? param;
  const toy = TOY[type].params?.[param];
  return (
    <>
      {toy && toy !== TOY[type].name && toy !== title ? `${toy} · ${title}` : title} ·{" "}
      <code className="font-mono text-xs">{param}</code>
    </>
  );
}

function BladeStops({
  param,
  label,
  options,
  value,
  onValue,
}: {
  param: string;
  label: ReactNode;
  options: readonly JsonValue[];
  value: JsonValue;
  onValue: (value: JsonValue) => void;
}) {
  const id = useId();
  const index = Math.max(
    0,
    options.findIndex((option) => option === value),
  );
  const current = fmtValue(param, options[index] ?? null);
  return (
    <div data-param={param}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span aria-hidden="true" className="text-sm font-semibold tabular-nums">
          {current}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        aria-valuetext={current}
        onChange={(event) => onValue(options[Number(event.target.value)] ?? null)}
        className="mt-1 h-11 w-full cursor-pointer accent-brand"
      />
      <ol aria-hidden="true" className="flex justify-between text-xs text-fg-muted tabular-nums">
        {options.map((option, at) => (
          <li
            key={JSON.stringify(option)}
            data-blade-stop={at === index ? "on" : ""}
            className={at === index ? "font-semibold text-fg" : undefined}
          >
            {typeof option === "number" ? fmt(option) : fmtValue(param, option)}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Control({
  env,
  type,
  param,
  domain: d,
  value,
  inert,
  onValue,
}: {
  env: Env;
  type: BlockType;
  param: string;
  domain: Domain;
  value: JsonValue;
  inert?: string | undefined;
  onValue: (value: JsonValue) => void;
}) {
  const id = useId();
  const label = <ParamLabel env={env} type={type} param={param} />;
  switch (d.kind) {
    case "fixed":
      return (
        <p data-param={param} className="flex items-start gap-2 text-sm">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-fg-muted" />
          <span>
            {label}: <strong>{fmtValue(param, d.value)}</strong> · cố định ở màn này
          </span>
        </p>
      );
    case "toggle":
      return (
        <div data-param={param}>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm has-disabled:cursor-not-allowed has-disabled:text-fg-muted">
            <input
              type="checkbox"
              role="switch"
              checked={value === true}
              disabled={inert !== undefined}
              aria-describedby={inert ? `${id}-inert` : undefined}
              onChange={(event) => onValue(event.target.checked)}
              className="size-5 shrink-0 accent-brand disabled:opacity-60"
            />
            <span>{label}</span>
          </label>
          {inert && (
            <p id={`${id}-inert`} className="max-w-prose text-xs text-fg-muted">
              {inert}
            </p>
          )}
        </div>
      );
    case "choice":
      if (param === "chunk_size") {
        return (
          <BladeStops
            param={param}
            label={label}
            options={d.options}
            value={value}
            onValue={onValue}
          />
        );
      }
      return (
        <fieldset data-param={param}>
          <legend className="text-sm font-medium">{label}</legend>
          <div className="mt-2 flex flex-wrap gap-1">
            {d.options.map((option) => (
              <label key={JSON.stringify(option)} className="cursor-pointer">
                <input
                  type="radio"
                  name={id}
                  checked={option === value}
                  onChange={() => onValue(option)}
                  className="peer sr-only"
                />
                <span className={CHIP}>{fmtValue(param, option)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "range": {
      const current = typeof value === "number" ? value : d.min;
      return (
        <div data-param={param}>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
            <span aria-hidden="true" className="text-sm font-semibold tabular-nums">
              {fmtValue(param, current)}
            </span>
          </div>
          <input
            id={id}
            type="range"
            min={d.min}
            max={d.max}
            step={d.step}
            value={current}
            aria-valuetext={fmtValue(param, current)}
            onChange={(event) => {
              const next = roundToStep(Number(event.target.value), d.step);
              onValue(d.integer ? Math.round(next) : next);
            }}
            className="mt-1 h-11 w-full cursor-pointer accent-brand disabled:cursor-not-allowed"
          />
          <p className="text-xs text-fg-muted tabular-nums">
            {fmt(d.min)}–{fmt(d.max)}
          </p>
        </div>
      );
    }
  }
}

function Ingestion({ run, node, gold }: { run: RunView; node: string; gold: SlotGold | null }) {
  const info = run.ingestion.find((item) => item.node === node);
  if (!info) return null;
  const split = (gold?.visible && gold.flags.includes("ret.boundary_split")) ?? false;
  return (
    <Blade variant={info.variant} chunks={info.chunks} avgTokens={info.avg_tokens} split={split} />
  );
}

function promptTokens(view: BenchRunView | null): number | null {
  for (const step of Object.values(view?.followed.steps ?? {})) {
    if (step.block === "llm" || step.block === "action_llm") return step.tokens?.in ?? null;
  }
  return null;
}

function packedIds(view: BenchRunView | null): readonly string[] {
  for (const step of Object.values(view?.followed.steps ?? {})) {
    const pack = step.facts?.find((f): f is Extract<Fact, { kind: "pack" }> => f.kind === "pack");
    if (pack) return pack.included;
  }
  return [];
}

function StepState({
  step,
  node,
  toy,
  gold,
  packed: packedIn,
  caseRole,
  ranked,
  prompt,
}: {
  step: StepView;
  node: string;
  toy: string;
  gold: SlotGold | null;
  packed: readonly string[];
  caseRole: CaseRole | null;
  ranked: readonly Extract<Fact, { kind: "retrieved" }>["items"][number][];
  prompt: number | null;
}) {
  const retrieved = step.facts?.find(
    (f): f is Extract<Fact, { kind: "retrieved" }> => f.kind === "retrieved",
  );
  const packed = step.facts?.find((f): f is Extract<Fact, { kind: "pack" }> => f.kind === "pack");
  const said = step.facts?.find((f): f is Extract<Fact, { kind: "llm" }> => f.kind === "llm");
  return (
    <div className="mt-3 border-t border-line pt-3 text-sm">
      <p className="font-semibold">{stepStatusText(step.status, step.ms)}</p>
      {step.summary && <p className="mt-1 max-w-prose text-fg-muted">{step.summary}</p>}
      {said?.answer !== undefined && gold?.visible !== false && (
        <Stamps answer={said.answer} included={packedIn} />
      )}
      {said && (
        <CitationLedger
          caseRole={caseRole}
          ranked={ranked}
          included={packedIn}
          cited={said.cited_ids}
          gold={gold}
        />
      )}
      {packed && (
        <ContextBin
          tokens={packed.tokens}
          included={packed.included}
          dropped={packed.dropped}
          ranked={ranked}
          promptTokens={prompt}
        />
      )}
      {retrieved && (
        <StarDome
          items={retrieved.items}
          goldChunks={gold?.chunks ?? []}
          goldRank={gold?.ranks[node] ?? null}
          showGold={gold?.visible ?? false}
        />
      )}
      {step.facts && step.facts.length > 0 && (
        <details className="group mt-2">
          <summary className="flex min-h-11 cursor-pointer items-center gap-1 font-semibold text-brand">
            Xem số liệu<span className="sr-only"> của {toy}</span>
            <ChevronDownIcon />
          </summary>
          <div className="space-y-3">
            {step.facts.map((fact, index) => (
              <FactView key={index} fact={fact} step={step} gold={gold} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function FactView({ fact, step, gold }: { fact: Fact; step: StepView; gold: SlotGold | null }) {
  if (fact.kind === "retrieved") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-fg-muted">
            <tr>
              <th scope="col" className="py-1 pr-3 font-medium">
                Hạng
              </th>
              <th scope="col" className="py-1 pr-3 font-medium">
                Điều/khoản
              </th>
              <th scope="col" className="py-1 pr-3 font-medium">
                Điểm
              </th>
              <th scope="col" className="py-1 font-medium">
                Văn bản
              </th>
            </tr>
          </thead>
          <tbody>
            {fact.items.map((item) => {
              const isGold = (gold?.visible && gold.chunks.includes(item.chunk_id)) ?? false;
              return (
                <tr key={item.chunk_id} className="border-t border-line">
                  <td className="py-1 pr-3 tabular-nums">{item.rank}</td>
                  <td className="py-1 pr-3">
                    Điều {item.dieu}
                    {item.khoan.length > 0 && `, khoản ${item.khoan.join(", ")}`}
                    {isGold && (
                      <span className="ml-1 inline-flex items-center gap-1 font-semibold">
                        <StarIcon className="size-3.5 shrink-0 fill-accent stroke-accent" />
                        Đoạn đáp án
                      </span>
                    )}
                  </td>
                  <td className="py-1 pr-3 tabular-nums">{fmt(item.score)}</td>
                  <td className="py-1">
                    {item.doc_id}
                    {!item.hieu_luc && " · hết hiệu lực"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  if (fact.kind === "pack") {
    const { total, budget, docs, query } = fact.tokens;
    return (
      <div className="space-y-1">
        <p>
          {fmt(total)}/{fmt(budget)} token <span className="text-fg-muted">({TOKENS_VI.bin})</span>
        </p>
        <Bar value={total} max={budget} />
        <p className="text-fg-muted">
          Tài liệu {fmt(docs)} · Câu hỏi {fmt(query)}
        </p>
        <p>
          Vào thùng: {fact.included.length} đoạn. Bị cắt: {fact.dropped.length} đoạn.
        </p>
      </div>
    );
  }
  if (fact.kind === "guard") {
    const blocked = fact.decision === "block";
    return (
      <p data-guard={fact.decision} className={blocked ? "font-semibold text-danger" : undefined}>
        {fact.by === "pattern" ? TOY.pattern_guard.name : TOY.injection_classifier.name}:{" "}
        {blocked ? "chặn" : "cho qua"}
        {fact.matched !== undefined && <> · khớp «{fact.matched}»</>}
        {fact.score !== undefined && (
          <>
            {" "}
            · điểm {fmt(fact.score)} <span className="text-fg-muted">({GUARD_VI.precomputed})</span>
          </>
        )}
      </p>
    );
  }
  if (fact.kind === "ledger") {
    if (fact.entries.length === 0) return <p className="text-fg-muted">{LEDGER_BOOK_VI.empty}</p>;
    return (
      <ul aria-label={LEDGER_BOOK_VI.label} className="space-y-1">
        {fact.entries.map((entry, index) => (
          <li
            key={index}
            data-ledger={entry.executed ? "executed" : "held"}
            className={`rounded-sm border px-2 py-1 font-mono text-xs ${
              entry.executed ? "border-line-strong" : "border-dashed border-line"
            }`}
          >
            {LEDGER_BOOK_VI.line(entry)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-1">
      {step.tokens && (
        <p>
          {fmt(step.tokens.in)} vào · {fmt(step.tokens.out)} ra token{" "}
          <span className="text-fg-muted">({TOKENS_VI.usage})</span>
        </p>
      )}
      <p>
        Model <code className="font-mono text-xs">{fact.model}</code>
        {fact.replayed && (
          <span className="ml-2 rounded-sm border border-line px-1.5 py-0.5 text-xs">
            Kết quả đã lưu
          </span>
        )}
      </p>
      <p className="text-fg-muted">Dặn dò {fmt(fact.system_tokens)} token, ngoài thùng</p>
      {fact.cited_ids.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Mã đã trích">
          {fact.cited_ids.map((cite) => (
            <li
              key={cite}
              className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs break-all"
            >
              {cite}
            </li>
          ))}
        </ul>
      )}
      {fact.answer && (
        <blockquote className="border-l-2 border-line-strong pl-3 whitespace-pre-line">
          {fact.answer}
        </blockquote>
      )}
    </div>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <svg aria-hidden="true" viewBox="0 0 100 4" preserveAspectRatio="none" className="h-1.5 w-full">
      <rect width="100" height="4" className="fill-subtle" />
      <rect width={width} height="4" className={value > max ? "fill-danger" : "fill-brand"} />
    </svg>
  );
}

function ChunkerStrip({
  env,
  params,
  viz,
  caseId,
}: {
  env: Env;
  params: Readonly<Record<string, unknown>>;
  viz: VizData | null;
  caseId: string | null;
}) {
  if (viz === null || caseId === null) return null;
  const turnable = (["strategy", "chunk_size", "overlap_pct"] as const).some(
    (name) => domain(env, "chunker", name)?.kind !== "fixed",
  );
  if (isLocked(env.level, "chunker") || !turnable) return null;
  const variant = variantKey(params);
  if (variant === null) return null;
  const ref = focusArticle(viz, variant, caseId);
  if (ref === null) return null;
  const strip = articleStrip(viz, variant, ref.docId, ref.dieu);
  return strip === null ? null : <Strip strip={strip} variant={variant} />;
}
