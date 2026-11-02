import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export const STAGE = { open: 0, fetch: 1, boot: 2, build: 3, paint: 4, done: 5 } as const;
export const STEPS = 5;
export const APPEAR_MS = 150;
export const FADE_MS = 200;
const FIRST_FRAME_TIMEOUT_MS = 2500;

export interface SceneLoad {
  stage: number;
  since: number;
  begun: number;
  run: number;
  live: boolean;
  failed: boolean;
}

export const sceneLoad = createStore<SceneLoad>(() => ({
  stage: STAGE.open,
  since: 0,
  begun: 0,
  run: 0,
  live: false,
  failed: false,
}));

export const useSceneLoad = <T>(pick: (state: SceneLoad) => T) => useStore(sceneLoad, pick);

export function beginScene(): boolean {
  const s = sceneLoad.getState();
  if (s.live || s.failed) return false;
  const now = performance.now();
  const paint = (name: string) => performance.getEntriesByName(name)[0]?.startTime;
  const begun = document.querySelector("[data-scene-loader]")
    ? (paint("first-paint") ?? paint("first-contentful-paint") ?? now)
    : now;
  sceneLoad.setState({ stage: STAGE.fetch, since: now, begun, run: s.run + 1 });
  performance.mark("vg-scene-1");
  return true;
}

export function advanceScene(stage: number) {
  const s = sceneLoad.getState();
  if (stage <= s.stage || s.failed) return;
  sceneLoad.setState({ stage, since: performance.now() });
  performance.mark(`vg-scene-${stage}`);
  if (stage === STAGE.paint) {
    const { run } = s;
    setTimeout(() => {
      if (sceneLoad.getState().run === run) advanceScene(STAGE.done);
    }, FIRST_FRAME_TIMEOUT_MS);
  }
}

export function sceneMounted(live: boolean) {
  sceneLoad.setState({ live });
  if (live) advanceScene(STAGE.build);
}

export const failScene = () => sceneLoad.setState({ failed: true, since: performance.now() });

export const CEILINGS: readonly (readonly [number, number, number])[] = [
  [0, 0, 1],
  [0, 0.6, 2500],
  [0.6, 0.72, 300],
  [0.72, 0.92, 600],
  [0.92, 1, 300],
];

export function progress(stage: number, msInStage: number, reduced: boolean): number {
  if (stage >= STAGE.done || reduced) return 1;
  const [a, b, tau] = CEILINGS[Math.max(stage, 0)] ?? [0, 0, 1];
  return a + (b - a) * 0.9 * (1 - Math.exp(-msInStage / tau));
}
