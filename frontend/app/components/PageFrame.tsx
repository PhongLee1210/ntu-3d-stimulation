import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigation, useRevalidator } from "react-router";

import { buttonClass } from "~/components/ui/button";
import { ChevronLeftIcon } from "~/components/ui/icons";
import { useProjector, useProjectorClass } from "~/features/projector/projector";
import { ThemeToggle } from "~/features/theme/ThemeToggle";
import { AUTHOR } from "~/lib/site";

const WIDTH = { "3xl": "max-w-3xl", "6xl": "max-w-6xl" } as const;

function focusHeading() {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

export function PageFrame({
  back,
  backLabel,
  width = "3xl",
  children,
}: {
  back: string;
  backLabel: string;
  width?: keyof typeof WIDTH;
  children: ReactNode;
}) {
  const box = `mx-auto ${WIDTH[width]} px-4 sm:px-6`;
  const { key, pathname } = useLocation();
  const [firstPage] = useState(key === "default");
  useEffect(() => {
    if (!firstPage) focusHeading();
  }, [pathname, firstPage]);

  const revalidation = useRevalidator().state;
  const was = useRef(revalidation);
  useEffect(() => {
    if (was.current === "loading" && document.activeElement === document.body) focusHeading();
    was.current = revalidation;
  }, [revalidation]);

  const loading = useNavigation().state === "loading" || revalidation === "loading";

  const projector = useProjector();
  useProjectorClass(projector.on);

  return (
    <>
      <header className="h-16 border-b border-line bg-surface">
        <div className={`${box} flex h-full items-center justify-between gap-4`}>
          <Link to={back} className={buttonClass("inline")}>
            <ChevronLeftIcon />
            {backLabel}
          </Link>
          <div className="flex items-center gap-2">
            {projector.on && (
              <button type="button" onClick={projector.exit} className={buttonClass("secondary")}>
                Thoát chế độ chiếu
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
        <p role="status" className="sr-only">
          {loading ? "Đang tải trang…" : ""}
        </p>
        {loading && (
          <div
            data-page-loading
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-50 h-1 animate-appear overflow-hidden"
          >
            <div className="h-full w-1/3 animate-poster-bar bg-brand motion-reduce:w-full motion-reduce:animate-none chieu:w-full chieu:animate-none" />
          </div>
        )}
      </header>
      <main aria-busy={loading || undefined} className={`${box} py-10`}>
        {children}
      </main>
      <footer className={`${box} pb-10`}>
        <p className="border-t border-line pt-5 text-xs text-fg-muted">V-Game · {AUTHOR}</p>
      </footer>
    </>
  );
}
