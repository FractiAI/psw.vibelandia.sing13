import { create } from 'zustand';

export type LibrettoKind = 'script' | 'discharge';

export interface LibrettoPost {
  id: string;
  author: string;
  kind: LibrettoKind;
  text?: string;
  /** Object URL for uploaded / recorded snippet */
  audioUrl?: string;
  durationSec: number;
  created: number;
}

const MAX_DISCHARGE = 13;

interface LibrettoState {
  posts: LibrettoPost[];
  addScriptLine: (author: string, text: string) => void;
  addDischarge: (author: string, file: Blob, durationSec: number) => void;
}

export const useLibrettoStore = create<LibrettoState>((set) => ({
  posts: [
    {
      id: 'seed-1',
      author: 'Quartermaster',
      kind: 'script',
      text: 'All hands — the Solenoid holds until Fair Exchange clears.',
      durationSec: 0,
      created: Date.now() - 120_000,
    },
  ],
  addScriptLine: (author, text) =>
    set((s) => ({
      posts: [
        ...s.posts,
        {
          id: crypto.randomUUID(),
          author,
          kind: 'script',
          text,
          durationSec: 0,
          created: Date.now(),
        },
      ],
    })),
  addDischarge: (author, file, durationSec) => {
    const d = Math.min(MAX_DISCHARGE, Math.max(0.5, durationSec));
    const url = URL.createObjectURL(file);
    set((s) => ({
      posts: [
        ...s.posts,
        {
          id: crypto.randomUUID(),
          author,
          kind: 'discharge',
          audioUrl: url,
          durationSec: d,
          created: Date.now(),
        },
      ],
    }));
  },
}));
