/// <reference types="vite/client" />

interface Window {
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
}

interface ImportMetaEnv {
  readonly VITE_CAPTAIN_PASSPHRASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
