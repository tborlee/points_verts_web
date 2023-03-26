interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_MAPBOX_USERNAME: string;
  readonly VITE_MAPBOX_LIGHT_STYLE: string;
  readonly VITE_MAPBOX_DARK_STYLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}