import { useUnifiedFeed } from '@/feed/store';

type PaperPipeResponse = {
  ok?: boolean;
  events?: unknown[];
};

/** Pull featured / PRA-published whitepapers into the Collaborate timeline. */
export async function syncPublishedPapers(): Promise<{ ingested: number; total: number }> {
  const ingestPayload = useUnifiedFeed.getState().ingestPayload;
  try {
    const res = await fetch('/api/lattice-collaborate-feed?papers=1&sinceDays=21', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { ingested: 0, total: 0 };
    const data = (await res.json()) as PaperPipeResponse;
    const events = Array.isArray(data.events) ? data.events : [];
    let ingested = 0;
    const before = useUnifiedFeed.getState().items.length;
    for (const ev of events) {
      const item = ingestPayload(ev);
      if (item) ingested += 1;
    }
    const after = useUnifiedFeed.getState().items.length;
    return { ingested: Math.max(0, after - before), total: events.length };
  } catch {
    return { ingested: 0, total: 0 };
  }
}
