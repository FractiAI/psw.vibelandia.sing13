/**
 * Safe edge localStorage for Lattice Chat persist.
 * Quota blowups (often after heavy doodle + long transcripts) must not crash the tab mid-type.
 *
 * Pure module — no zustand import — so root vitest can cover prune helpers without app deps.
 */

export const LATTICE_EDGE_STORAGE_KEY = 'lattice-v1618-edge';

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: number | string };
  return (
    e.name === 'QuotaExceededError' ||
    e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    e.code === 22 ||
    e.code === 1014
  );
}

/** Drop oldest threads from a zustand persist JSON blob and rewrite. */
export function prunePersistedEdgeBlob(raw: string, keepThreads = 8): string | null {
  try {
    const parsed = JSON.parse(raw) as {
      state?: { threads?: Array<{ updatedAt?: string }>; [k: string]: unknown };
      version?: number;
    };
    const threads = Array.isArray(parsed?.state?.threads) ? [...parsed.state.threads] : [];
    if (!threads.length) return null;
    threads.sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
    );
    parsed.state = {
      ...(parsed.state || {}),
      threads: threads.slice(0, Math.max(1, keepThreads)),
    };
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

/** Zustand StateStorage-shaped adapter (duck-typed; no zustand import). */
export const latticeEdgeStateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
      return;
    } catch (err) {
      if (!isQuotaError(err)) {
        console.warn('[lattice-chat] edge persist failed', err);
        return;
      }
    }
    // Quota: prune in place, then nuclear clear of this key only (BYOK keys untouched).
    try {
      const pruned = prunePersistedEdgeBlob(value, 6);
      if (pruned) {
        localStorage.setItem(name, pruned);
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      localStorage.removeItem(name);
      const minimal = prunePersistedEdgeBlob(value, 2);
      if (minimal) localStorage.setItem(name, minimal);
    } catch (err) {
      console.warn('[lattice-chat] edge persist quota — dropped chat cache to keep typing alive', err);
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
