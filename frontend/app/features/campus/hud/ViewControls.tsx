import { CompassIcon, RotateCcwIcon, RotateCwIcon } from "~/components/ui/icons";

import { HOME_YAW } from "../camera";
import { viewNeedle } from "../scene/labels";
import { hubStore, useHub } from "../store";
import { STAGE, useSceneLoad } from "./sceneLoad";

const BUTTON = "grid size-11 place-items-center text-fg focus-visible:-outline-offset-4";
const LIVE = "cursor-pointer hover:bg-subtle";
const LEFT = "Xoay ngược chiều kim đồng hồ";
const HOME = "Về góc nhìn mặc định";
const RIGHT = "Xoay theo chiều kim đồng hồ";

const keepFocus = (event: { preventDefault: () => void }) => event.preventDefault();

const registerNeedle = (element: SVGGElement | null) => {
  viewNeedle.element = element;
  if (element) {
    const { yaw } = hubStore.getState().view;
    element.style.transform = `rotate(${(yaw - HOME_YAW).toFixed(4)}rad)`;
  }
};

export function ViewControls() {
  const rotated = useHub((state) => state.rotated);
  const ready = useSceneLoad((s) => s.stage >= STAGE.done);
  if (!ready) return null;
  const rotate = (dir: -1 | 0 | 1) => () => hubStore.getState().rotateView(dir);
  return (
    <div
      role="group"
      aria-label="Góc nhìn"
      className="absolute right-4 bottom-20 z-20 flex rounded-sm border border-line-strong bg-surface lg:right-6 lg:bottom-6"
    >
      <button
        type="button"
        aria-label={LEFT}
        title={`${LEFT} (phím ,)`}
        onMouseDown={keepFocus}
        onClick={rotate(-1)}
        className={`${BUTTON} ${LIVE}`}
      >
        <RotateCcwIcon className="size-5" />
      </button>
      <button
        type="button"
        aria-label={HOME}
        title={HOME}
        aria-disabled={!rotated}
        onMouseDown={keepFocus}
        onClick={rotated ? rotate(0) : undefined}
        className={`${BUTTON} border-x border-line ${rotated ? LIVE : "opacity-50"}`}
      >
        <CompassIcon className="size-5" needleRef={registerNeedle} />
      </button>
      <button
        type="button"
        aria-label={RIGHT}
        title={`${RIGHT} (phím .)`}
        onMouseDown={keepFocus}
        onClick={rotate(1)}
        className={`${BUTTON} ${LIVE}`}
      >
        <RotateCwIcon className="size-5" />
      </button>
    </div>
  );
}
