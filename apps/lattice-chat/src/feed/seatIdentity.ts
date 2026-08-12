/** Map signed-in Lattice email → Collaborate seat peer id (client mirror of server). */
import { isCreatorEmail, normalizeEmail } from '@/access';
import { WORKSPACE_PEERS } from '@/feed/seed';

const GUEST_SEATS: Record<string, string> = {
  'danielarifriedman@gmail.com': 'peer_daniel',
};

export function resolveClientCollabPeerId(email: string | null | undefined): string | null {
  const e = normalizeEmail(email || '');
  if (!e) return null;
  if (GUEST_SEATS[e]) return GUEST_SEATS[e];
  if (isCreatorEmail(e)) return 'peer_valet_pru';
  return null;
}

export function peerNameForId(peerId: string): string {
  return WORKSPACE_PEERS.find((p) => p.id === peerId)?.name || 'Peer';
}

export function peerHueForId(peerId: string): 'green' | 'purple' | 'gold' | 'cyan' {
  return WORKSPACE_PEERS.find((p) => p.id === peerId)?.hue || 'purple';
}

export type SharedDmEnvelope = {
  id?: string;
  kind?: string;
  fromPeerId?: string;
  threadPeerId?: string;
  text?: string;
  body?: string;
  createdAt?: string;
};

/** Rewrite a shared-pipe DM into a client ingest envelope for one seat. */
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
