/**
 * Sync shared Collaborate DMs from the center pipe into the edge timeline.
 * Rewrites actor to "You" when fromPeerId matches the signed-in seat.
 */
import { useLatticeStore } from '@/store';
import { useUnifiedFeed } from '@/feed/store';
import {
  peerHueForId,
  peerNameForId,
  resolveClientCollabPeerId,
} from '@/feed/seatIdentity';

export type SharedDmEnvelope = {
  id?: string;
  kind?: string;
  fromPeerId?: string;
  threadPeerId?: string;
  text?: string;
  body?: string;
  createdAt?: string;
};

type DmsResponse = {
  ok?: boolean;
  myPeerId?: string;
  dms?: SharedDmEnvelope[];
};

export function rewriteSharedDmForSeat(
  raw: SharedDmEnvelope,
  myPeerId: string,
): Record<string, unknown> | null {
  const id = typeof raw.id === 'string' ? raw.id : '';
  const fromPeerId = typeof raw.fromPeerId === 'string' ? raw.fromPeerId : '';
  const other = typeof raw.threadPeerId === 'string' ? raw.threadPeerId : '';
  const text = String(raw.text ?? raw.body ?? '').trim();
  if (!id || !fromPeerId || !other || !text) return null;
  if (fromPeerId !== myPeerId && other !== myPeerId) return null;

  const isMine = fromPeerId === myPeerId;
  const threadPeerId = isMine ? other : fromPeerId;

  return {
    id,
    type: 'chat',
    platform: 'lattice',
    actor: isMine ? 'You' : peerNameForId(fromPeerId),
    body: text,
    threadPeerId,
    presenceHue: isMine ? 'gold' : peerHueForId(fromPeerId),
    createdAt:
      typeof raw.createdAt === 'string' && raw.createdAt
        ? raw.createdAt
        : new Date().toISOString(),
  };
}

/** POST one DM to the shared pipe. Returns server event id on success. */
export async function postCollaborateDm(opts: {
  id: string;
  text: string;
  threadPeerId: string;
  createdAt?: string;
}): Promise<{ ok: boolean; duplicate?: boolean }> {
  const email = useLatticeStore.getState().userEmail.trim();
  if (!email) return { ok: false };
  try {
    const res = await fetch('/api/lattice-collaborate-feed?dms=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-lattice-email': email,
      },
      body: JSON.stringify({
        id: opts.id,
        text: opts.text,
        threadPeerId: opts.threadPeerId,
        createdAt: opts.createdAt || new Date().toISOString(),
      }),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { ok?: boolean; duplicate?: boolean };
    return { ok: Boolean(data.ok), duplicate: Boolean(data.duplicate) };
  } catch {
    return { ok: false };
  }
}

/** Pull shared DMs for the signed-in seat into the local feed store. */
export async function syncCollaborateDms(): Promise<{ ingested: number; total: number }> {
  const email = useLatticeStore.getState().userEmail.trim();
  const myPeerId = resolveClientCollabPeerId(email);
  if (!email || !myPeerId) return { ingested: 0, total: 0 };

  const ingestPayload = useUnifiedFeed.getState().ingestPayload;
  try {
    const res = await fetch('/api/lattice-collaborate-feed?dms=1', {
      headers: {
        Accept: 'application/json',
        'x-lattice-email': email,
      },
    });
    if (!res.ok) return { ingested: 0, total: 0 };
    const data = (await res.json()) as DmsResponse;
    const dms = Array.isArray(data.dms) ? data.dms : [];
    const before = useUnifiedFeed.getState().items.length;
    for (const raw of dms) {
      const rewritten = rewriteSharedDmForSeat(raw, myPeerId);
      if (rewritten) ingestPayload(rewritten);
    }
    const after = useUnifiedFeed.getState().items.length;
    return { ingested: Math.max(0, after - before), total: dms.length };
  } catch {
    return { ingested: 0, total: 0 };
  }
}

export function newClientDmId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `dm_${crypto.randomUUID()}`;
  }
  return `dm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
