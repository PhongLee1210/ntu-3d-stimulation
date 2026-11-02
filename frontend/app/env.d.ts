interface ImportMetaEnv {
  readonly VITE_DEFAULT_THEME?: string;
  readonly VITE_THEME_PACKS?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
