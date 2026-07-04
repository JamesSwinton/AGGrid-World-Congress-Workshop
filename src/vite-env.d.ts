/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** AG Grid + AG Charts Enterprise trial key (optional — see README > Setup). */
  readonly VITE_AG_GRID_LICENSE_KEY?: string;
  /** AG Studio trial key (optional — separately licensed from Grid/Charts). */
  readonly VITE_AG_STUDIO_LICENSE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
