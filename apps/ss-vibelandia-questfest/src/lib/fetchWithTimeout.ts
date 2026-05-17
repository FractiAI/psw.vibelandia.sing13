const DEFAULT_MS = 3_000;

/** fetch that rejects on timeout (AbortError) instead of hanging forever. */
export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  ms = DEFAULT_MS,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchJsonWithTimeout(
  url: string,
  ms = DEFAULT_MS,
): Promise<unknown | null> {
  try {
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, ms);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
