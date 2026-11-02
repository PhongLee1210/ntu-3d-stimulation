import { useEffect, useState } from "react";

export function useSettled<T>(promise: Promise<T>): T | undefined {
  const [settled, setSettled] = useState<{ promise: Promise<T>; value: T } | null>(null);
  useEffect(() => {
    let live = true;
    void promise.then((value) => {
      if (live) setSettled({ promise, value });
    });
    return () => {
      live = false;
    };
  }, [promise]);
  return settled?.promise === promise ? settled.value : undefined;
}

export function useDelayedFlag(active: boolean, ms: number): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setElapsed(true), ms);
    return () => {
      window.clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, ms]);
  return active && elapsed;
}
