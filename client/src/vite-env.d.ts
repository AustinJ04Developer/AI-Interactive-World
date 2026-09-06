/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SERVER_URL?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_EXHIBITION_NAME?: string;
  readonly VITE_EXPO_MODE_TURNOVER_SEC?: string;
  readonly VITE_AUDIO_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
