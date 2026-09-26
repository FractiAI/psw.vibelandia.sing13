/**
 * Safe edge localStorage for Lattice Chat persist.
 * Quota blowups (often after heavy doodle + long transcripts) must not crash the tab mid-type.
 *
 * Pure module — no zustand import — so root vitest can cover prune helpers without app deps.
 */

export const LATTICE_EDGE_STORAGE_KEY = 'lattice-v1618-edge';

/** Soft ceiling before we proactively prune — stays under typical origin quotas with doodle wall. */
export const LATTICE_EDGE_BLOB_BUDGET_CHARS = 600_000;

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

/**
 * Fit a persist blob under budget by successively keeping fewer threads.
 * Returns null only when the blob is unparsable / empty of threads.
 */
export function fitPersistedEdgeBlob(
  raw: string,
  budgetChars = LATTICE_EDGE_BLOB_BUDGET_CHARS,
): string | null {
  if (!raw) return null;
  if (raw.length <= budgetChars) return raw;
  for (const keep of [12, 8, 6, 4, 2, 1]) {
    const pruned = prunePersistedEdgeBlob(raw, keep);
    if (pruned && pruned.length <= budgetChars) return pruned;
    if (pruned && keep === 1) return pruned;
  }
  return null;
}

function writeEdgeValue(name: string, value: string): void {
  const fitted = fitPersistedEdgeBlob(value) ?? value;
  try {
    localStorage.setItem(name, fitted);
    return;
  } catch (err) {
    if (!isQuotaError(err)) {
      console.warn('[lattice-chat] edge persist failed', err);
      return;
    }
  }
  // Quota: prune harder, then nuclear clear of this key only (BYOK keys untouched).
  try {
    const pruned = prunePersistedEdgeBlob(fitted, 6);
    if (pruned) {
      localStorage.setItem(name, pruned);
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    localStorage.removeItem(name);
    const minimal = prunePersistedEdgeBlob(fitted, 2);
    if (minimal) localStorage.setItem(name, minimal);
  } catch (err) {
    console.warn('[lattice-chat] edge persist quota — dropped chat cache to keep typing alive', err);
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
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
    writeEdgeValue(name, value);
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
