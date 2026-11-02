import {
  cardsFromPrompt,
  domain,
  fillDefaults,
  isAllowed,
  isLocked,
  isOptional,
  nodeIds,
  sameJson,
  SLOT_ORDER,
  type Env,
  promptType,
} from "./bench";
import { TOY } from "./copy";
import type { BlockType, Graph, JsonValue } from "./schema";

export type Change =
  | { kind: "slot"; type: BlockType }
  | { kind: "param"; type: BlockType; param: string; from: JsonValue; to: JsonValue }
  | { kind: "card"; slot: 0 | 1 | 2; from: string | null; to: string | null }
  | { kind: "phrase"; phrase: string; on: boolean };

const CARDS = "system_prompt";
const PHRASES = "phrases";

const phraseList = (value: JsonValue | undefined): string[] =>
  Array.isArray(value) ? value.filter((p): p is string => typeof p === "string") : [];

export function diffGraphs(env: Env, before: Graph, after: Graph): Change[] {
  const a = fillDefaults(env.blocks, before);
  const b = fillDefaults(env.blocks, after);
  const node = (graph: Graph, id: string) => graph.nodes.find((n) => n.id === id);
  const ids = nodeIds(env.level);
  const changes: Change[] = [];

  for (const type of SLOT_ORDER) {
    const id = ids[type];
    const was = node(a, id);
    const now = node(b, id);
    if ((was === undefined) !== (now === undefined)) changes.push({ kind: "slot", type });
    if (was === undefined || now === undefined) continue;
    for (const param of Object.keys(env.blocks[type].params.properties)) {
      if (param === CARDS) continue;
      if (param === PHRASES) {
        const before = new Set(phraseList(was.params[param]));
        const after = new Set(phraseList(now.params[param]));
        for (const phrase of before)
          if (!after.has(phrase)) changes.push({ kind: "phrase", phrase, on: false });
        for (const phrase of after)
          if (!before.has(phrase)) changes.push({ kind: "phrase", phrase, on: true });
        continue;
      }
      if (!sameJson(was.params[param], now.params[param])) {
        changes.push({
          kind: "param",
          type,
          param,
          from: was.params[param] ?? null,
          to: now.params[param] ?? null,
        });
      }
    }
  }

  const llm = ids[promptType(env)];
  const prompt = (graph: Graph) => {
    const value = node(graph, llm)?.params[CARDS];
    return typeof value === "string" ? value : "";
  };
  const wasCards = cardsFromPrompt(env.level, prompt(a));
  const nowCards = cardsFromPrompt(env.level, prompt(b));
  if (wasCards !== null && nowCards !== null) {
    for (const slot of [0, 1, 2] as const) {
      if (wasCards[slot] !== nowCards[slot]) {
        changes.push({ kind: "card", slot, from: wasCards[slot], to: nowCards[slot] });
      }
    }
  }
  return changes;
}

export type NextDirection = "on" | "off" | "up" | "down" | "add" | "remove";

export interface NextPick {
  type: BlockType;
  param?: string;
  slot?: 0 | 1 | 2;
  direction: NextDirection;
}

export interface NextOption {
  label: string;
  pick: NextPick;
}

export function nextPickOptions(env: Env, graph: Graph): NextOption[] {
  const ids = nodeIds(env.level);
  const node = (id: string) => graph.nodes.find((n) => n.id === id);
  const options: NextOption[] = [];

  const knobOptions = (type: BlockType, params: Readonly<Record<string, JsonValue>>) => {
    for (const param of Object.keys(env.blocks[type].params.properties)) {
      if (param === "system_prompt") continue;
      const d = domain(env, type, param);
      if (d === null || d.kind === "fixed" || d.kind === "choice") continue;
      const name = TOY[type].params?.[param] ?? param;
      if (d.kind === "toggle") {
        const on = params[param] === true;
        options.push({
          label: on ? `Rút ${name}` : `Gắn ${name}`,
          pick: { type, param, direction: on ? "off" : "on" },
        });
      } else {
        options.push({ label: `Tăng ${name}`, pick: { type, param, direction: "up" } });
        options.push({ label: `Giảm ${name}`, pick: { type, param, direction: "down" } });
      }
    }
  };

  const phraseOptions = (type: BlockType, params: Readonly<Record<string, JsonValue>>) => {
    if (!(PHRASES in env.blocks[type].params.properties)) return;
    const picked = phraseList(params[PHRASES]).length;
    const name = TOY[type].name;
    if (picked < env.level.phrase_tray.length)
      options.push({
        label: `Thêm một cụm vào ${name}`,
        pick: { type, param: PHRASES, direction: "add" },
      });
    if (picked > 0)
      options.push({
        label: `Rút một cụm khỏi ${name}`,
        pick: { type, param: PHRASES, direction: "remove" },
      });
  };

  for (const type of SLOT_ORDER) {
    const id = ids[type];
    if (isLocked(env.level, type) || !isAllowed(env.level, type)) continue;
    if (isOptional(type)) {
      const n = node(id);
      if (n === undefined) {
        options.push({ label: `Gắn ${TOY[type].name}`, pick: { type, direction: "on" } });
      } else {
        options.push({ label: `Rút ${TOY[type].name}`, pick: { type, direction: "off" } });
        knobOptions(type, n.params);
        phraseOptions(type, n.params);
      }
      continue;
    }
    const n = node(id);
    if (n !== undefined && type !== "input" && type !== "corpus" && type !== "output") {
      knobOptions(type, n.params);
    }
  }

  const brain = promptType(env);
  const llm = node(ids[brain]);
  const prompt = typeof llm?.params.system_prompt === "string" ? llm.params.system_prompt : "";
  const cards = cardsFromPrompt(env.level, prompt);
  if (cards !== null && !isLocked(env.level, brain) && isAllowed(env.level, brain)) {
    for (const slot of [0, 1, 2] as const) {
      const filled = cards[slot] !== null;
      options.push({
        label: filled ? `Bỏ Lăng kính (khe ${slot + 1})` : `Thêm Lăng kính (khe ${slot + 1})`,
        pick: { type: brain, param: "system_prompt", slot, direction: filled ? "remove" : "add" },
      });
    }
  }

  return options;
}
