import { useLayoutEffect } from "react";

import type { Place } from "~/features/theme/schema";

import { forecastUrl, parseForecast, phaseAt, readDisplay } from "./sky";
import { hubStore } from "./store";

const PHASE_EVERY_MS = 60_000;
export const WEATHER_EVERY_MS = 30 * 60_000;
export const WEATHER_RETRY_MS = 2 * 60_000;
export const FETCH_TIMEOUT_MS = 60_000;

export function useSkyClock(place: Pick<Place, "lat" | "lon">) {
  const { lat, lon } = place;
  useLayoutEffect(() => {
    delete document.documentElement.dataset.sky;
    const store = hubStore.getState();
    const tick = () => store.setPhase(phaseAt(Date.now(), { lat, lon }));
    store.setDisplay(readDisplay());
    tick();
    const clock = window.setInterval(tick, PHASE_EVERY_MS);

    let controller: AbortController | null = null;
    let timer: number | undefined;
    let stopped = false;
    let due = false;
    const visible = () => document.visibilityState === "visible";
    const later = (ms: number) => {
      timer = window.setTimeout(fetchWeather, ms);
    };
    function fetchWeather() {
      if (!visible()) {
        due = true;
        return;
      }
      const request = new AbortController();
      controller = request;
      const timeout = window.setTimeout(() => request.abort(), FETCH_TIMEOUT_MS);
      void fetch(forecastUrl({ lat, lon }), {
        signal: request.signal,
        referrerPolicy: "no-referrer",
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((json: unknown) => parseForecast(json, Date.now()))
        .catch(() => null)
        .then((weather) => {
          window.clearTimeout(timeout);
          if (stopped) return;
          store.setWeather(weather);
          later(weather ? WEATHER_EVERY_MS : WEATHER_RETRY_MS);
        });
    }
    const onVisibility = () => {
      if (!visible()) return;
      tick();
      if (due) {
        due = false;
        fetchWeather();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    fetchWeather();
    return () => {
      stopped = true;
      window.clearInterval(clock);
      window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [lat, lon]);
}
