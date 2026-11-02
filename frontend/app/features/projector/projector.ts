import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

export const PROJECTOR_PARAM = "chieu";

export const PROJECTOR_CLASS = "chieu";

export const PROJECTOR_SHARE = 40;

export function useProjector(): { on: boolean; exit: () => void } {
  const [params, setParams] = useSearchParams();
  const on = params.get(PROJECTOR_PARAM) === "1";
  const exit = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(PROJECTOR_PARAM);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setParams]);
  return { on, exit };
}

export function useProjectorClass(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const root = document.documentElement;
    root.classList.add(PROJECTOR_CLASS);
    return () => root.classList.remove(PROJECTOR_CLASS);
  }, [on]);
}
