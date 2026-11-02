import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import { HOME_YAW, nextIsoYaw, wrapAngle } from "./camera";
import {
  INTERACT_RADIUS,
  routeTo,
  SPAWN,
  SPAWN_HEADING,
  speakerSpot,
  talkSpot,
  towardFor,
  type Speaker,
  type Vec2,
} from "./layout";
import { nearestWithin } from "./movement";
import { INTERACT_POINTS, type InteractTarget } from "./sites";
import { sceneLook, type Display, type Phase, type SceneLook, type Weather } from "./sky";

export interface Motion {
  position: Vec2;
  heading: number;
  target: Vec2 | null;
  route: Vec2[];
  talkOnArrival: Speaker | null;
  keys: Set<string>;
}

export interface ViewYaw {
  yaw: number;
  from: number;
  to: number | null;
  t: number;
  duration: number;
}

export const TURN_SECONDS = 0.3;

export function easeView(view: ViewYaw, target: number, duration: number, dir: -1 | 0 | 1 = 0) {
  let delta = wrapAngle(target - view.yaw);
  if (dir > 0 && delta < 0) delta += 2 * Math.PI;
  if (dir < 0 && delta > 0) delta -= 2 * Math.PI;
  Object.assign(view, { from: view.yaw, to: view.yaw + delta, t: 0, duration });
}

export type DialogLines = "first" | "again";

export interface HubDialog {
  who: Speaker;
  lines: DialogLines;
}

export interface HubSky {
  phase: Phase;
  weather: Weather | null;
  failed: boolean;
  display: Display;
  look: SceneLook;
}

export interface HubState {
  nearby: InteractTarget | null;
  dialog: HubDialog | null;
  met: Partial<Record<Speaker, number>>;
  sheetInset: number;
  sky: HubSky;
  motion: Motion;
  view: ViewYaw;
  rotated: boolean;
  wake: () => void;
  sceneUp: boolean;

  setNearby: (target: InteractTarget | null) => void;
  openDialog: (who: Speaker) => void;
  closeDialog: () => void;
  talkTo: (who: Speaker) => void;
  placePlayer: (position: Vec2, heading: number) => void;
  walkTo: (goal: Vec2) => void;
  setSheetInset: (px: number) => void;
  setPhase: (phase: Phase) => void;
  setWeather: (weather: Weather | null) => void;
  setDisplay: (display: Display) => void;
  rotateView: (dir: -1 | 0 | 1) => void;
  setRotated: (rotated: boolean) => void;
  resetView: () => void;
  setWake: (wake: (() => void) | null) => void;
}

const noop = () => undefined;

export function createHubStore() {
  return createStore<HubState>()((set, get) => {
    const setSky = (change: Partial<Omit<HubSky, "look">>) => {
      const sky = get().sky;
      const next = { ...sky, ...change };
      if (
        next.phase === sky.phase &&
        next.weather === sky.weather &&
        next.display === sky.display &&
        next.failed === sky.failed
      )
        return;
      const look = sceneLook(next.display, next.phase, next.weather?.condition ?? null);
      const same = (Object.keys(look) as (keyof SceneLook)[]).every((k) => look[k] === sky.look[k]);
      set({ sky: { ...next, look: same ? sky.look : look } });
      if (!same) get().wake();
    };
    return {
      nearby: null,
      dialog: null,
      met: {},
      sheetInset: 0,
      sky: {
        phase: "day",
        weather: null,
        failed: false,
        display: "live",
        look: sceneLook("live", "day", null),
      },
      motion: {
        position: { ...SPAWN },
        heading: SPAWN_HEADING,
        target: null,
        route: [],
        talkOnArrival: null,
        keys: new Set(),
      },
      view: { yaw: HOME_YAW, from: HOME_YAW, to: null, t: 0, duration: 0 },
      rotated: false,
      wake: noop,
      sceneUp: false,

      setNearby: (nearby) => {
        if (nearby !== get().nearby) set({ nearby });
      },
      openDialog: (who) => {
        if (get().dialog) return;
        set({ dialog: { who, lines: get().met[who] ? "again" : "first" } });
        get().wake();
      },
      closeDialog: () => {
        const { dialog, met } = get();
        if (dialog) {
          set({
            dialog: null,
            met: { ...met, [dialog.who]: (met[dialog.who] ?? 0) + 1 },
            sheetInset: 0,
          });
        }
        get().wake();
      },
      talkTo: (who) => {
        const spot = speakerSpot(who);
        const talk = talkSpot(who);
        get().placePlayer(talk, Math.atan2(spot.x - talk.x, spot.z - talk.z));
        get().openDialog(who);
      },
      placePlayer: (position, heading) => {
        const { motion } = get();
        motion.position = { ...position };
        motion.heading = heading;
        motion.target = null;
        motion.route = [];
        motion.talkOnArrival = null;
        motion.keys.clear();
        get().setNearby(nearestWithin(position, INTERACT_POINTS, INTERACT_RADIUS)?.id ?? null);
        get().wake();
      },
      walkTo: (goal) => {
        const { motion } = get();
        const [next, ...rest] = routeTo(motion.position, goal, towardFor(get().view.yaw));
        motion.target = next ?? null;
        motion.route = rest;
        motion.talkOnArrival = null;
        motion.keys.clear();
        get().wake();
      },
      setSheetInset: (sheetInset) => {
        if (sheetInset !== get().sheetInset) {
          set({ sheetInset });
          get().wake();
        }
      },
      setPhase: (phase) => setSky({ phase }),
      setWeather: (weather) => {
        const old = get().sky.weather;
        if (!weather) {
          if (!old) setSky({ failed: true });
          return;
        }
        const same =
          old?.condition === weather.condition &&
          old.temperature_c === weather.temperature_c &&
          old.updated_at === weather.updated_at;
        if (!same) setSky({ weather, failed: false });
      },
      setDisplay: (display) => setSky({ display }),
      rotateView: (dir) => {
        const { view } = get();
        const target = dir === 0 ? HOME_YAW : nextIsoYaw(view.to ?? view.yaw, dir);
        easeView(view, target, TURN_SECONDS, dir);
        get().wake();
      },
      setRotated: (rotated) => {
        if (rotated !== get().rotated) set({ rotated });
      },
      resetView: () => {
        Object.assign(get().view, { yaw: HOME_YAW, to: null });
        get().setRotated(false);
      },
      setWake: (wake) => set({ wake: wake ?? noop, sceneUp: wake !== null }),
    };
  });
}

export type HubStore = ReturnType<typeof createHubStore>;

export const hubStore = createHubStore();

export function useHub<T>(selector: (state: HubState) => T): T {
  return useStore(hubStore, selector);
}
