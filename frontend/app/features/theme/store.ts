import { createStore } from "zustand";

import { THEME_OVERRIDE_ID, THEME_STORAGE_KEY, themeStylesheetUrl } from "./paths";
import type { ThemeManifest, ThemeSummary } from "./schema";

export interface ThemeCatalog {
  themes: ThemeSummary[];
  defaultId: string;
  manifests: Record<string, ThemeManifest>;
}

export interface ThemeState extends ThemeCatalog {
  activeId: string;
  setTheme: (id: string) => void;
  cycleTheme: () => void;
  restoreSavedTheme: () => void;
}

export type ThemeStore = ReturnType<typeof createThemeStore>;

function readSavedTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveTheme(id: string): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {}
}

function applyToDocument(id: string, defaultId: string): void {
  document.documentElement.setAttribute("data-theme", id);
  const existing = document.getElementById(THEME_OVERRIDE_ID);
  if (id === defaultId) {
    existing?.remove();
    return;
  }
  const href = themeStylesheetUrl(id);
  if (existing instanceof HTMLLinkElement) {
    if (existing.getAttribute("href") !== href) existing.setAttribute("href", href);
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.id = THEME_OVERRIDE_ID;
  link.href = href;
  document.head.appendChild(link);
}

export function createThemeStore(catalog: ThemeCatalog) {
  return createStore<ThemeState>()((set, get) => ({
    ...catalog,
    activeId: catalog.defaultId,

    setTheme: (id) => {
      if (!(id in get().manifests)) return;
      applyToDocument(id, get().defaultId);
      saveTheme(id);
      if (id !== get().activeId) set({ activeId: id });
    },

    cycleTheme: () => {
      const { themes, activeId, setTheme } = get();
      if (themes.length < 2) return;
      const index = themes.findIndex((theme) => theme.id === activeId);
      const next = themes[(index + 1) % themes.length];
      if (next) setTheme(next.id);
    },

    restoreSavedTheme: () => {
      const saved = readSavedTheme();
      if (saved && saved !== get().activeId && saved in get().manifests) {
        applyToDocument(saved, get().defaultId);
        set({ activeId: saved });
      }
    },
  }));
}
